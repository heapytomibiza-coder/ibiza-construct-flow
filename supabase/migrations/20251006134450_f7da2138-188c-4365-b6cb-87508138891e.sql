-- Phase O: Real-time Collaboration & Communication

-- Create presence tracking table
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'away', 'busy'
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  custom_status TEXT,
  status_emoji TEXT,
  device_info JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create typing indicators table
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 seconds'),
  UNIQUE(conversation_id, user_id)
);

-- Create video call sessions table
CREATE TABLE public.video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL UNIQUE,
  initiated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'ended', 'missed'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL, -- emoji like '👍', '❤️', '😂', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Create collaborative sessions table
CREATE TABLE public.collaborative_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT NOT NULL, -- 'whiteboard', 'document', 'screen_share'
  room_id TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL DEFAULT '{}',
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'ended'
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message threads table for replies
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_message_id, message_id)
);

-- Create read receipts table
CREATE TABLE public.read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_presence
CREATE POLICY "Users can update their own presence"
  ON public.user_presence FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view presence"
  ON public.user_presence FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for typing_indicators
CREATE POLICY "Users can manage their typing indicators"
  ON public.typing_indicators FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Conversation participants can view typing"
  ON public.typing_indicators FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE auth.uid() = ANY(participants)
  ));

-- RLS Policies for video_calls
CREATE POLICY "Participants can view their calls"
  ON public.video_calls FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants) OR auth.uid() = initiated_by);

CREATE POLICY "Users can initiate calls"
  ON public.video_calls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Participants can update calls"
  ON public.video_calls FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants) OR auth.uid() = initiated_by);

-- RLS Policies for message_reactions
CREATE POLICY "Users can manage their reactions"
  ON public.message_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone in conversation can view reactions"
  ON public.message_reactions FOR SELECT
  TO authenticated
  USING (message_id IN (
    SELECT m.id FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE auth.uid() = ANY(c.participants)
  ));

-- RLS Policies for collaborative_sessions
CREATE POLICY "Participants can view sessions"
  ON public.collaborative_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants) OR auth.uid() = host_id);

CREATE POLICY "Hosts can create sessions"
  ON public.collaborative_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants can update sessions"
  ON public.collaborative_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants) OR auth.uid() = host_id);

-- RLS Policies for message_threads
CREATE POLICY "Conversation participants can manage threads"
  ON public.message_threads FOR ALL
  TO authenticated
  USING (parent_message_id IN (
    SELECT m.id FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE auth.uid() = ANY(c.participants)
  ));

-- RLS Policies for read_receipts
CREATE POLICY "Users can create their read receipts"
  ON public.read_receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Conversation participants can view receipts"
  ON public.read_receipts FOR SELECT
  TO authenticated
  USING (message_id IN (
    SELECT m.id FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE auth.uid() = ANY(c.participants)
  ));

-- Create indexes
CREATE INDEX idx_user_presence_status ON public.user_presence(status);
CREATE INDEX idx_user_presence_last_seen ON public.user_presence(last_seen DESC);
CREATE INDEX idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_expires ON public.typing_indicators(expires_at);
CREATE INDEX idx_video_calls_status ON public.video_calls(status);
CREATE INDEX idx_video_calls_conversation ON public.video_calls(conversation_id);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_collaborative_sessions_status ON public.collaborative_sessions(status);
CREATE INDEX idx_message_threads_parent ON public.message_threads(parent_message_id);
CREATE INDEX idx_read_receipts_message ON public.read_receipts(message_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_realtime_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_video_calls_updated_at
  BEFORE UPDATE ON public.video_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_collaborative_sessions_updated_at
  BEFORE UPDATE ON public.collaborative_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

-- Function to cleanup expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM typing_indicators WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM user_presence 
    WHERE status = 'online' 
      AND last_seen > now() - interval '5 minutes'
  );
END;
$$;

-- Function to mark user as online
CREATE OR REPLACE FUNCTION mark_user_online(
  p_user_id UUID,
  p_custom_status TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, custom_status, device_info, last_seen)
  VALUES (p_user_id, 'online', p_custom_status, p_device_info, now())
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'online',
    custom_status = EXCLUDED.custom_status,
    device_info = EXCLUDED.device_info,
    last_seen = now(),
    updated_at = now();
END;
$$;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.read_receipts;