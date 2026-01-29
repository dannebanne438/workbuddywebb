-- Create table for direct messages between employees
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view own DMs"
ON public.direct_messages
FOR SELECT
USING (
  (sender_id = auth.uid() OR recipient_id = auth.uid())
  AND workplace_id = get_user_workplace_id(auth.uid())
);

-- Users can send messages
CREATE POLICY "Users can send DMs"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND workplace_id = get_user_workplace_id(auth.uid())
);

-- Users can mark their received messages as read
CREATE POLICY "Users can update read status"
ON public.direct_messages
FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Create indexes for faster queries
CREATE INDEX idx_direct_messages_participants ON public.direct_messages(workplace_id, sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id, is_read);