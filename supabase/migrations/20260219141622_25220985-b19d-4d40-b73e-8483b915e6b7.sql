
-- Drop the overly permissive insert policy on audit_logs
-- Triggers run as SECURITY DEFINER so they bypass RLS anyway
-- We don't need an INSERT policy for regular users
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive policy - only service role / triggers can insert
-- Since audit_trigger_func is SECURITY DEFINER, it bypasses RLS
-- No INSERT policy means no user can manually insert audit logs
