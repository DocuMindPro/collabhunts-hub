-- Add story upsell price column to creator_services table
ALTER TABLE public.creator_services 
ADD COLUMN story_upsell_price_cents INTEGER DEFAULT NULL;