-- Create function to notify brands when creators apply to their campaigns
CREATE OR REPLACE FUNCTION public.notify_brand_campaign_application()
RETURNS TRIGGER AS $$
DECLARE
  brand_user_id UUID;
  campaign_title TEXT;
  creator_name TEXT;
BEGIN
  -- Get brand user_id and campaign title
  SELECT bp.user_id, c.title INTO brand_user_id, campaign_title
  FROM public.campaigns c
  JOIN public.brand_profiles bp ON c.brand_profile_id = bp.id
  WHERE c.id = NEW.campaign_id;

  -- Get creator display name
  SELECT display_name INTO creator_name
  FROM public.creator_profiles WHERE id = NEW.creator_profile_id;

  -- Create notification for brand
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    brand_user_id,
    'New Application for Your Campaign',
    creator_name || ' applied to "' || campaign_title || '"',
    'campaign_application',
    '/brand-dashboard?tab=campaigns'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for new campaign applications
CREATE TRIGGER on_campaign_application_created
  AFTER INSERT ON public.campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_brand_campaign_application();