
-- Conversations table for ChatGPT-like history
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id),
  title TEXT NOT NULL DEFAULT 'Ny konversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (user_id = auth.uid());

-- Add conversation_id to chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
