-- Create service_price_tiers table for multiple tier options per service type
CREATE TABLE public.service_price_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  min_price_cents INTEGER NOT NULL CHECK (min_price_cents >= 0),
  max_price_cents INTEGER NOT NULL CHECK (max_price_cents > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_price_range CHECK (max_price_cents > min_price_cents)
);

-- Add columns to creator_services for storing selected range
ALTER TABLE public.creator_services
ADD COLUMN min_price_cents INTEGER,
ADD COLUMN max_price_cents INTEGER,
ADD COLUMN price_tier_id UUID REFERENCES public.service_price_tiers(id);

-- Enable RLS on service_price_tiers
ALTER TABLE public.service_price_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read tiers
CREATE POLICY "Anyone can view service price tiers"
ON public.service_price_tiers
FOR SELECT
USING (true);

-- Only admins can modify tiers
CREATE POLICY "Admins can insert service price tiers"
ON public.service_price_tiers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update service price tiers"
ON public.service_price_tiers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete service price tiers"
ON public.service_price_tiers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Seed default tiers based on existing service types
INSERT INTO public.service_price_tiers (service_type, tier_name, min_price_cents, max_price_cents, sort_order) VALUES
-- Meet & Greet tiers
('meet_greet', 'Standard', 30000, 50000, 1),
('meet_greet', 'Premium', 50000, 80000, 2),
('meet_greet', 'VIP', 80000, 120000, 3),
-- Workshop tiers
('workshop', 'Basic', 50000, 80000, 1),
('workshop', 'Advanced', 80000, 120000, 2),
('workshop', 'Premium', 120000, 200000, 3),
-- Competition Event tiers
('competition', 'Standard', 80000, 150000, 1),
('competition', 'Premium', 150000, 250000, 2),
('competition', 'Elite', 250000, 400000, 3),
-- Brand Activation tiers
('brand_activation', 'Basic', 100000, 200000, 1),
('brand_activation', 'Standard', 200000, 350000, 2),
('brand_activation', 'Premium', 350000, 500000, 3),
-- Nightlife Appearance tiers
('nightlife', 'Standard', 50000, 100000, 1),
('nightlife', 'Premium', 100000, 200000, 2),
('nightlife', 'VIP', 200000, 350000, 3),
-- Private Event tiers
('private_event', 'Intimate', 80000, 150000, 1),
('private_event', 'Standard', 150000, 250000, 2),
('private_event', 'Luxury', 250000, 400000, 3),
-- Content Collaboration tiers
('content_collab', 'Basic', 20000, 50000, 1),
('content_collab', 'Standard', 50000, 100000, 2),
('content_collab', 'Premium', 100000, 200000, 3),
-- Custom Experience tiers
('custom', 'Standard', 50000, 100000, 1),
('custom', 'Premium', 100000, 200000, 2),
('custom', 'Bespoke', 200000, 500000, 3);

-- Create index for faster lookups
CREATE INDEX idx_service_price_tiers_service_type ON public.service_price_tiers(service_type);
CREATE INDEX idx_service_price_tiers_enabled ON public.service_price_tiers(is_enabled) WHERE is_enabled = true;