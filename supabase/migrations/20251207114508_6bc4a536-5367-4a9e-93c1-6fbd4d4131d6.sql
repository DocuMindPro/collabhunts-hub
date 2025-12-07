-- Create creator_portfolio_media table
CREATE TABLE public.creator_portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_portfolio_media ENABLE ROW LEVEL SECURITY;

-- Creators can manage their own portfolio media
CREATE POLICY "Creators can manage own portfolio media"
ON public.creator_portfolio_media
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.creator_profiles
  WHERE creator_profiles.id = creator_portfolio_media.creator_profile_id
  AND creator_profiles.user_id = auth.uid()
));

-- Public can view portfolio media of approved creators
CREATE POLICY "Public can view approved creator portfolio media"
ON public.creator_portfolio_media
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.creator_profiles
  WHERE creator_profiles.id = creator_portfolio_media.creator_profile_id
  AND creator_profiles.status = 'approved'
));

-- Create index for faster lookups
CREATE INDEX idx_portfolio_media_creator ON public.creator_portfolio_media(creator_profile_id);

-- Create portfolio-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('portfolio-media', 'portfolio-media', true, 104857600);

-- Storage policies for portfolio-media bucket
CREATE POLICY "Public can view portfolio media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Users can upload own portfolio media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own portfolio media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own portfolio media"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);