-- Enums for better type safety
CREATE TYPE tasker_onboarding_status AS ENUM ('not_started','in_progress','complete');

-- Enhance profiles table for dual-role identity
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_role text DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS tasker_onboarding_status tasker_onboarding_status DEFAULT 'not_started';

-- Data migration to set active_role based on existing roles
UPDATE profiles
SET active_role = CASE
  WHEN (roles::jsonb ? 'professional') THEN 'professional'
  ELSE 'client'
END
WHERE active_role = 'client';

-- Create form_sessions table for autosave functionality
CREATE TABLE IF NOT EXISTS form_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, form_type)
);

-- Enable RLS on form_sessions
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_sessions
CREATE POLICY "Users can manage their own form sessions"
  ON form_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS form_sessions_user_form_idx
  ON form_sessions(user_id, form_type);

-- Add trigger for updating timestamps
CREATE TRIGGER update_form_sessions_updated_at
  BEFORE UPDATE ON form_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();