-- Drop the old restrictive check constraint
ALTER TABLE public.creator_services 
DROP CONSTRAINT IF EXISTS creator_services_service_type_check;

-- Add a new constraint that allows both the old content types AND the new event-based types
ALTER TABLE public.creator_services 
ADD CONSTRAINT creator_services_service_type_check 
CHECK (service_type IN (
  -- Legacy content types (for backwards compatibility)
  'instagram_post', 'instagram_story', 'instagram_reel', 
  'tiktok_video', 'youtube_video', 'youtube_short', 'ugc_content',
  -- New event-based package types
  'unbox_review', 'social_boost', 'meet_greet', 'competition', 'custom',
  -- Additional event types from NativeCreatorOnboarding
  'Meet & Greet', 'Workshop', 'Competition Event', 'Brand Activation', 
  'Private Event', 'Live Performance', 'Custom Experience'
));