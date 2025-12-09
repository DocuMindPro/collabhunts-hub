-- Add phone verification columns to brand_profiles
ALTER TABLE public.brand_profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false;