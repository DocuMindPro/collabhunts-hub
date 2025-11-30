-- Create function to notify message recipient
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
    -- Brand sent message → notify creator
    recipient_user_id := conversation_record.creator_user_id;
    sender_name := conversation_record.company_name;
    notification_link := '/creator-dashboard?tab=messages';
  ELSE
    -- Creator sent message → notify brand
    recipient_user_id := conversation_record.brand_user_id;
    sender_name := conversation_record.display_name;
    notification_link := '/brand-dashboard?tab=messages';
  END IF;

  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    recipient_user_id,
    'New message from ' || sender_name,
    LEFT(NEW.content, 100),
    'message',
    notification_link
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on messages table
CREATE TRIGGER on_message_insert_notify_recipient
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_message_recipient();