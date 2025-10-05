-- Add conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add conversation_id to messages and attachments
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Create job_applicants table for tracking
CREATE TABLE IF NOT EXISTS job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'shortlisted', 'invited', 'withdrawn', 'rejected')),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, professional_id)
);

-- Create offer_negotiations table
CREATE TABLE IF NOT EXISTS offer_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT,
  proposed_amount NUMERIC,
  proposed_terms JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT DEFAULT 'booking' CHECK (event_type IN ('booking', 'availability', 'meeting', 'deadline')),
  location JSONB,
  attendees UUID[],
  recurrence_rule TEXT,
  external_calendar_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE job_applicants;
ALTER PUBLICATION supabase_realtime ADD TABLE offer_negotiations;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_job_applicants_job_id ON job_applicants(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applicants_professional_id ON job_applicants(professional_id);
CREATE INDEX IF NOT EXISTS idx_offer_negotiations_offer_id ON offer_negotiations(offer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id, created_at DESC);

-- RLS Policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they're part of"
ON conversations FOR SELECT
USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Participants can update conversations"
ON conversations FOR UPDATE
USING (auth.uid() = ANY(participants));

-- RLS Policies for job_applicants
ALTER TABLE job_applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job owners and applicants can view applicants"
ON job_applicants FOR SELECT
USING (
  auth.uid() = professional_id OR 
  auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_id)
);

CREATE POLICY "Professionals can apply to jobs"
ON job_applicants FOR INSERT
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Job owners and applicants can update status"
ON job_applicants FOR UPDATE
USING (
  auth.uid() = professional_id OR 
  auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_id)
);

-- RLS Policies for offer_negotiations
ALTER TABLE offer_negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offer parties can view negotiations"
ON offer_negotiations FOR SELECT
USING (
  auth.uid() IN (
    SELECT client_id FROM jobs WHERE id IN (
      SELECT job_id FROM offers WHERE id = offer_id
    )
  ) OR
  auth.uid() IN (
    SELECT tasker_id FROM offers WHERE id = offer_id
  )
);

CREATE POLICY "Offer parties can create negotiations"
ON offer_negotiations FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their calendar events"
ON calendar_events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Attendees can view events"
ON calendar_events FOR SELECT
USING (auth.uid() = ANY(attendees));

-- RLS Policies for activity_feed
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their activity feed"
ON activity_feed FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create activity feed entries"
ON activity_feed FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can mark activities as read"
ON activity_feed FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update messages RLS to include conversations
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM conversations WHERE auth.uid() = ANY(participants)
  )
);

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE auth.uid() = ANY(participants)
  ) OR
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Trigger to update job_applicants updated_at
CREATE OR REPLACE FUNCTION update_applicant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_applicant_update
  BEFORE UPDATE ON job_applicants
  FOR EACH ROW
  EXECUTE FUNCTION update_applicant_updated_at();