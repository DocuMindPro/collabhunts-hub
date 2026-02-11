
-- Add stats update tracking columns to creator_profiles
ALTER TABLE public.creator_profiles
ADD COLUMN IF NOT EXISTS stats_last_confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS stats_update_required BOOLEAN NOT NULL DEFAULT false;
