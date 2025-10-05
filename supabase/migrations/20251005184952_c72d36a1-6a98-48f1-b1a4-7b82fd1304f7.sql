-- Add messages to realtime if not already added
DO $$
BEGIN
  -- Try to add messages table to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication
END $$;

-- Add indexes for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON public.messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON public.messages(recipient_id, read_at) 
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON public.conversations USING GIN(participants);

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM messages
  WHERE recipient_id = p_user_id
    AND read_at IS NULL;
$$;