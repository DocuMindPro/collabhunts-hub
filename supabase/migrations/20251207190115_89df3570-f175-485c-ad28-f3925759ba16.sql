-- Add cover_image_url column to creator_profiles for the main hero/cover image
ALTER TABLE public.creator_profiles 
ADD COLUMN cover_image_url text;