
-- Security Hardening Migration
-- Fixes linter issues: missing RLS policies

-- Add missing RLS policy for message_attachment_metadata
CREATE POLICY "Users view attachment metadata" 
  ON public.message_attachment_metadata
  FOR SELECT 
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM public.messages 
      WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users insert attachment metadata"
  ON public.message_attachment_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    message_id IN (
      SELECT id FROM public.messages 
      WHERE sender_id = auth.uid()
    )
  );

-- Add missing RLS policy for message_threads  
CREATE POLICY "Conversation participants can manage threads"
  ON public.message_threads 
  FOR ALL
  TO authenticated
  USING (
    parent_message_id IN (
      SELECT m.id FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE auth.uid() IN (c.participant_1_id, c.participant_2_id)
    )
  )
  WITH CHECK (
    parent_message_id IN (
      SELECT m.id FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE auth.uid() IN (c.participant_1_id, c.participant_2_id)
    )
  );
