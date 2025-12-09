-- Add phone number columns to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false;