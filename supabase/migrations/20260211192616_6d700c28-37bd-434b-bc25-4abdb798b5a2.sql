
-- Create deliverables table for per-platform content line items
CREATE TABLE public.creator_service_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_service_id UUID NOT NULL REFERENCES public.creator_services(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER,
  price_cents INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_service_deliverables ENABLE ROW LEVEL SECURITY;

-- Anyone can read deliverables (public profile data)
CREATE POLICY "Anyone can view deliverables"
  ON public.creator_service_deliverables
  FOR SELECT
  USING (true);

-- Creators can manage their own deliverables
CREATE POLICY "Creators can insert own deliverables"
  ON public.creator_service_deliverables
  FOR INSERT
  WITH CHECK (
    creator_service_id IN (
      SELECT cs.id FROM public.creator_services cs
      JOIN public.creator_profiles cp ON cs.creator_profile_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update own deliverables"
  ON public.creator_service_deliverables
  FOR UPDATE
  USING (
    creator_service_id IN (
      SELECT cs.id FROM public.creator_services cs
      JOIN public.creator_profiles cp ON cs.creator_profile_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete own deliverables"
  ON public.creator_service_deliverables
  FOR DELETE
  USING (
    creator_service_id IN (
      SELECT cs.id FROM public.creator_services cs
      JOIN public.creator_profiles cp ON cs.creator_profile_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_deliverables_service_id ON public.creator_service_deliverables(creator_service_id);
