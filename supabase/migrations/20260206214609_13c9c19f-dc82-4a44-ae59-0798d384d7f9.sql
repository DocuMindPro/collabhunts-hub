
-- Add columns for repeated/multi-schedule push notifications
ALTER TABLE public.scheduled_push_notifications
  ADD COLUMN IF NOT EXISTS repeat_type text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS repeat_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.scheduled_push_notifications(id) ON DELETE CASCADE;

-- Index for finding children of a parent
CREATE INDEX IF NOT EXISTS idx_scheduled_push_parent_id ON public.scheduled_push_notifications(parent_id) WHERE parent_id IS NOT NULL;
