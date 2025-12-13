-- Add payout notification triggers and email types

-- Function to notify when payout request is submitted
CREATE OR REPLACE FUNCTION public.notify_payout_request_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requester_name TEXT;
  requester_email TEXT;
  amount_dollars TEXT;
  payout_type TEXT;
BEGIN
  amount_dollars := '$' || (NEW.amount_cents / 100)::TEXT;
  
  IF TG_TABLE_NAME = 'franchise_payout_requests' THEN
    payout_type := 'franchise';
    SELECT fo.company_name, fo.contact_email INTO requester_name, requester_email
    FROM franchise_owners fo WHERE fo.id = NEW.franchise_owner_id;
  ELSE
    payout_type := 'affiliate';
    SELECT a.display_name, a.email INTO requester_name, requester_email
    FROM affiliates a WHERE a.id = NEW.affiliate_id;
  END IF;
  
  -- Notify admins
  INSERT INTO notifications (user_id, title, message, type, link)
  SELECT 
    user_roles.user_id,
    '💸 New Payout Request',
    requester_name || ' requested ' || amount_dollars || ' payout.',
    'payout',
    '/admin?tab=' || payout_type || 's'
  FROM user_roles
  WHERE user_roles.role = 'admin';
  
  -- Send email to admin
  PERFORM public.send_notification_email(
    'admin_payout_request',
    'care@collabhunts.com',
    'Admin',
    jsonb_build_object(
      'requester_name', requester_name,
      'amount_cents', NEW.amount_cents,
      'payout_type', payout_type,
      'payout_method', NEW.payout_method
    )
  );
  
  -- Send confirmation email to requester
  IF requester_email IS NOT NULL THEN
    PERFORM public.send_notification_email(
      payout_type || '_payout_submitted',
      requester_email,
      requester_name,
      jsonb_build_object('amount_cents', NEW.amount_cents)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function to notify when payout request is processed
CREATE OR REPLACE FUNCTION public.notify_payout_request_processed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requester_user_id UUID;
  requester_name TEXT;
  requester_email TEXT;
  amount_dollars TEXT;
  payout_type TEXT;
  status_title TEXT;
  status_emoji TEXT;
BEGIN
  -- Only trigger when status changes from pending
  IF OLD.status = 'pending' AND OLD.status IS DISTINCT FROM NEW.status THEN
    amount_dollars := '$' || (NEW.amount_cents / 100)::TEXT;
    
    IF TG_TABLE_NAME = 'franchise_payout_requests' THEN
      payout_type := 'franchise';
      SELECT fo.user_id, fo.company_name, fo.contact_email INTO requester_user_id, requester_name, requester_email
      FROM franchise_owners fo WHERE fo.id = NEW.franchise_owner_id;
    ELSE
      payout_type := 'affiliate';
      SELECT a.user_id, a.display_name, a.email INTO requester_user_id, requester_name, requester_email
      FROM affiliates a WHERE a.id = NEW.affiliate_id;
    END IF;
    
    IF NEW.status = 'approved' THEN
      status_title := 'Payout Approved!';
      status_emoji := '✅';
    ELSIF NEW.status = 'rejected' THEN
      status_title := 'Payout Request Declined';
      status_emoji := '❌';
    ELSE
      RETURN NEW;
    END IF;
    
    -- Notify requester in-app
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      requester_user_id,
      status_emoji || ' ' || status_title,
      'Your payout request for ' || amount_dollars || ' has been ' || NEW.status || '.',
      'payout',
      '/' || payout_type || '-dashboard'
    );
    
    -- Send email to requester
    IF requester_email IS NOT NULL THEN
      PERFORM public.send_notification_email(
        payout_type || '_payout_' || NEW.status,
        requester_email,
        requester_name,
        jsonb_build_object(
          'amount_cents', NEW.amount_cents,
          'admin_notes', NEW.admin_notes
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create triggers for franchise payout requests
DROP TRIGGER IF EXISTS on_franchise_payout_submitted ON franchise_payout_requests;
CREATE TRIGGER on_franchise_payout_submitted
AFTER INSERT ON franchise_payout_requests
FOR EACH ROW EXECUTE FUNCTION notify_payout_request_submitted();

DROP TRIGGER IF EXISTS on_franchise_payout_processed ON franchise_payout_requests;
CREATE TRIGGER on_franchise_payout_processed
AFTER UPDATE ON franchise_payout_requests
FOR EACH ROW EXECUTE FUNCTION notify_payout_request_processed();

-- Create triggers for affiliate payout requests
DROP TRIGGER IF EXISTS on_affiliate_payout_submitted ON affiliate_payout_requests;
CREATE TRIGGER on_affiliate_payout_submitted
AFTER INSERT ON affiliate_payout_requests
FOR EACH ROW EXECUTE FUNCTION notify_payout_request_submitted();

DROP TRIGGER IF EXISTS on_affiliate_payout_processed ON affiliate_payout_requests;
CREATE TRIGGER on_affiliate_payout_processed
AFTER UPDATE ON affiliate_payout_requests
FOR EACH ROW EXECUTE FUNCTION notify_payout_request_processed();