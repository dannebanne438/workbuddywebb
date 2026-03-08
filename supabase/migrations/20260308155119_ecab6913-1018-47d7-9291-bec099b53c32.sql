-- Fix: Restrict security_events INSERT to authenticated users only (system inserts via triggers use SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "Authenticated can insert security events"
ON security_events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix: Restrict login_attempts INSERT to authenticated context or system
DROP POLICY IF EXISTS "System can insert login attempts" ON login_attempts;
CREATE POLICY "Authenticated can insert login attempts"
ON login_attempts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);