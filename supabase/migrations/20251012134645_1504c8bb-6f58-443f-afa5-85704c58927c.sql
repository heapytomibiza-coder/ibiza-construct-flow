-- Add notification preferences tables
CREATE TABLE IF NOT EXISTS notification_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE notification_digest_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their digest queue"
  ON notification_digest_queue
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage digest queue"
  ON notification_digest_queue
  FOR ALL
  USING (true);

-- Add indexes for performance
CREATE INDEX idx_notification_digest_queue_user 
  ON notification_digest_queue(user_id);

CREATE INDEX idx_notification_digest_queue_scheduled 
  ON notification_digest_queue(scheduled_for) 
  WHERE sent_at IS NULL;

-- Enable realtime for activity_feed (if not already enabled)
ALTER TABLE activity_feed REPLICA IDENTITY FULL;