-- Add file_size_bytes column to creator_portfolio_media table
ALTER TABLE public.creator_portfolio_media 
ADD COLUMN file_size_bytes bigint DEFAULT 0;