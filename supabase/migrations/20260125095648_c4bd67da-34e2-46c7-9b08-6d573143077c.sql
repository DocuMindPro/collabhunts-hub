-- Fix: Set search_path for the trigger function to prevent SQL injection
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build the payload for the edge function
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'title', NEW.title,
    'body', NEW.message,
    'notification_type', NEW.notification_type,
    'data', jsonb_build_object(
      'link', NEW.link,
      'notification_id', NEW.id
    )
  );

  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;