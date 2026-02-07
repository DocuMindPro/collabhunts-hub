
-- Career positions table
CREATE TABLE public.career_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  salary_range TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_positions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active positions
CREATE POLICY "Anyone can view active positions"
  ON public.career_positions FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage positions"
  ON public.career_positions FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- Career applications table
CREATE TABLE public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.career_positions(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  cv_url TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (no auth required)
CREATE POLICY "Anyone can submit applications"
  ON public.career_applications FOR INSERT
  WITH CHECK (true);

-- Only admins can view/update applications
CREATE POLICY "Admins can manage applications"
  ON public.career_applications FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- Updated_at trigger for positions
CREATE TRIGGER update_career_positions_updated_at
  BEFORE UPDATE ON public.career_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_events_updated_at();

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('career-cvs', 'career-cvs', false);

-- Anyone can upload CVs
CREATE POLICY "Anyone can upload CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'career-cvs');

-- Admins can read CVs
CREATE POLICY "Admins can read CVs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'career-cvs' AND public.is_super_admin(auth.uid()));
