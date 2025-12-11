-- Update the default brand subscription trigger to create 'none' instead of 'basic'
CREATE OR REPLACE FUNCTION public.create_default_brand_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.brand_subscriptions (
    brand_profile_id,
    plan_type,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'none',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  );
  RETURN NEW;
END;
$function$;