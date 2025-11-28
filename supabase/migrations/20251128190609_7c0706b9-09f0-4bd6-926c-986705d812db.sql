-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Recreate using the security definer function to avoid recursion
CREATE POLICY "Only admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));