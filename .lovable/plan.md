

## Fix: Messages Failing to Send ("sender_type" error)

### Root Cause

The database trigger `update_creator_response_time` references `NEW.sender_type` on the `messages` table, but that column does not exist. Every message insert fails with:

```
record "new" has no field "sender_type"
```

The `messages` table only has: `id`, `conversation_id`, `sender_id`, `content`, `is_read`, `created_at`, `message_type`, `offer_id`, `parent_message_id`, `negotiation_status`.

### Fix

Replace the `update_creator_response_time()` function to determine the sender type by looking up `sender_id` against the conversation's brand/creator profiles instead of relying on a non-existent column.

**Database migration** -- recreate the function:

```sql
CREATE OR REPLACE FUNCTION update_creator_response_time()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_profile_id uuid;
  v_conversation record;
  v_avg_minutes integer;
  v_is_creator boolean;
BEGIN
  -- Get conversation details
  SELECT creator_profile_id, brand_profile_id INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF v_conversation.creator_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if the sender is the creator by matching sender_id
  -- to the creator profile's user_id
  SELECT EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE id = v_conversation.creator_profile_id
    AND user_id = NEW.sender_id
  ) INTO v_is_creator;

  -- Only process messages from creators
  IF NOT v_is_creator THEN
    RETURN NEW;
  END IF;

  v_creator_profile_id := v_conversation.creator_profile_id;

  -- Determine sender type by joining against profiles
  -- instead of using a non-existent sender_type column
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
```

### What This Changes

- **No new columns or tables** -- the fix derives sender type from existing data (matching `sender_id` against the conversation's creator/brand profile `user_id`)
- **Same trigger** stays in place, just the function body is updated
- Messages will send successfully again immediately after this migration runs

### Files Modified

- **Database migration only** -- no frontend code changes needed. The `BrandMessagesTab.tsx` insert code is correct; it's the trigger that's broken.
