-- Fix the trigger_push_notification function to handle missing pg_net extension gracefully
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build the payload
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

  -- Try to send push notification, but don't fail if pg_net is unavailable
  BEGIN
    PERFORM net.http_post(
      url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail - push notifications are optional
    RAISE NOTICE 'Push notification could not be sent: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;