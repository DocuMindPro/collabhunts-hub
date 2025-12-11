-- Fix: Allow 'none' as a valid plan_type value
ALTER TABLE public.brand_subscriptions 
DROP CONSTRAINT IF EXISTS brand_subscriptions_plan_type_check;

ALTER TABLE public.brand_subscriptions 
ADD CONSTRAINT brand_subscriptions_plan_type_check 
CHECK (plan_type = ANY (ARRAY['none'::text, 'basic'::text, 'pro'::text, 'premium'::text]));

-- Add admin UPDATE policy for subscriptions
CREATE POLICY "Admins can update all subscriptions"
ON public.brand_subscriptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add admin DELETE policy for subscriptions (for cleanup)
CREATE POLICY "Admins can delete all subscriptions"
ON public.brand_subscriptions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));