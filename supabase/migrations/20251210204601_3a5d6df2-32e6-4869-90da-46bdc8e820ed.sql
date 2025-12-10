-- Add verification columns to brand_profiles
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by_user_id UUID,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT;

-- Add constraint for verification_status values
ALTER TABLE public.brand_profiles
ADD CONSTRAINT valid_verification_status CHECK (verification_status IN ('not_started', 'pending', 'approved', 'rejected'));

-- Create trigger function for verification status changes
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  brand_user_id UUID;
  brand_email TEXT;
  brand_name TEXT;
BEGIN
  -- Only trigger when verification_status changes
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    brand_user_id := NEW.user_id;
    brand_name := NEW.company_name;
    
    -- Get brand email
    SELECT p.email INTO brand_email
    FROM public.profiles p
    WHERE p.id = brand_user_id;

    IF NEW.verification_status = 'pending' THEN
      -- Notify admins about new verification request
      INSERT INTO public.notifications (user_id, title, message, type, link)
      SELECT 
        user_roles.user_id,
        '🔍 New Verification Request',
        brand_name || ' has requested business verification.',
        'verification',
        '/admin?tab=verifications'
      FROM public.user_roles
      WHERE user_roles.role = 'admin';

      -- Notify brand of submission
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        '📝 Verification Request Submitted',
        'Your verification request is under review. We''ll notify you once it''s processed.',
        'verification',
        '/brand-dashboard?tab=subscription'
      );

      -- Send email to brand
      IF brand_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'brand_verification_submitted',
          brand_email,
          brand_name,
          '{}'::jsonb
        );
      END IF;

      -- Send email to admin
      PERFORM public.send_notification_email(
        'admin_verification_request',
        'care@collabhunts.com',
        'Admin',
        jsonb_build_object('brand_name', brand_name)
      );

    ELSIF NEW.verification_status = 'approved' THEN
      -- Set is_verified to true
      NEW.is_verified := true;
      NEW.verification_completed_at := now();

      -- Notify brand
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        '✅ Business Verified!',
        'Congratulations! Your business is now verified. Your badge is live!',
        'verification',
        '/brand-dashboard?tab=subscription'
      );

      -- Send email to brand
      IF brand_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'brand_verification_approved',
          brand_email,
          brand_name,
          '{}'::jsonb
        );
      END IF;

    ELSIF NEW.verification_status = 'rejected' THEN
      NEW.verification_completed_at := now();

      -- Notify brand
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        '❌ Verification Not Approved',
        'Your verification request was not approved. Check the details for more information.',
        'verification',
        '/brand-dashboard?tab=subscription'
      );

      -- Send email to brand
      IF brand_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'brand_verification_rejected',
          brand_email,
          brand_name,
          jsonb_build_object('rejection_reason', NEW.verification_rejection_reason)
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS on_verification_status_change ON public.brand_profiles;
CREATE TRIGGER on_verification_status_change
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_verification_status_change();