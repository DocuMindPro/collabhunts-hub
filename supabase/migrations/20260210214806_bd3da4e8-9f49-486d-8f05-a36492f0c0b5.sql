
CREATE TABLE public.boost_interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  seen_by_admin BOOLEAN DEFAULT false
);

ALTER TABLE public.boost_interest_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can insert own boost interest"
  ON public.boost_interest_requests FOR INSERT
  WITH CHECK (creator_profile_id IN (
    SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can read all boost interests"
  ON public.boost_interest_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update boost interests"
  ON public.boost_interest_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
