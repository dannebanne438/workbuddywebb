-- Fix: Allow super admins to send DMs to any workplace (their profile has no workplace_id)
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;

CREATE POLICY "Users can send DMs"
ON public.direct_messages
FOR INSERT
TO public
WITH CHECK (
  sender_id = auth.uid()
  AND (
    workplace_id = public.get_user_workplace_id(auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);

-- Also fix team_messages for super admins
DROP POLICY IF EXISTS "Users can send messages" ON public.team_messages;

CREATE POLICY "Users can send messages"
ON public.team_messages
FOR INSERT
TO public
WITH CHECK (
  sender_id = auth.uid()
  AND (
    workplace_id = public.get_user_workplace_id(auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);