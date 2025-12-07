-- 1. Update message notification to hide content
CREATE OR REPLACE FUNCTION public.notify_message_recipient()
RETURNS TRIGGER AS $$
DECLARE
  conversation_record RECORD;
  recipient_user_id UUID;
  sender_name TEXT;
  notification_link TEXT;
BEGIN
  -- Get conversation details with both profiles
  SELECT 
    c.brand_profile_id, 
    c.creator_profile_id,
    bp.user_id as brand_user_id, 
    bp.company_name,
    cp.user_id as creator_user_id, 
    cp.display_name
  INTO conversation_record
  FROM public.conversations c
  JOIN public.brand_profiles bp ON c.brand_profile_id = bp.id
  JOIN public.creator_profiles cp ON c.creator_profile_id = cp.id
  WHERE c.id = NEW.conversation_id;

  -- Determine recipient and sender name
  IF NEW.sender_id = conversation_record.brand_user_id THEN
    recipient_user_id := conversation_record.creator_user_id;
    sender_name := conversation_record.company_name;
    notification_link := '/creator-dashboard?tab=messages';
  ELSE
    recipient_user_id := conversation_record.brand_user_id;
    sender_name := conversation_record.display_name;
    notification_link := '/brand-dashboard?tab=messages';
  END IF;

  -- Create notification with generic message (no content shown)
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    recipient_user_id,
    'New message from ' || sender_name,
    'Tap here to view the conversation',
    'message',
    notification_link
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 2. Creator profile approval/rejection notification
CREATE OR REPLACE FUNCTION public.notify_creator_profile_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.user_id,
        'Profile Approved!',
        'Congratulations! Your profile is now live and visible to brands.',
        'profile_status',
        '/creator-dashboard?tab=overview'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.user_id,
        'Profile Needs Updates',
        'Your profile was not approved. Please review the feedback and update your profile.',
        'profile_status',
        '/creator-dashboard?tab=profile'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_creator_profile_status_change
  AFTER UPDATE ON public.creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creator_profile_status_change();

-- 3. Campaign application status change notification (notify creator)
CREATE OR REPLACE FUNCTION public.notify_creator_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  creator_user_id UUID;
  campaign_title TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get creator user_id and campaign title
    SELECT cp.user_id INTO creator_user_id
    FROM public.creator_profiles cp
    WHERE cp.id = NEW.creator_profile_id;

    SELECT c.title INTO campaign_title
    FROM public.campaigns c
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
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        creator_user_id,
        'Application Update',
        'Your application to "' || campaign_title || '" was not selected.',
        'campaign_application',
        '/creator-dashboard?tab=campaigns'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creator_application_status_change();

-- 4. Campaign approval/rejection by admin (notify brand)
CREATE OR REPLACE FUNCTION public.notify_brand_campaign_status_change()
RETURNS TRIGGER AS $$
DECLARE
  brand_user_id UUID;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get brand user_id
    SELECT bp.user_id INTO brand_user_id
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    IF NEW.status = 'active' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Campaign Approved!',
        'Your campaign "' || NEW.title || '" is now live and visible to creators.',
        'campaign_status',
        '/brand-dashboard?tab=campaigns'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Campaign Not Approved',
        'Your campaign "' || NEW.title || '" was not approved. Please review and resubmit.',
        'campaign_status',
        '/brand-dashboard?tab=campaigns'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_campaign_status_change
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_brand_campaign_status_change();

-- 5. New booking notification (notify creator)
CREATE OR REPLACE FUNCTION public.notify_creator_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  creator_user_id UUID;
  brand_name TEXT;
  service_name TEXT;
BEGIN
  -- Get creator user_id
  SELECT cp.user_id INTO creator_user_id
  FROM public.creator_profiles cp
  WHERE cp.id = NEW.creator_profile_id;

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

  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    creator_user_id,
    'New Booking Request',
    brand_name || ' wants to book your ' || COALESCE(service_name, 'service') || '.',
    'booking',
    '/creator-dashboard?tab=bookings'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_new_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creator_new_booking();

-- 6. Booking status change notification (notify brand)
CREATE OR REPLACE FUNCTION public.notify_brand_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  brand_user_id UUID;
  creator_name TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get brand user_id
    SELECT bp.user_id INTO brand_user_id
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

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
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Booking Declined',
        creator_name || ' declined your booking request.',
        'booking',
        '/brand-dashboard?tab=bookings'
      );
    ELSIF NEW.status = 'completed' THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        brand_user_id,
        'Booking Completed',
        'Your booking with ' || creator_name || ' is now complete.',
        'booking',
        '/brand-dashboard?tab=bookings'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_brand_booking_status_change();