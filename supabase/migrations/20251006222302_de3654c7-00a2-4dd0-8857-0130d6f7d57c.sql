-- Phase 6: Performance Optimization - Strategic Indexes (Simplified)
-- Add high-impact indexes for frequently queried patterns

-- Jobs table optimizations
CREATE INDEX IF NOT EXISTS idx_jobs_status_created 
ON public.jobs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_client_status 
ON public.jobs(client_id, status);

-- Bookings table optimizations  
CREATE INDEX IF NOT EXISTS idx_bookings_client_status 
ON public.bookings(client_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_created 
ON public.bookings(created_at DESC);

-- Messages table optimizations  
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created 
ON public.messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(conversation_id, created_at DESC);

-- Conversations table optimizations
CREATE INDEX IF NOT EXISTS idx_conversations_updated 
ON public.conversations(last_message_at DESC);

-- Reviews table optimizations
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_created 
ON public.reviews(reviewee_id, created_at DESC);

-- Contracts table optimizations
CREATE INDEX IF NOT EXISTS idx_contracts_client_created 
ON public.contracts(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_tasker_created 
ON public.contracts(tasker_id, created_at DESC);

-- Calendar events optimizations
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start 
ON public.calendar_events(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_calendar_events_status 
ON public.calendar_events(status, start_time);

-- Query performance logging table
CREATE TABLE IF NOT EXISTS public.query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  table_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Admin can view performance logs
CREATE POLICY "Admins can view query performance logs"
ON public.query_performance_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert performance logs
CREATE POLICY "System can insert query performance logs"
ON public.query_performance_log FOR INSERT
WITH CHECK (true);

-- Index for query performance analysis
CREATE INDEX IF NOT EXISTS idx_query_perf_query_name 
ON public.query_performance_log(query_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_perf_slow 
ON public.query_performance_log(execution_time_ms DESC) 
WHERE execution_time_ms > 1000;