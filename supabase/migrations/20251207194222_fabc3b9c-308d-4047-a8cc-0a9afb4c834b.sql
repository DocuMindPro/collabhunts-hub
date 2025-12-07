-- Add columns for additional cover images
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS cover_image_url_2 TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_image_url_3 TEXT DEFAULT NULL;