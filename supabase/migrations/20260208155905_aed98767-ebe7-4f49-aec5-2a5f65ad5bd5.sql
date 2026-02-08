ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS brand_plan text NOT NULL DEFAULT 'free';