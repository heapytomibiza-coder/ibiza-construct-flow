-- Add performance indexes for frequently queried tables (non-concurrent)
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_unread 
  ON activity_feed(user_id, read_at) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_priority 
  ON activity_feed(user_id, priority, created_at DESC) 
  WHERE dismissed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_status_created 
  ON jobs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_client_status 
  ON jobs(client_id, status);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_verified 
  ON professional_profiles(verification_status, is_active) 
  WHERE verification_status = 'verified' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date 
  ON analytics_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_insights_user_unread 
  ON business_insights(user_id, is_read) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_status 
  ON ai_recommendations(user_id, status, priority DESC);

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(recipient_id, created_at DESC) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_pending 
  ON payment_transactions(user_id, status) 
  WHERE status = 'pending';

-- Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_notification_digest_queue_pending 
  ON notification_digest_queue(user_id, scheduled_for) 
  WHERE sent_at IS NULL;

-- Add composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_contracts_tasker_status 
  ON contracts(tasker_id, escrow_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time 
  ON calendar_events(user_id, start_time, status);

-- GIN indexes for JSONB columns that are frequently queried
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties 
  ON analytics_events USING GIN (event_properties);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_data 
  ON ai_recommendations USING GIN (data);