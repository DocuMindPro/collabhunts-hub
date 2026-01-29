-- Create service_price_ranges table for admin-controlled pricing limits
CREATE TABLE public.service_price_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  min_price_cents INTEGER NOT NULL DEFAULT 10000,
  max_price_cents INTEGER NOT NULL DEFAULT 100000,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.service_price_ranges ENABLE ROW LEVEL SECURITY;

-- Public read access (creators need to read ranges during signup)
CREATE POLICY "Anyone can view service price ranges"
ON public.service_price_ranges
FOR SELECT
USING (true);

-- Only admins can update (using user_roles table)
CREATE POLICY "Admins can update service price ranges"
ON public.service_price_ranges
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can insert
CREATE POLICY "Admins can insert service price ranges"
ON public.service_price_ranges
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete
CREATE POLICY "Admins can delete service price ranges"
ON public.service_price_ranges
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_service_price_ranges_updated_at
BEFORE UPDATE ON public.service_price_ranges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default service types with reasonable price ranges
INSERT INTO public.service_price_ranges (service_type, display_name, min_price_cents, max_price_cents, is_enabled)
VALUES
  ('meet_greet', 'Meet & Greet', 30000, 80000, true),
  ('workshop', 'Workshop', 50000, 120000, true),
  ('competition', 'Competition Event', 80000, 200000, true),
  ('brand_activation', 'Brand Activation', 100000, 300000, true),
  ('nightlife', 'Nightlife Appearance', 50000, 150000, true),
  ('private_event', 'Private Event', 80000, 250000, true),
  ('content_collab', 'Content Collaboration', 40000, 100000, true),
  ('custom', 'Custom Package', 20000, 500000, true);