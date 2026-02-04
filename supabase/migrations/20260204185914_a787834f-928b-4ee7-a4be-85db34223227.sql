-- Add new column for follower ranges (multi-select)
ALTER TABLE public.brand_opportunities 
ADD COLUMN follower_ranges TEXT[] DEFAULT NULL;

-- Comment explaining the column
COMMENT ON COLUMN public.brand_opportunities.follower_ranges IS 'Array of follower range keys: nano, micro, mid_tier, macro, mega';