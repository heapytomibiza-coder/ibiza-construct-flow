-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  notification_types jsonb DEFAULT '{
    "payment_received": true,
    "payment_sent": true,
    "escrow_funded": true,
    "escrow_released": true,
    "milestone_approved": true,
    "milestone_rejected": true,
    "payout_requested": true,
    "payout_completed": true,
    "invoice_sent": true,
    "invoice_paid": true,
    "invoice_overdue": true,
    "refund_issued": true,
    "payment_failed": true
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment notifications log table
CREATE TABLE IF NOT EXISTS public.payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  failed_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment alerts table for system-wide alerts
CREATE TABLE IF NOT EXISTS public.payment_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('payment_processing_delay', 'suspicious_activity', 'large_transaction', 'escrow_expiring', 'invoice_overdue', 'payout_delayed', 'system_maintenance')),
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  affected_users uuid[],
  action_required boolean DEFAULT false,
  action_url text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  template_name text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  subject text,
  body_template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.payment_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.payment_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
  ON public.payment_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payment_alerts
CREATE POLICY "Users can view alerts affecting them"
  ON public.payment_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(affected_users) OR affected_users IS NULL);

CREATE POLICY "System can manage alerts"
  ON public.payment_alerts FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for notification_templates
CREATE POLICY "Templates are readable by authenticated users"
  ON public.notification_templates FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX idx_payment_notifications_user ON public.payment_notifications(user_id);
CREATE INDEX idx_payment_notifications_type ON public.payment_notifications(notification_type);
CREATE INDEX idx_payment_notifications_status ON public.payment_notifications(status);
CREATE INDEX idx_payment_alerts_severity ON public.payment_alerts(severity);
CREATE INDEX idx_payment_alerts_created ON public.payment_alerts(created_at);
CREATE INDEX idx_notification_templates_key ON public.notification_templates(template_key);

-- Add triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_notifications_updated_at
  BEFORE UPDATE ON public.payment_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_alerts_updated_at
  BEFORE UPDATE ON public.payment_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification templates
INSERT INTO public.notification_templates (template_key, template_name, channel, subject, body_template, variables) VALUES
('payment_received_email', 'Payment Received Email', 'email', 'Payment Received - {{amount}}', 'You have received a payment of {{amount}} from {{sender_name}}. Transaction ID: {{transaction_id}}', '["amount", "sender_name", "transaction_id"]'::jsonb),
('payment_sent_email', 'Payment Sent Email', 'email', 'Payment Sent - {{amount}}', 'Your payment of {{amount}} to {{recipient_name}} has been processed. Transaction ID: {{transaction_id}}', '["amount", "recipient_name", "transaction_id"]'::jsonb),
('escrow_funded_email', 'Escrow Funded Email', 'email', 'Escrow Funded - {{amount}}', 'Escrow has been funded with {{amount}} for milestone: {{milestone_title}}', '["amount", "milestone_title"]'::jsonb),
('milestone_approved_email', 'Milestone Approved Email', 'email', 'Milestone Approved - {{milestone_title}}', 'Your milestone "{{milestone_title}}" has been approved. Payment will be released shortly.', '["milestone_title"]'::jsonb),
('payout_completed_email', 'Payout Completed Email', 'email', 'Payout Completed - {{amount}}', 'Your payout of {{amount}} has been completed and should arrive in your account within 2-3 business days.', '["amount"]'::jsonb),
('invoice_paid_email', 'Invoice Paid Email', 'email', 'Invoice Paid - {{invoice_number}}', 'Invoice {{invoice_number}} has been paid. Amount: {{amount}}', '["invoice_number", "amount"]'::jsonb)
ON CONFLICT (template_key) DO NOTHING;