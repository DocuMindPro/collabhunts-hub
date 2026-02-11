
CREATE OR REPLACE FUNCTION public.notify_creators_new_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'open' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      cp.user_id,
      'New Opportunity Available',
      'A new opportunity "' || COALESCE(NEW.title, 'Untitled') || '" has been posted. Check it out!',
      'opportunity',
      '/opportunities'
    FROM public.creator_profiles cp
    WHERE cp.status = 'approved';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_creators_new_opportunity
  AFTER INSERT ON public.brand_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creators_new_opportunity();
