-- Add RLS policy for admins to view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update all campaigns (for approval workflow)
CREATE POLICY "Admins can update all campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to notify admins of new campaigns pending approval
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
RETURNS TRIGGER AS $$
BEGIN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for new campaigns with pending status
CREATE TRIGGER on_campaign_created
  AFTER INSERT ON public.campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign();