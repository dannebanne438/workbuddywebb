-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;

-- Create new INSERT policy that also allows super admins
CREATE POLICY "Users can insert own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND (
    workplace_id = get_user_workplace_id(auth.uid()) 
    OR is_super_admin(auth.uid())
  )
);

-- Also update SELECT to allow super admins
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;

CREATE POLICY "Users can view own messages"
ON public.chat_messages
FOR SELECT
USING (
  user_id = auth.uid() 
  OR is_super_admin(auth.uid())
);

-- Allow users to delete their own chat messages (for clearing conversations)
CREATE POLICY "Users can delete own messages"
ON public.chat_messages
FOR DELETE
USING (user_id = auth.uid());