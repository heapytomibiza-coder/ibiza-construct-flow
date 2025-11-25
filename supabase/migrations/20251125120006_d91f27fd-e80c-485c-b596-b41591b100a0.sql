-- Fix notification_preferences table structure
-- Drop and recreate with correct structure
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'all',
  channels JSONB DEFAULT '["in_app", "email"]'::jsonb,
  enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest')),
  -- Granular review preferences
  review_received_enabled BOOLEAN DEFAULT true,
  review_response_enabled BOOLEAN DEFAULT true,
  review_helpful_enabled BOOLEAN DEFAULT false,
  review_reminders_enabled BOOLEAN DEFAULT true,
  review_reminders_frequency TEXT DEFAULT 'normal' CHECK (review_reminders_frequency IN ('normal', 'reduced', 'off')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all preferences"
  ON public.notification_preferences
  FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX idx_notification_preferences_user 
  ON public.notification_preferences(user_id);

CREATE INDEX idx_notification_preferences_user_type
  ON public.notification_preferences(user_id, notification_type);

-- Add index for JSONB metadata queries on activity_feed
CREATE INDEX IF NOT EXISTS idx_activity_feed_metadata_contract 
  ON public.activity_feed USING gin (metadata jsonb_path_ops);

-- Add index for reminder tracking
CREATE INDEX IF NOT EXISTS idx_activity_feed_reminder_lookup
  ON public.activity_feed(user_id, notification_type, reminder_count) 
  WHERE notification_type = 'review_reminder';