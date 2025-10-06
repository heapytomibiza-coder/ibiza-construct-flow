-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  payment_reminder_days INTEGER NOT NULL DEFAULT 3,
  invoice_notifications BOOLEAN NOT NULL DEFAULT true,
  payment_confirmation BOOLEAN NOT NULL DEFAULT true,
  dispute_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_payment_id UUID NOT NULL REFERENCES scheduled_payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('upcoming', 'overdue', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_reminders
CREATE POLICY "Users can view their own payment reminders"
  ON public.payment_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment reminders"
  ON public.payment_reminders FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled_payment_id ON public.payment_reminders(scheduled_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_user_id ON public.payment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at ON public.payment_reminders(sent_at);

-- Function to update notification_preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Function to get payments needing reminders
CREATE OR REPLACE FUNCTION get_payments_needing_reminders()
RETURNS TABLE(
  payment_id UUID,
  user_id UUID,
  schedule_id UUID,
  job_id UUID,
  amount NUMERIC,
  currency TEXT,
  due_date TIMESTAMPTZ,
  installment_number INTEGER,
  reminder_days INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as payment_id,
    ps.user_id,
    sp.schedule_id,
    ps.job_id,
    sp.amount,
    sp.currency,
    sp.due_date,
    sp.installment_number,
    COALESCE(np.payment_reminder_days, 3) as reminder_days
  FROM scheduled_payments sp
  JOIN payment_schedules ps ON ps.id = sp.schedule_id
  LEFT JOIN notification_preferences np ON np.user_id = ps.user_id
  WHERE sp.status = 'pending'
    AND sp.due_date <= NOW() + (COALESCE(np.payment_reminder_days, 3) || ' days')::INTERVAL
    AND sp.due_date > NOW()
    AND NOT EXISTS (
      SELECT 1 FROM payment_reminders pr
      WHERE pr.scheduled_payment_id = sp.id
        AND pr.reminder_type = 'upcoming'
        AND pr.sent_at > NOW() - INTERVAL '1 day'
    );
END;
$$;