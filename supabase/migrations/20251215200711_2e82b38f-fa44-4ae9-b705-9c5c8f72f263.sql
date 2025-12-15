-- Site settings table for branding & SEO
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT NOT NULL CHECK (category IN ('branding', 'seo', 'social')),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID
);

-- Insert default settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
  -- Branding
  ('logo_primary_url', NULL, 'branding', 'Primary logo with wordmark'),
  ('logo_icon_url', NULL, 'branding', 'Icon-only version of logo'),
  ('favicon_url', '/favicon.ico', 'branding', 'Favicon for browser tab'),
  ('apple_touch_icon_url', NULL, 'branding', 'iOS home screen icon'),
  ('og_image_url', NULL, 'branding', 'Social sharing preview image (1200x630)'),
  -- SEO
  ('site_title', 'CollabHunts - Connect Brands with Creators', 'seo', 'Browser tab and search title'),
  ('meta_description', 'The easiest way for brands to find and collaborate with content creators and influencers.', 'seo', 'Search result description'),
  ('keywords', 'influencer marketing, content creators, brand collaborations, UGC', 'seo', 'SEO keywords'),
  -- Social
  ('og_title', 'CollabHunts - Connect Brands with Creators', 'social', 'Social share title'),
  ('og_description', 'Find verified creators ready to collaborate with your brand.', 'social', 'Social share description'),
  ('twitter_card_type', 'summary_large_image', 'social', 'Twitter card display type');

-- RLS policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for Logo component)
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));