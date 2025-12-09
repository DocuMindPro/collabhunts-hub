-- Table 1: Brand Storage Usage - tracks each brand's storage usage and limits
CREATE TABLE public.brand_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 0,
  extra_storage_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_profile_id)
);

-- Enable RLS
ALTER TABLE public.brand_storage_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_storage_usage
CREATE POLICY "Brands can view their own storage usage"
ON public.brand_storage_usage FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = brand_storage_usage.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can update their own storage usage"
ON public.brand_storage_usage FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = brand_storage_usage.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can view all storage usage"
ON public.brand_storage_usage FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all storage usage"
ON public.brand_storage_usage FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Table 2: Content Library - stores content metadata and rights management
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  creator_profile_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_r2_key TEXT,
  usage_rights_start TIMESTAMP WITH TIME ZONE,
  usage_rights_end TIMESTAMP WITH TIME ZONE,
  rights_type TEXT DEFAULT 'perpetual',
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_library
CREATE POLICY "Brands can view their own content"
ON public.content_library FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_library.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can insert their own content"
ON public.content_library FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_library.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can update their own content"
ON public.content_library FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_library.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can delete their own content"
ON public.content_library FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_library.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Creators can view content they are tagged in"
ON public.content_library FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.creator_profiles
  WHERE creator_profiles.id = content_library.creator_profile_id
  AND creator_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can view all content"
ON public.content_library FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all content"
ON public.content_library FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Table 3: Storage Purchases - tracks storage add-on purchases
CREATE TABLE public.storage_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  storage_amount_bytes BIGINT NOT NULL,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storage_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storage_purchases
CREATE POLICY "Brands can view their own purchases"
ON public.storage_purchases FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = storage_purchases.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can view all purchases"
ON public.storage_purchases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all purchases"
ON public.storage_purchases FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_brand_storage_usage_updated_at
BEFORE UPDATE ON public.brand_storage_usage
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at
BEFORE UPDATE ON public.content_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_storage_purchases_updated_at
BEFORE UPDATE ON public.storage_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster content library lookups
CREATE INDEX idx_content_library_brand_profile_id ON public.content_library(brand_profile_id);
CREATE INDEX idx_content_library_creator_profile_id ON public.content_library(creator_profile_id);
CREATE INDEX idx_content_library_booking_id ON public.content_library(booking_id);