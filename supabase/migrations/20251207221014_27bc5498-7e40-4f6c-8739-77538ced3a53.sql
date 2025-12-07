-- Add demographic fields to creator_profiles for advanced filtering
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS ethnicity text,
ADD COLUMN IF NOT EXISTS primary_language text DEFAULT 'English',
ADD COLUMN IF NOT EXISTS secondary_languages text[] DEFAULT '{}'::text[];