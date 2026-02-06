CREATE TABLE public.admin_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('creator', 'brand')),
  target_profile_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(target_type, target_profile_id, feature_key)
);

ALTER TABLE public.admin_feature_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature overrides"
ON public.admin_feature_overrides
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);