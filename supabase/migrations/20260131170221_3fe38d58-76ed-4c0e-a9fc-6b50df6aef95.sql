-- Disable the push notification trigger that calls non-existent pg_net function
-- This prevents creator signup from failing due to missing net.http_post()
DROP TRIGGER IF EXISTS on_notification_insert_send_push ON public.notifications;

-- Also replace the function with a safe no-op in case it gets re-created
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Push notifications via database triggers are disabled
  -- The application handles push notifications through edge functions instead
  -- This prevents blocking database operations when pg_net is not available
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;