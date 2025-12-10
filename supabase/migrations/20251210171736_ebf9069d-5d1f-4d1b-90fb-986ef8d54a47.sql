-- Add delivered_at timestamp to bookings for auto-release tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add terms acceptance tracking to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';

-- Add terms acceptance tracking to brand_profiles
ALTER TABLE public.brand_profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';

-- Create function to auto-release payment notification
CREATE OR REPLACE FUNCTION public.notify_auto_release_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  creator_user_id UUID;
  creator_name TEXT;
  brand_name TEXT;
  amount_dollars TEXT;
BEGIN
  -- Only trigger when delivery_status changes to confirmed from delivered (auto-release)
  IF OLD.delivery_status = 'delivered' AND NEW.delivery_status = 'confirmed' THEN
    -- Get user IDs and names
    SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
    FROM public.brand_profiles bp WHERE bp.id = NEW.brand_profile_id;
    
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM public.creator_profiles cp WHERE cp.id = NEW.creator_profile_id;
    
    amount_dollars := '$' || (NEW.total_price_cents / 100)::TEXT;

    -- Notify creator
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      creator_user_id,
      '💰 Payment Auto-Released!',
      amount_dollars || ' has been automatically released for your work with ' || brand_name,
      'payment',
      '/creator-dashboard?tab=bookings'
    );

    -- Notify brand
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      brand_user_id,
      '✅ Payment Auto-Released',
      'Payment of ' || amount_dollars || ' to ' || creator_name || ' was auto-released after 72 hours.',
      'payment',
      '/brand-dashboard?tab=bookings'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-release notifications
DROP TRIGGER IF EXISTS on_auto_release_payment ON public.bookings;
CREATE TRIGGER on_auto_release_payment
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_auto_release_payment();