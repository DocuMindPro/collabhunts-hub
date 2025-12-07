-- Create backup_history table for tracking all backup operations
CREATE TABLE public.backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL DEFAULT 'scheduled',
  status text NOT NULL,
  file_name text,
  s3_url text,
  file_size bigint,
  execution_time_ms integer,
  tables_backed_up text[],
  components_backed_up jsonb DEFAULT '{}',
  migration_count integer DEFAULT 0,
  function_count integer DEFAULT 0,
  error_message text,
  backup_version text DEFAULT '2.0',
  triggered_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Admin can view all backup history
CREATE POLICY "Admins can view backup history"
ON public.backup_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert backup records (service role)
CREATE POLICY "System can insert backup history"
ON public.backup_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_backup_history_created_at ON public.backup_history(created_at DESC);
CREATE INDEX idx_backup_history_status ON public.backup_history(status);