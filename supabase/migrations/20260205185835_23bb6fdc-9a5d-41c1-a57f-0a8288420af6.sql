-- Phase 2: Creator Agreements Table
CREATE TABLE public.creator_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  template_type TEXT NOT NULL, -- 'unbox_review', 'social_boost', 'meet_greet', 'custom'
  content TEXT NOT NULL, -- The full agreement text
  deliverables JSONB DEFAULT '[]'::jsonb, -- Array of deliverables
  proposed_price_cents INTEGER NOT NULL,
  event_date DATE,
  event_time TEXT,
  duration_hours INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'declined', 'completed'
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Creators can view/manage their own agreements
CREATE POLICY "Creators can view their own agreements"
ON public.creator_agreements FOR SELECT
USING (
  creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Creators can create agreements"
ON public.creator_agreements FOR INSERT
WITH CHECK (
  creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Creators can update their own agreements"
ON public.creator_agreements FOR UPDATE
USING (
  creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies: Brands can view/respond to agreements sent to them
CREATE POLICY "Brands can view agreements sent to them"
ON public.creator_agreements FOR SELECT
USING (
  brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Brands can update agreements sent to them"
ON public.creator_agreements FOR UPDATE
USING (
  brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_creator_agreements_updated_at
BEFORE UPDATE ON public.creator_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for agreements
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_agreements;