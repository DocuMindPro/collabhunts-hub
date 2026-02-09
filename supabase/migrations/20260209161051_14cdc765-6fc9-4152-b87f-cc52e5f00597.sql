
-- Add AI draft usage tracking columns to brand_profiles
ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS ai_drafts_used_this_month integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_drafts_reset_at timestamptz NOT NULL DEFAULT now();
