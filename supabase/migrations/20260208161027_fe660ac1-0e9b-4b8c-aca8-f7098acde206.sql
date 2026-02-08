
-- Add messaging limit tracking columns to brand_profiles
ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS creators_messaged_this_month integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creators_messaged_reset_at timestamptz NOT NULL DEFAULT now();
