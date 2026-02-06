
-- Add cached performance columns to creator_profiles
ALTER TABLE public.creator_profiles 
  ADD COLUMN IF NOT EXISTS avg_response_minutes integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;

-- Function to update avg_response_minutes when a creator replies
CREATE OR REPLACE FUNCTION public.update_creator_response_time()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_profile_id uuid;
  v_conversation record;
  v_avg_minutes integer;
BEGIN
  -- Only process messages from creators (sender_type = 'creator')
  IF NEW.sender_type != 'creator' THEN
    RETURN NEW;
  END IF;

  -- Get the creator_profile_id from the conversation
  SELECT creator_profile_id INTO v_creator_profile_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF v_creator_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate average response time across recent conversations
  -- For each conversation, find the time between the last brand message and the first creator reply after it
  WITH response_times AS (
    SELECT DISTINCT ON (m_brand.conversation_id, m_brand.id)
      EXTRACT(EPOCH FROM (m_creator.created_at - m_brand.created_at)) / 60 AS response_minutes
    FROM public.messages m_brand
    JOIN public.conversations c ON c.id = m_brand.conversation_id
    JOIN public.messages m_creator ON m_creator.conversation_id = m_brand.conversation_id
      AND m_creator.sender_type = 'creator'
      AND m_creator.created_at > m_brand.created_at
    WHERE c.creator_profile_id = v_creator_profile_id
      AND m_brand.sender_type = 'brand'
      AND m_brand.created_at > now() - interval '90 days'
    ORDER BY m_brand.conversation_id, m_brand.id, m_creator.created_at ASC
  )
  SELECT ROUND(AVG(response_minutes))::integer INTO v_avg_minutes
  FROM response_times
  WHERE response_minutes > 0;

  -- Update the creator profile
  UPDATE public.creator_profiles
  SET avg_response_minutes = v_avg_minutes
  WHERE id = v_creator_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS trigger_update_creator_response_time ON public.messages;
CREATE TRIGGER trigger_update_creator_response_time
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creator_response_time();
