-- Update the trigger function to use 1 month instead of 1 year
CREATE OR REPLACE FUNCTION public.create_default_brand_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.brand_subscriptions (
    brand_profile_id,
    plan_type,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'basic',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;