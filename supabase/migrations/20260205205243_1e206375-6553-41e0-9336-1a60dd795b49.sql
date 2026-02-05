-- Allow super admins to insert direct messages for any workplace they operate in
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

-- Also align SELECT policy to allow super admins to see messages for workplaces they are operating in
-- (keeps existing behavior but ensures consistency if workplace_id is null on profile)
DROP POLICY IF EXISTS "Users can view own DMs" ON public.direct_messages;

CREATE POLICY "Users can view own DMs"
ON public.direct_messages
FOR SELECT
TO public
USING (
  (
    (sender_id = auth.uid())
    OR (recipient_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  )
  AND (
    workplace_id = public.get_user_workplace_id(auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);
