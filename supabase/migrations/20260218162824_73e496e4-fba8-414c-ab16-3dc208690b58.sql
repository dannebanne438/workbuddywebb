-- Allow users to delete their own DMs
CREATE POLICY "Users can delete own DMs"
ON public.direct_messages FOR DELETE
USING (sender_id = auth.uid() OR is_super_admin(auth.uid()));

-- Allow users (senders) to delete their own team messages
CREATE POLICY "Users can delete own team messages"
ON public.team_messages FOR DELETE
USING (sender_id = auth.uid());
