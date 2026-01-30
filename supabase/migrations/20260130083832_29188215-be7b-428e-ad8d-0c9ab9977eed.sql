-- User credits table (balance tracking)
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transaction history for full audit trail
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_add', 'credit_use', 'credit_refund', 'admin_adjustment')),
  description TEXT,
  reference_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits"
ON public.user_credits FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all credits"
ON public.user_credits FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update credits"
ON public.user_credits FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert credits"
ON public.user_credits FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view own transactions"
ON public.credit_transactions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to add credits (admin only, atomic operation)
CREATE OR REPLACE FUNCTION public.add_credits(
  _user_id UUID,
  _amount INTEGER,
  _description TEXT DEFAULT 'Admin credit addition'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance INTEGER;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Ensure user has a credits record
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update balance atomically
  UPDATE public.user_credits
  SET balance = balance + _amount
  WHERE user_id = _user_id
  RETURNING balance INTO _new_balance;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type, description, created_by)
  VALUES (_user_id, _amount, _new_balance, 'credit_add', _description, auth.uid());

  RETURN _new_balance;
END;
$$;

-- Function to use credits (deduct on wizard use)
CREATE OR REPLACE FUNCTION public.use_credits(
  _amount INTEGER,
  _description TEXT DEFAULT 'Wizard usage'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_balance INTEGER;
  _new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO _current_balance
  FROM public.user_credits
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF _current_balance IS NULL THEN
    RAISE EXCEPTION 'No credits account found';
  END IF;

  IF _current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', _current_balance, _amount;
  END IF;

  -- Deduct credits
  UPDATE public.user_credits
  SET balance = balance - _amount
  WHERE user_id = auth.uid()
  RETURNING balance INTO _new_balance;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type, description, created_by)
  VALUES (auth.uid(), -_amount, _new_balance, 'credit_use', _description, auth.uid());

  RETURN _new_balance;
END;
$$;

-- Function to get user's credit balance
CREATE OR REPLACE FUNCTION public.get_my_credits()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT balance FROM public.user_credits WHERE user_id = auth.uid()),
    0
  );
$$;

-- Auto-create credits record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Create credits record with 0 balance
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;