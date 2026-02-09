
CREATE TABLE public.quotation_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can insert own inquiries" ON public.quotation_inquiries
  FOR INSERT WITH CHECK (brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can view own inquiries" ON public.quotation_inquiries
  FOR SELECT USING (brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins full access" ON public.quotation_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
