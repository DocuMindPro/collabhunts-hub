-- Create creator featuring table
CREATE TABLE public.creator_featuring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('featured_badge', 'homepage_spotlight', 'category_boost', 'auto_popup')),
  category TEXT, -- For category_boost: 'food', 'fashion', etc.
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add featuring columns to creator_profiles
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS featuring_priority INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.creator_featuring ENABLE ROW LEVEL SECURITY;

-- Creators can view their own featuring records
CREATE POLICY "Creators can view own featuring"
ON public.creator_featuring
FOR SELECT
USING (
  creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  )
);

-- Creators can insert their own featuring records
CREATE POLICY "Creators can insert own featuring"
ON public.creator_featuring
FOR INSERT
WITH CHECK (
  creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  )
);

-- Public can view active featuring (for discovery page)
CREATE POLICY "Public can view active featuring"
ON public.creator_featuring
FOR SELECT
USING (is_active = true AND end_date > now());

-- Create index for efficient queries
CREATE INDEX idx_creator_featuring_active ON public.creator_featuring(creator_profile_id, is_active, end_date);
CREATE INDEX idx_creator_profiles_featured ON public.creator_profiles(is_featured, featuring_priority DESC);