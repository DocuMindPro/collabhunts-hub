
-- Create the account_delegates table
CREATE TABLE public.account_delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  delegate_user_id uuid,
  delegate_email text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('brand', 'creator')),
  profile_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

-- Unique constraint: one pending/active invite per email per profile
CREATE UNIQUE INDEX idx_account_delegates_unique_active 
  ON public.account_delegates (delegate_email, profile_id) 
  WHERE status IN ('pending', 'active');

-- Enable RLS
ALTER TABLE public.account_delegates ENABLE ROW LEVEL SECURITY;

-- Owners can see their own delegate rows
CREATE POLICY "Owners can view their delegates"
  ON public.account_delegates
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Delegates can see rows where they are the delegate
CREATE POLICY "Delegates can view their own access"
  ON public.account_delegates
  FOR SELECT
  TO authenticated
  USING (delegate_user_id = auth.uid());

-- Owners can insert delegate rows
CREATE POLICY "Owners can insert delegates"
  ON public.account_delegates
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- Owners can update their own delegate rows (revoke, etc.)
CREATE POLICY "Owners can update their delegates"
  ON public.account_delegates
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Delegates can update rows where their email matches (for auto-linking)
CREATE POLICY "Delegates can accept invites"
  ON public.account_delegates
  FOR UPDATE
  TO authenticated
  USING (
    delegate_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );
