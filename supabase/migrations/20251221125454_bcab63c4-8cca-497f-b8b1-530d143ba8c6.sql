-- Create chat/messaging system tables

-- Teacher credits for messaging
CREATE TABLE public.teacher_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  free_messages_remaining integer NOT NULL DEFAULT 5,
  is_premium boolean DEFAULT false,
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(teacher_id)
);

-- Chat appointments
CREATE TABLE public.chat_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  appointment_type text NOT NULL DEFAULT 'free' CHECK (appointment_type IN ('free', 'premium')),
  subject text NOT NULL,
  description text,
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid,
  rejection_reason text
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.chat_appointments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'attachment', 'gift', 'event')),
  attachment_url text,
  attachment_type text,
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  edited_at timestamp with time zone,
  deleted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced notifications table - add more fields
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS sender_id uuid;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Enable RLS
ALTER TABLE public.teacher_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Teacher credits policies
CREATE POLICY "Teachers can view their own credits" ON public.teacher_credits
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "System can manage credits" ON public.teacher_credits
  FOR ALL USING (true) WITH CHECK (true);

-- Chat appointments policies
CREATE POLICY "Teachers can create appointments" ON public.chat_appointments
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view their appointments" ON public.chat_appointments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all appointments" ON public.chat_appointments
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appointments" ON public.chat_appointments
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update their pending appointments" ON public.chat_appointments
  FOR UPDATE USING (auth.uid() = teacher_id AND status = 'pending');

-- Chat messages policies
CREATE POLICY "Participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_appointments 
      WHERE id = chat_messages.appointment_id 
      AND (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_appointments 
      WHERE id = chat_messages.appointment_id 
      AND status = 'approved'
      AND (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can update messages" ON public.chat_messages
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages" ON public.chat_messages
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Notification policies update
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any notification" ON public.notifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create function to initialize teacher credits
CREATE OR REPLACE FUNCTION public.initialize_teacher_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.teacher_credits (teacher_id)
  VALUES (NEW.user_id)
  ON CONFLICT (teacher_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create credits when teacher application is approved
CREATE TRIGGER on_teacher_approved
  AFTER UPDATE ON public.teacher_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.initialize_teacher_credits();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;