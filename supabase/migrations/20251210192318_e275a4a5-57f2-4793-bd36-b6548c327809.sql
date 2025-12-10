-- Add is_public column to platform_changelog for controlling visibility
ALTER TABLE public.platform_changelog 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.platform_changelog.is_public IS 'When true, entry is visible on public What''s New page. When false, only visible in Admin dashboard.';