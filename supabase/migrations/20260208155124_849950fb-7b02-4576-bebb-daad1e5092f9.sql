
ALTER TABLE public.brand_profiles
ADD COLUMN free_posts_used_this_month integer NOT NULL DEFAULT 0,
ADD COLUMN free_posts_reset_at timestamp with time zone;
