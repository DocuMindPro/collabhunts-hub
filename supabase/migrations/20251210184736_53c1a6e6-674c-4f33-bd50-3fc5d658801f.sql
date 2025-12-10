-- Create platform_changelog table for tracking feature updates
CREATE TABLE public.platform_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_changelog ENABLE ROW LEVEL SECURITY;

-- Admins can manage changelog
CREATE POLICY "Admins can manage changelog"
ON public.platform_changelog
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published changelog entries
CREATE POLICY "Anyone can view published changelog"
ON public.platform_changelog
FOR SELECT
USING (is_published = true);

-- Add index for faster queries
CREATE INDEX idx_platform_changelog_published ON public.platform_changelog(is_published, published_at DESC);