-- Create function to deduct credits (admin only)
CREATE OR REPLACE FUNCTION public.deduct_credits(_user_id uuid, _amount integer, _description text DEFAULT 'Admin credit deduction')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current_balance INTEGER;
  _new_balance INTEGER;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get current balance
  SELECT balance INTO _current_balance
  FROM public.user_credits
  WHERE user_id = _user_id
  FOR UPDATE;

  IF _current_balance IS NULL THEN
    RAISE EXCEPTION 'User has no credits account';
  END IF;

  IF _current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient credits: user has %, trying to deduct %', _current_balance, _amount;
  END IF;

  -- Deduct credits
  UPDATE public.user_credits
  SET balance = balance - _amount
  WHERE user_id = _user_id
  RETURNING balance INTO _new_balance;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type, description, created_by)
  VALUES (_user_id, -_amount, _new_balance, 'credit_deduct', _description, auth.uid());

  RETURN _new_balance;
END;
$$;

-- Create function for admin to get user transactions
CREATE OR REPLACE FUNCTION public.get_user_transactions(_user_id uuid)
RETURNS TABLE (
  id uuid,
  amount integer,
  balance_after integer,
  transaction_type text,
  description text,
  created_at timestamptz,
  created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ct.id,
    ct.amount,
    ct.balance_after,
    ct.transaction_type,
    ct.description,
    ct.created_at,
    ct.created_by
  FROM public.credit_transactions ct
  WHERE ct.user_id = _user_id
    AND public.has_role(auth.uid(), 'admin')
  ORDER BY ct.created_at DESC
  LIMIT 100;
$$;