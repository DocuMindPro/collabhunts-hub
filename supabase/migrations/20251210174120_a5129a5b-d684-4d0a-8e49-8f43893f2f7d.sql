-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create helper function to send notification emails via edge function
CREATE OR REPLACE FUNCTION public.send_notification_email(
  email_type TEXT,
  to_email TEXT,
  to_name TEXT DEFAULT NULL,
  email_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT;
  anon_key TEXT;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- If settings not available, use hardcoded values (fallback)
  IF supabase_url IS NULL THEN
    supabase_url := 'https://olcygpkghmaqkezmunyu.supabase.co';
  END IF;
  IF anon_key IS NULL THEN
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY3lncGtnaG1hcWtlem11bnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTMxNjgsImV4cCI6MjA3OTkyOTE2OH0.dbMWOlUbPArcarzcaL_qr_PIlFKJfOogcAeUgBGkclw';
  END IF;

  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', email_type,
      'to_email', to_email,
      'to_name', to_name,
      'data', email_data
    )
  );
END;
$$;

-- Update notify_creator_new_booking to send email
CREATE OR REPLACE FUNCTION public.notify_creator_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  creator_email TEXT;
  creator_name TEXT;
  brand_name TEXT;
  service_name TEXT;
BEGIN
  -- Get creator user_id and name
  SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
  FROM public.creator_profiles cp
  WHERE cp.id = NEW.creator_profile_id;

  -- Get creator email
  SELECT p.email INTO creator_email
  FROM public.profiles p
  WHERE p.id = creator_user_id;

  -- Get brand name
  SELECT bp.company_name INTO brand_name
  FROM public.brand_profiles bp
  WHERE bp.id = NEW.brand_profile_id;

  -- Get service type if available
  IF NEW.service_id IS NOT NULL THEN
    SELECT cs.service_type INTO service_name
    FROM public.creator_services cs
    WHERE cs.id = NEW.service_id;
  END IF;

  -- In-app notification
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    creator_user_id,
    'New Booking Request',
    brand_name || ' wants to book your ' || COALESCE(service_name, 'service') || '.',
    'booking',
    '/creator-dashboard?tab=bookings'
  );

  -- Send email notification
  IF creator_email IS NOT NULL THEN
    PERFORM public.send_notification_email(
      'creator_new_booking',
      creator_email,
      creator_name,
      jsonb_build_object(
        'brand_name', brand_name,
        'service_name', COALESCE(service_name, 'service'),
        'amount_cents', NEW.total_price_cents,
        'message', NEW.message
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_brand_booking_status_change to send email
CREATE OR REPLACE FUNCTION public.notify_brand_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  brand_email TEXT;
  brand_name TEXT;
  creator_name TEXT;
  email_type TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get brand user_id and name
    SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    -- Get brand email
    SELECT p.email INTO brand_email
    FROM public.profiles p
    WHERE p.id = brand_user_id;

    -- Get creator name
    SELECT cp.display_name INTO creator_name
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Booking Accepted!',
        creator_name || ' accepted your booking request.',
        'booking',
        '/brand-dashboard?tab=bookings'
      );
      email_type := 'brand_booking_accepted';
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Booking Declined',
        creator_name || ' declined your booking request.',
        'booking',
        '/brand-dashboard?tab=bookings'
      );
      email_type := 'brand_booking_declined';
    ELSIF NEW.status = 'completed' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Booking Completed',
        'Your booking with ' || creator_name || ' is now complete.',
        'booking',
        '/brand-dashboard?tab=bookings'
      );
      email_type := NULL;
    END IF;

    -- Send email notification
    IF brand_email IS NOT NULL AND email_type IS NOT NULL THEN
      PERFORM public.send_notification_email(
        email_type,
        brand_email,
        brand_name,
        jsonb_build_object(
          'creator_name', creator_name,
          'amount_cents', NEW.total_price_cents,
          'delivery_deadline', NEW.delivery_deadline
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_creator_profile_status_change to send email
CREATE OR REPLACE FUNCTION public.notify_creator_profile_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_email TEXT;
  creator_name TEXT;
BEGIN
  -- Only trigger when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get creator email and name
    SELECT p.email INTO creator_email
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
    
    creator_name := NEW.display_name;

    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.user_id,
        'Profile Approved!',
        'Congratulations! Your profile is now live and visible to brands.',
        'profile_status',
        '/creator-dashboard?tab=overview'
      );
      
      -- Send email
      IF creator_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'creator_profile_approved',
          creator_email,
          creator_name,
          '{}'::jsonb
        );
      END IF;
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.user_id,
        'Profile Needs Updates',
        'Your profile was not approved. Please review the feedback and update your profile.',
        'profile_status',
        '/creator-dashboard?tab=profile'
      );
      
      -- Send email
      IF creator_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'creator_profile_rejected',
          creator_email,
          creator_name,
          jsonb_build_object('rejection_reason', NEW.rejection_reason)
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_brand_delivery_submitted to send email
CREATE OR REPLACE FUNCTION public.notify_brand_delivery_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  brand_email TEXT;
  brand_name TEXT;
  creator_name TEXT;
BEGIN
  -- Get brand user_id
  SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
  FROM public.bookings b
  JOIN public.brand_profiles bp ON bp.id = b.brand_profile_id
  WHERE b.id = NEW.booking_id;

  -- Get brand email
  SELECT p.email INTO brand_email
  FROM public.profiles p
  WHERE p.id = brand_user_id;

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

    -- Send email
    IF brand_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'brand_deliverables_submitted',
        brand_email,
        brand_name,
        jsonb_build_object('creator_name', creator_name)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Update notify_creator_revision_requested to send email
CREATE OR REPLACE FUNCTION public.notify_creator_revision_requested()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  creator_email TEXT;
  creator_name TEXT;
  brand_name TEXT;
BEGIN
  -- Only trigger when delivery_status changes to revision_requested
  IF OLD.delivery_status IS DISTINCT FROM NEW.delivery_status 
     AND NEW.delivery_status = 'revision_requested' THEN
    
    -- Get creator user_id and name
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    -- Get creator email
    SELECT p.email INTO creator_email
    FROM public.profiles p
    WHERE p.id = creator_user_id;

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

    -- Send email
    IF creator_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'creator_revision_requested',
        creator_email,
        creator_name,
        jsonb_build_object(
          'brand_name', brand_name,
          'revision_notes', NEW.revision_notes
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_creator_delivery_confirmed to send email
CREATE OR REPLACE FUNCTION public.notify_creator_delivery_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  creator_email TEXT;
  creator_name TEXT;
  brand_name TEXT;
  amount_dollars TEXT;
BEGIN
  -- Only trigger when delivery_status changes to confirmed
  IF OLD.delivery_status IS DISTINCT FROM NEW.delivery_status 
     AND NEW.delivery_status = 'confirmed' THEN
    
    -- Get creator user_id and name
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    -- Get creator email
    SELECT p.email INTO creator_email
    FROM public.profiles p
    WHERE p.id = creator_user_id;

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

    -- Send email
    IF creator_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'creator_delivery_confirmed',
        creator_email,
        creator_name,
        jsonb_build_object(
          'brand_name', brand_name,
          'amount_cents', NEW.total_price_cents
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_dispute_opened to send email
CREATE OR REPLACE FUNCTION public.notify_dispute_opened()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_user_id UUID;
  other_email TEXT;
  opener_name TEXT;
  other_name TEXT;
  booking_info RECORD;
  email_type TEXT;
BEGIN
  -- Get booking details
  SELECT b.*, b.total_price_cents, bp.company_name, bp.user_id as brand_user_id, cp.display_name, cp.user_id as creator_user_id
  INTO booking_info
  FROM bookings b
  JOIN brand_profiles bp ON bp.id = b.brand_profile_id
  JOIN creator_profiles cp ON cp.id = b.creator_profile_id
  WHERE b.id = NEW.booking_id;

  -- Determine who to notify
  IF NEW.opened_by_role = 'brand' THEN
    other_user_id := booking_info.creator_user_id;
    opener_name := booking_info.company_name;
    other_name := booking_info.display_name;
    email_type := 'creator_dispute_opened';
  ELSE
    other_user_id := booking_info.brand_user_id;
    opener_name := booking_info.display_name;
    other_name := booking_info.company_name;
    email_type := 'brand_dispute_opened';
  END IF;

  -- Get other party email
  SELECT p.email INTO other_email
  FROM public.profiles p
  WHERE p.id = other_user_id;

  -- Notify the other party
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    other_user_id,
    '⚠️ Dispute Opened',
    opener_name || ' has opened a dispute. You have 3 days to respond.',
    'dispute',
    CASE WHEN NEW.opened_by_role = 'brand' THEN '/creator-dashboard?tab=bookings' ELSE '/brand-dashboard?tab=bookings' END
  );

  -- Send email to other party
  IF other_email IS NOT NULL THEN
    PERFORM public.send_notification_email(
      email_type,
      other_email,
      other_name,
      jsonb_build_object(
        'brand_name', CASE WHEN NEW.opened_by_role = 'brand' THEN booking_info.company_name ELSE other_name END,
        'creator_name', CASE WHEN NEW.opened_by_role = 'creator' THEN booking_info.display_name ELSE other_name END,
        'reason', NEW.reason,
        'amount_cents', booking_info.total_price_cents
      )
    );
  END IF;

  -- Notify admins
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    user_roles.user_id,
    '🔔 New Dispute Filed',
    opener_name || ' opened a dispute requiring attention.',
    'dispute',
    '/admin?tab=disputes'
  FROM public.user_roles
  WHERE user_roles.role = 'admin';

  -- Send email to admin
  PERFORM public.send_notification_email(
    'admin_new_dispute',
    'care@collabhunts.com',
    'Admin',
    jsonb_build_object(
      'opener_name', opener_name,
      'other_party_name', other_name,
      'opened_by_role', NEW.opened_by_role,
      'reason', NEW.reason,
      'amount_cents', booking_info.total_price_cents
    )
  );

  RETURN NEW;
END;
$$;

-- Update notify_dispute_resolved to send email
CREATE OR REPLACE FUNCTION public.notify_dispute_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_info RECORD;
  brand_email TEXT;
  creator_email TEXT;
  resolution_msg TEXT;
  creator_in_favor BOOLEAN;
  brand_in_favor BOOLEAN;
BEGIN
  -- Only trigger when status changes to resolved
  IF OLD.status NOT LIKE 'resolved_%' AND NEW.status LIKE 'resolved_%' THEN
    -- Get booking details
    SELECT b.*, bp.company_name, bp.user_id as brand_user_id, cp.display_name, cp.user_id as creator_user_id
    INTO booking_info
    FROM bookings b
    JOIN brand_profiles bp ON bp.id = b.brand_profile_id
    JOIN creator_profiles cp ON cp.id = b.creator_profile_id
    WHERE b.id = NEW.booking_id;

    -- Get emails
    SELECT p.email INTO brand_email FROM public.profiles p WHERE p.id = booking_info.brand_user_id;
    SELECT p.email INTO creator_email FROM public.profiles p WHERE p.id = booking_info.creator_user_id;

    -- Determine resolution message and who won
    IF NEW.status = 'resolved_refund' THEN
      resolution_msg := 'Full refund issued to brand.';
      creator_in_favor := FALSE;
      brand_in_favor := TRUE;
    ELSIF NEW.status = 'resolved_release' THEN
      resolution_msg := 'Full payment released to creator.';
      creator_in_favor := TRUE;
      brand_in_favor := FALSE;
    ELSE
      resolution_msg := 'Payment split: ' || (100 - COALESCE(NEW.refund_percentage, 0)) || '% to creator, ' || COALESCE(NEW.refund_percentage, 0) || '% refunded.';
      creator_in_favor := NEW.refund_percentage < 50;
      brand_in_favor := NEW.refund_percentage >= 50;
    END IF;

    -- Notify brand
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      booking_info.brand_user_id,
      '✅ Dispute Resolved',
      resolution_msg,
      'dispute',
      '/brand-dashboard?tab=bookings'
    );

    -- Send email to brand
    IF brand_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'brand_dispute_resolved',
        brand_email,
        booking_info.company_name,
        jsonb_build_object(
          'creator_name', booking_info.display_name,
          'resolution', resolution_msg,
          'in_your_favor', brand_in_favor,
          'refund_amount', CASE WHEN NEW.refund_percentage > 0 THEN (booking_info.total_price_cents * NEW.refund_percentage / 100) ELSE NULL END
        )
      );
    END IF;

    -- Notify creator
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      booking_info.creator_user_id,
      '✅ Dispute Resolved',
      resolution_msg,
      'dispute',
      '/creator-dashboard?tab=bookings'
    );

    -- Send email to creator
    IF creator_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'creator_dispute_resolved',
        creator_email,
        booking_info.display_name,
        jsonb_build_object(
          'brand_name', booking_info.company_name,
          'resolution', resolution_msg,
          'in_your_favor', creator_in_favor,
          'amount_to_creator', CASE WHEN NEW.refund_percentage < 100 THEN (booking_info.total_price_cents * (100 - COALESCE(NEW.refund_percentage, 0)) / 100) ELSE NULL END
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Update notify_auto_release_payment to send email
CREATE OR REPLACE FUNCTION public.notify_auto_release_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  creator_user_id UUID;
  brand_email TEXT;
  creator_email TEXT;
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

    -- Get emails
    SELECT p.email INTO brand_email FROM public.profiles p WHERE p.id = brand_user_id;
    SELECT p.email INTO creator_email FROM public.profiles p WHERE p.id = creator_user_id;
    
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

    -- Send email to creator
    IF creator_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'creator_payment_auto_released',
        creator_email,
        creator_name,
        jsonb_build_object(
          'brand_name', brand_name,
          'amount_cents', NEW.total_price_cents
        )
      );
    END IF;

    -- Notify brand
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      brand_user_id,
      '✅ Payment Auto-Released',
      'Payment of ' || amount_dollars || ' to ' || creator_name || ' was auto-released after 72 hours.',
      'payment',
      '/brand-dashboard?tab=bookings'
    );

    -- Send email to brand
    IF brand_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        'brand_payment_auto_released',
        brand_email,
        brand_name,
        jsonb_build_object(
          'creator_name', creator_name,
          'amount_cents', NEW.total_price_cents
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_brand_campaign_application to send email
CREATE OR REPLACE FUNCTION public.notify_brand_campaign_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  brand_email TEXT;
  brand_name TEXT;
  campaign_title TEXT;
  campaign_budget INTEGER;
  creator_name TEXT;
BEGIN
  -- Get brand user_id, email and campaign title
  SELECT bp.user_id, bp.company_name, c.title, c.budget_cents INTO brand_user_id, brand_name, campaign_title, campaign_budget
  FROM public.campaigns c
  JOIN public.brand_profiles bp ON c.brand_profile_id = bp.id
  WHERE c.id = NEW.campaign_id;

  -- Get brand email
  SELECT p.email INTO brand_email
  FROM public.profiles p
  WHERE p.id = brand_user_id;

  -- Get creator display name
  SELECT display_name INTO creator_name
  FROM public.creator_profiles WHERE id = NEW.creator_profile_id;

  -- Create notification for brand
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    brand_user_id,
    'New Application for Your Campaign',
    creator_name || ' applied to "' || campaign_title || '"',
    'campaign_application',
    '/brand-dashboard?tab=campaigns'
  );

  -- Send email
  IF brand_email IS NOT NULL THEN
    PERFORM public.send_notification_email(
      'brand_new_application',
      brand_email,
      brand_name,
      jsonb_build_object(
        'creator_name', creator_name,
        'campaign_title', campaign_title,
        'proposed_price_cents', NEW.proposed_price_cents,
        'message', NEW.message
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_creator_application_status_change to send email
CREATE OR REPLACE FUNCTION public.notify_creator_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  creator_email TEXT;
  creator_name TEXT;
  campaign_title TEXT;
  campaign_budget INTEGER;
  brand_name TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get creator user_id and name
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    -- Get creator email
    SELECT p.email INTO creator_email
    FROM public.profiles p
    WHERE p.id = creator_user_id;

    -- Get campaign title, budget and brand name
    SELECT c.title, c.budget_cents, bp.company_name INTO campaign_title, campaign_budget, brand_name
    FROM public.campaigns c
    JOIN public.brand_profiles bp ON bp.id = c.brand_profile_id
    WHERE c.id = NEW.campaign_id;

    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        creator_user_id,
        'Application Accepted!',
        'Your application to "' || campaign_title || '" was accepted!',
        'campaign_application',
        '/creator-dashboard?tab=campaigns'
      );

      -- Send email
      IF creator_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'creator_application_accepted',
          creator_email,
          creator_name,
          jsonb_build_object(
            'campaign_title', campaign_title,
            'brand_name', brand_name,
            'budget_cents', campaign_budget
          )
        );
      END IF;
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        creator_user_id,
        'Application Update',
        'Your application to "' || campaign_title || '" was not selected.',
        'campaign_application',
        '/creator-dashboard?tab=campaigns'
      );

      -- Send email
      IF creator_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'creator_application_rejected',
          creator_email,
          creator_name,
          jsonb_build_object(
            'campaign_title', campaign_title,
            'brand_name', brand_name
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_brand_campaign_status_change to send email
CREATE OR REPLACE FUNCTION public.notify_brand_campaign_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_user_id UUID;
  brand_email TEXT;
  brand_name TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get brand user_id and name
    SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    -- Get brand email
    SELECT p.email INTO brand_email
    FROM public.profiles p
    WHERE p.id = brand_user_id;

    IF NEW.status = 'active' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Campaign Approved!',
        'Your campaign "' || NEW.title || '" is now live and visible to creators.',
        'campaign_status',
        '/brand-dashboard?tab=campaigns'
      );

      -- Send email
      IF brand_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'brand_campaign_approved',
          brand_email,
          brand_name,
          jsonb_build_object('campaign_title', NEW.title)
        );
      END IF;
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Campaign Not Approved',
        'Your campaign "' || NEW.title || '" was not approved. Please review and resubmit.',
        'campaign_status',
        '/brand-dashboard?tab=campaigns'
      );

      -- Send email
      IF brand_email IS NOT NULL THEN
        PERFORM public.send_notification_email(
          'brand_campaign_rejected',
          brand_email,
          brand_name,
          jsonb_build_object(
            'campaign_title', NEW.title,
            'rejection_reason', NULL
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_admin_new_campaign to send email
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_name TEXT;
BEGIN
  -- Get brand name
  SELECT bp.company_name INTO brand_name
  FROM public.brand_profiles bp
  WHERE bp.id = NEW.brand_profile_id;

  -- Insert notification for all admin users
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    user_roles.user_id,
    'New Campaign Pending Approval',
    'Campaign "' || NEW.title || '" needs review',
    'campaign',
    '/admin?tab=campaigns'
  FROM public.user_roles
  WHERE user_roles.role = 'admin';

  -- Send email to admin
  PERFORM public.send_notification_email(
    'admin_new_campaign_pending',
    'care@collabhunts.com',
    'Admin',
    jsonb_build_object(
      'campaign_title', NEW.title,
      'brand_name', brand_name,
      'budget_cents', NEW.budget_cents
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin notification when new creator signs up
CREATE OR REPLACE FUNCTION public.notify_admin_new_creator_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify when a new pending creator profile is created
  IF NEW.status = 'pending' THEN
    -- Insert notification for all admin users
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      user_roles.user_id,
      'New Creator Pending Approval',
      NEW.display_name || ' from ' || COALESCE(NEW.location_country, 'Unknown') || ' needs review',
      'creator',
      '/admin?tab=creators'
    FROM public.user_roles
    WHERE user_roles.role = 'admin';

    -- Send email to admin
    PERFORM public.send_notification_email(
      'admin_new_creator_pending',
      'care@collabhunts.com',
      'Admin',
      jsonb_build_object(
        'creator_name', NEW.display_name,
        'location', COALESCE(NEW.location_city || ', ', '') || COALESCE(NEW.location_state || ', ', '') || COALESCE(NEW.location_country, 'Unknown'),
        'categories', array_to_string(NEW.categories, ', ')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new creator pending notification
DROP TRIGGER IF EXISTS on_creator_profile_created_notify_admin ON public.creator_profiles;
CREATE TRIGGER on_creator_profile_created_notify_admin
  AFTER INSERT ON public.creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_creator_pending();