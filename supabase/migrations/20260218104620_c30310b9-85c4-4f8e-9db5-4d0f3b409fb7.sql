-- Atomic increment functions to replace race-condition-prone read-then-write patterns

CREATE OR REPLACE FUNCTION public.increment_messaging_counter(p_brand_profile_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE brand_profiles
  SET creators_messaged_this_month = creators_messaged_this_month + 1
  WHERE id = p_brand_profile_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_draft_counter(p_brand_profile_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE brand_profiles
  SET ai_drafts_used_this_month = ai_drafts_used_this_month + 1
  WHERE id = p_brand_profile_id;
$$;