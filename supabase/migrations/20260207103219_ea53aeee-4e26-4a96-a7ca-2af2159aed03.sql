CREATE OR REPLACE FUNCTION update_creator_response_time()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_profile_id uuid;
  v_conversation record;
  v_avg_minutes integer;
  v_is_creator boolean;
BEGIN
  SELECT creator_profile_id, brand_profile_id INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF v_conversation.creator_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE id = v_conversation.creator_profile_id
    AND user_id = NEW.sender_id
  ) INTO v_is_creator;

  IF NOT v_is_creator THEN
    RETURN NEW;
  END IF;

  v_creator_profile_id := v_conversation.creator_profile_id;

  WITH response_times AS (
    SELECT DISTINCT ON (m_brand.conversation_id, m_brand.id)
      EXTRACT(EPOCH FROM (m_creator.created_at - m_brand.created_at)) / 60
        AS response_minutes
    FROM public.messages m_brand
    JOIN public.conversations c ON c.id = m_brand.conversation_id
    JOIN public.brand_profiles bp ON bp.id = c.brand_profile_id
    JOIN public.messages m_creator ON m_creator.conversation_id = m_brand.conversation_id
      AND m_creator.sender_id != bp.user_id
      AND m_creator.created_at > m_brand.created_at
    WHERE c.creator_profile_id = v_creator_profile_id
      AND m_brand.sender_id = bp.user_id
      AND m_brand.created_at > now() - interval '90 days'
    ORDER BY m_brand.conversation_id, m_brand.id, m_creator.created_at ASC
  )
  SELECT ROUND(AVG(response_minutes))::integer INTO v_avg_minutes
  FROM response_times
  WHERE response_minutes > 0;

  UPDATE public.creator_profiles
  SET avg_response_minutes = v_avg_minutes
  WHERE id = v_creator_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;