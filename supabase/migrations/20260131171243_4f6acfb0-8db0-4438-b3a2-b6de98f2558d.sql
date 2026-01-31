-- First drop the existing function
DROP FUNCTION IF EXISTS public.send_notification_email(text, text, text, jsonb);

-- Then create a safe version that doesn't use pg_net
CREATE OR REPLACE FUNCTION public.send_notification_email(
  email_type TEXT,
  to_email TEXT,
  to_name TEXT,
  email_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Email sending via pg_net is disabled
  -- Emails are handled through application code or edge functions instead
  -- This prevents blocking database operations when pg_net extension is not available
  RETURN;
EXCEPTION WHEN OTHERS THEN
  -- Silently ignore any errors to not block the calling operation
  RETURN;
END;
$$;