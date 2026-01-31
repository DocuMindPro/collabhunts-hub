-- Change follower_count from integer to bigint to handle large follower counts
ALTER TABLE public.creator_social_accounts 
ALTER COLUMN follower_count TYPE bigint;