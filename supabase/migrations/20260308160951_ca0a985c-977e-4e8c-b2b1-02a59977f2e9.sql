-- CRITICAL FIX: Prevent users from changing their own workplace_id
-- This closes a cross-tenant privilege escalation vulnerability where a user
-- could set their workplace_id to any other organization's UUID and gain
-- full access to that organization's data via get_user_workplace_id().

-- Drop the existing overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new policy that only allows updating safe columns (not workplace_id)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND workplace_id IS NOT DISTINCT FROM (SELECT p.workplace_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Create a separate policy for admins to change workplace assignments
CREATE POLICY "Admins can update workplace assignment"
  ON public.profiles
  FOR UPDATE
  USING (is_super_admin(auth.uid()) OR is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (is_super_admin(auth.uid()) OR is_workplace_admin(auth.uid(), workplace_id));