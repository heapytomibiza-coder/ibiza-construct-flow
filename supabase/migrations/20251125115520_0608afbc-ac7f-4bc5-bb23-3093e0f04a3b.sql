-- Create notification_preferences table from scratch
CREATE TABLE IF NOT EXISTS public.notification_preferences (
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

-- Create review_reminder_dismissals table
CREATE TABLE IF NOT EXISTS public.review_reminder_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT NOT NULL CHECK (reason IN ('not_interested', 'snoozed', 'already_reviewed')),
  snooze_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contract_id, user_id)
);

-- Add reminder_count tracking to activity_feed
ALTER TABLE public.activity_feed
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reminder_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can manage their preferences') THEN
    CREATE POLICY "Users can manage their preferences"
      ON public.notification_preferences
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'System can manage all preferences') THEN
    CREATE POLICY "System can manage all preferences"
      ON public.notification_preferences
      FOR ALL
      USING (true);
  END IF;
END $$;

-- RLS Policies for review_reminder_dismissals
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reminder_dismissals' AND policyname = 'Users can manage their dismissals') THEN
    CREATE POLICY "Users can manage their dismissals"
      ON public.review_reminder_dismissals
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reminder_dismissals' AND policyname = 'System can manage all dismissals') THEN
    CREATE POLICY "System can manage all dismissals"
      ON public.review_reminder_dismissals
      FOR ALL
      USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
  ON public.notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_review_reminder_dismissals_lookup 
  ON public.review_reminder_dismissals(contract_id, user_id);

CREATE INDEX IF NOT EXISTS idx_activity_feed_reminder_tracking 
  ON public.activity_feed(user_id, notification_type, reminder_count) 
  WHERE notification_type = 'review_reminder';