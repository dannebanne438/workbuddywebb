-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workplace_id UUID REFERENCES public.workplaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'dm', 'schedule_change', 'team_message')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to create notifications for all workplace users
CREATE OR REPLACE FUNCTION public.create_announcement_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, workplace_id, type, title, message, link)
  SELECT 
    p.id,
    NEW.workplace_id,
    'announcement',
    NEW.title,
    LEFT(NEW.content, 100),
    'announcements'
  FROM profiles p
  WHERE p.workplace_id = NEW.workplace_id
    AND p.id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid);
  
  RETURN NEW;
END;
$$;

-- Trigger for announcements
CREATE TRIGGER on_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.create_announcement_notifications();

-- Create function to create DM notifications
CREATE OR REPLACE FUNCTION public.create_dm_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, workplace_id, type, title, message, link)
  VALUES (
    NEW.recipient_id,
    NEW.workplace_id,
    'dm',
    'Nytt meddelande från ' || NEW.sender_name,
    LEFT(NEW.content, 100),
    'chat'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for direct messages
CREATE TRIGGER on_dm_created
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_dm_notification();

-- Create function to create team message notifications
CREATE OR REPLACE FUNCTION public.create_team_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, workplace_id, type, title, message, link)
  SELECT 
    p.id,
    NEW.workplace_id,
    'team_message',
    NEW.sender_name || ' i teamchatten',
    LEFT(NEW.content, 100),
    'team-chat'
  FROM profiles p
  WHERE p.workplace_id = NEW.workplace_id
    AND p.id != NEW.sender_id;
  
  RETURN NEW;
END;
$$;

-- Trigger for team messages
CREATE TRIGGER on_team_message_created
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_team_message_notification();