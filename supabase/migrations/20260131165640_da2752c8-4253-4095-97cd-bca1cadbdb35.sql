-- Fix the trigger_push_notification function to use correct column name
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'title', NEW.title,
    'body', NEW.message,
    'notification_type', NEW.type,
    'data', jsonb_build_object(
      'link', NEW.link,
      'notification_id', NEW.id
    )
  );

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