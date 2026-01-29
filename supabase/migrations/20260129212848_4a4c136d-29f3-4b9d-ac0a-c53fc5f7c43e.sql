-- Create table for internal team chat messages
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;

-- Users can view messages from their workplace
CREATE POLICY "Users can view workplace messages"
ON public.team_messages
FOR SELECT
USING (
  workplace_id = get_user_workplace_id(auth.uid()) 
  OR is_super_admin(auth.uid())
);

-- Users can send messages to their workplace
CREATE POLICY "Users can send messages"
ON public.team_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND workplace_id = get_user_workplace_id(auth.uid())
);

-- Admins can delete messages
CREATE POLICY "Admins can delete messages"
ON public.team_messages
FOR DELETE
USING (
  is_workplace_admin(auth.uid(), workplace_id) 
  OR is_super_admin(auth.uid())
);

-- Create index for faster queries
CREATE INDEX idx_team_messages_workplace_created ON public.team_messages(workplace_id, created_at DESC);