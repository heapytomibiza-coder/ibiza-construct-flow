-- Phase 2: Create notifications table for professional job alerts

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('job_match', 'offer_received', 'payment', 'system')),
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;