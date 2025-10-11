-- Calculator saved configurations
CREATE TABLE calculator_saved_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  config_name TEXT,
  project_type TEXT NOT NULL,
  selections JSONB NOT NULL,
  pricing_snapshot JSONB,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_calculator_configs_user ON calculator_saved_configs(user_id);
CREATE INDEX idx_calculator_configs_share ON calculator_saved_configs(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_calculator_configs_expires ON calculator_saved_configs(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE calculator_saved_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own configs"
  ON calculator_saved_configs
  FOR ALL
  USING (auth.uid() = user_id OR (is_public = true AND share_token IS NOT NULL));

CREATE POLICY "Public configs viewable by share token"
  ON calculator_saved_configs
  FOR SELECT
  USING (is_public = true AND share_token IS NOT NULL AND (expires_at IS NULL OR expires_at > now()));

-- Calculator share events tracking
CREATE TABLE calculator_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES calculator_saved_configs(id) ON DELETE CASCADE,
  share_method TEXT NOT NULL, -- 'link', 'email', 'pdf'
  recipient_email TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_share_events_config ON calculator_share_events(config_id);

ALTER TABLE calculator_share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view share events for their configs"
  ON calculator_share_events
  FOR SELECT
  USING (config_id IN (SELECT id FROM calculator_saved_configs WHERE user_id = auth.uid()));

CREATE POLICY "System can insert share events"
  ON calculator_share_events
  FOR INSERT
  WITH CHECK (true);