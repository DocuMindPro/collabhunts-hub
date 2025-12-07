-- Drop the overly permissive notifications INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Drop the overly permissive backup_history INSERT policy  
DROP POLICY IF EXISTS "System can insert backup history" ON public.backup_history;

-- Note: Service role (used by edge functions) and SECURITY DEFINER functions 
-- (like notify_message_recipient trigger) bypass RLS entirely, so they will 
-- still be able to insert records. Regular users will now be blocked.