-- Create ad_placements table for sponsorship/advertising system
CREATE TABLE public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id TEXT NOT NULL UNIQUE, -- e.g., 'home_hero_banner', 'influencers_sidebar'
  placement_name TEXT NOT NULL, -- Human-readable: "Home Page Hero Banner"
  page TEXT NOT NULL, -- 'home', 'creator', 'brand', 'influencers', 'campaigns'
  position TEXT NOT NULL, -- 'hero', 'sidebar', 'inline', 'footer'
  
  -- Advertiser info
  advertiser_name TEXT, -- Business or creator name
  advertiser_type TEXT DEFAULT 'external', -- 'brand', 'creator', 'external'
  image_url TEXT, -- Uploaded ad image
  link_url TEXT, -- Where clicking takes you
  link_type TEXT DEFAULT 'external', -- 'external', 'creator_profile', 'brand_website'
  
  -- Targeting
  target_creator_profile_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
  
  -- Status & Scheduling
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  notes TEXT -- Internal notes about the deal
);

-- Enable RLS
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage ads
CREATE POLICY "Admins can manage all ad placements"
ON public.ad_placements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active ads
CREATE POLICY "Anyone can view active ad placements"
ON public.ad_placements
FOR SELECT
USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_ad_placements_updated_at
BEFORE UPDATE ON public.ad_placements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default placement slots
INSERT INTO public.ad_placements (placement_id, placement_name, page, position) VALUES
('home_hero_banner', 'Home Page Hero Banner', 'home', 'hero'),
('home_cta_card', 'Home Page CTA Card', 'home', 'cta'),
('creator_brand_spotlight_1', 'Creator Page Brand Spotlight 1', 'creator', 'grid'),
('creator_brand_spotlight_2', 'Creator Page Brand Spotlight 2', 'creator', 'grid'),
('creator_brand_spotlight_3', 'Creator Page Brand Spotlight 3', 'creator', 'grid'),
('creator_brand_spotlight_4', 'Creator Page Brand Spotlight 4', 'creator', 'grid'),
('creator_featured_1', 'Creator Page Featured Creator 1', 'creator', 'featured'),
('creator_featured_2', 'Creator Page Featured Creator 2', 'creator', 'featured'),
('creator_featured_3', 'Creator Page Featured Creator 3', 'creator', 'featured'),
('brand_testimonial', 'Brand Page Testimonial', 'brand', 'testimonial'),
('influencers_sidebar', 'Influencers Page Sidebar', 'influencers', 'sidebar'),
('influencers_inline_1', 'Influencers Page Inline 1', 'influencers', 'inline'),
('influencers_inline_2', 'Influencers Page Inline 2', 'influencers', 'inline'),
('campaigns_banner', 'Campaigns Page Banner', 'campaigns', 'banner'),
('footer_sponsors', 'Footer Sponsors Row', 'all', 'footer');