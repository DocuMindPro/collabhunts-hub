-- Add show_pricing_to_public column to creator_profiles
-- true = show pricing to everyone (default)
-- false = only show to subscribed brands (Basic+)
ALTER TABLE public.creator_profiles 
ADD COLUMN show_pricing_to_public boolean DEFAULT true;