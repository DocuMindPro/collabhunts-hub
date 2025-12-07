-- Add brand preference columns for personalized onboarding
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS marketing_intent text,
ADD COLUMN IF NOT EXISTS monthly_budget_range text,
ADD COLUMN IF NOT EXISTS preferred_categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_platforms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;