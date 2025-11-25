-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMPTZ,
  UNIQUE(client_id, professional_id, job_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'quote')),
  file_url TEXT,
  file_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_conversations_client ON public.conversations(client_id);
CREATE INDEX idx_conversations_professional ON public.conversations(professional_id);
CREATE INDEX idx_conversations_job ON public.conversations(job_id);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Clients can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Professionals can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Participants can update their conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- RLS Policies for messages
CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR professional_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR professional_id = auth.uid())
    )
  );

CREATE POLICY "Senders can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;