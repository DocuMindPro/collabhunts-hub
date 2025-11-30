-- Allow users to update conversations (for last_message_at field)
CREATE POLICY "Users can update their conversations" ON public.conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM creator_profiles
    WHERE creator_profiles.id = conversations.creator_profile_id
    AND creator_profiles.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM brand_profiles
    WHERE brand_profiles.id = conversations.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);