-- Add open_to_invitations column to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN open_to_invitations boolean DEFAULT false;