
CREATE TABLE public.creator_tiktok_live_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  goes_live boolean NOT NULL DEFAULT false,
  monthly_revenue_range text,
  interest_in_going_live text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(creator_profile_id)
);

ALTER TABLE public.creator_tiktok_live_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage own tiktok insights"
  ON public.creator_tiktok_live_insights
  FOR ALL USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tiktok insights"
  ON public.creator_tiktok_live_insights
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
