-- Add disabled field to profiles for account suspension
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;

-- Add phone and notes columns for contact management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS notes text;