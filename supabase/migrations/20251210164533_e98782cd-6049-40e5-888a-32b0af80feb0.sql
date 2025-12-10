-- Add new columns to bookings table for delivery workflow
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivery_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revision_notes TEXT;

-- Create booking_deliverables table for file uploads
CREATE TABLE public.booking_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_r2_key TEXT,
  description TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_deliverables ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_deliverables
CREATE POLICY "Creators can upload deliverables for their bookings"
ON public.booking_deliverables
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.creator_profiles cp ON cp.id = b.creator_profile_id
    WHERE b.id = booking_deliverables.booking_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Creators can view their own deliverables"
ON public.booking_deliverables
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles cp
    WHERE cp.id = booking_deliverables.creator_profile_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Brands can view deliverables for their bookings"
ON public.booking_deliverables
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.brand_profiles bp ON bp.id = b.brand_profile_id
    WHERE b.id = booking_deliverables.booking_id
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Creators can delete their own deliverables"
ON public.booking_deliverables
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles cp
    WHERE cp.id = booking_deliverables.creator_profile_id
    AND cp.user_id = auth.uid()
  )
);

-- Create trigger to notify brand when deliverables are submitted
CREATE OR REPLACE FUNCTION public.notify_brand_delivery_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  brand_user_id UUID;
  creator_name TEXT;
BEGIN
  -- Get brand user_id
  SELECT bp.user_id INTO brand_user_id
  FROM public.bookings b
  JOIN public.brand_profiles bp ON bp.id = b.brand_profile_id
  WHERE b.id = NEW.booking_id;

  -- Get creator name
  SELECT cp.display_name INTO creator_name
  FROM public.creator_profiles cp
  WHERE cp.id = NEW.creator_profile_id;

  -- Only notify on first deliverable of a new version
  IF NOT EXISTS (
    SELECT 1 FROM public.booking_deliverables
    WHERE booking_id = NEW.booking_id
    AND version = NEW.version
    AND id != NEW.id
  ) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      brand_user_id,
      '📦 Deliverables Ready!',
      creator_name || ' has submitted their work for your review.',
      'delivery',
      '/brand-dashboard?tab=bookings'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_deliverable_submitted
AFTER INSERT ON public.booking_deliverables
FOR EACH ROW
EXECUTE FUNCTION public.notify_brand_delivery_submitted();

-- Create trigger to notify creator when revision is requested
CREATE OR REPLACE FUNCTION public.notify_creator_revision_requested()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  creator_user_id UUID;
  brand_name TEXT;
BEGIN
  -- Only trigger when delivery_status changes to revision_requested
  IF OLD.delivery_status IS DISTINCT FROM NEW.delivery_status 
     AND NEW.delivery_status = 'revision_requested' THEN
    
    -- Get creator user_id
    SELECT cp.user_id INTO creator_user_id
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    -- Get brand name
    SELECT bp.company_name INTO brand_name
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      creator_user_id,
      '↩️ Revision Requested',
      brand_name || ' has requested changes to your deliverables.',
      'revision',
      '/creator-dashboard?tab=bookings'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_revision_requested
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_creator_revision_requested();

-- Create trigger to notify creator when delivery is confirmed
CREATE OR REPLACE FUNCTION public.notify_creator_delivery_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  creator_user_id UUID;
  brand_name TEXT;
  amount_dollars TEXT;
BEGIN
  -- Only trigger when delivery_status changes to confirmed
  IF OLD.delivery_status IS DISTINCT FROM NEW.delivery_status 
     AND NEW.delivery_status = 'confirmed' THEN
    
    -- Get creator user_id
    SELECT cp.user_id INTO creator_user_id
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    -- Get brand name
    SELECT bp.company_name INTO brand_name
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    -- Calculate amount
    amount_dollars := '$' || (NEW.total_price_cents / 100)::TEXT;

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      creator_user_id,
      '✅ Delivery Approved!',
      brand_name || ' approved your work. ' || amount_dollars || ' payment released!',
      'payment',
      '/creator-dashboard?tab=bookings'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_confirmed
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_creator_delivery_confirmed();