-- Add missing columns to disputes table
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS escalation_level integer DEFAULT 1;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS mediator_id uuid REFERENCES auth.users(id);
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS mediator_notes text;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS auto_close_date timestamp with time zone;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS response_deadline timestamp with time zone;

-- Create dispute_messages table for communication
CREATE TABLE IF NOT EXISTS dispute_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

-- Create dispute_timeline table for audit trail
CREATE TABLE IF NOT EXISTS dispute_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create dispute_resolutions table
CREATE TABLE IF NOT EXISTS dispute_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  resolution_type text NOT NULL,
  awarded_to uuid REFERENCES auth.users(id),
  amount numeric(10,2) DEFAULT 0,
  details text,
  agreed_by_client boolean DEFAULT false,
  agreed_by_professional boolean DEFAULT false,
  finalized_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dispute_messages
CREATE POLICY "Dispute parties can view messages"
  ON dispute_messages FOR SELECT
  USING (
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE created_by = auth.uid() OR disputed_against = auth.uid()
    )
    OR is_internal = false
  );

CREATE POLICY "Dispute parties can send messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE created_by = auth.uid() OR disputed_against = auth.uid()
    )
  );

CREATE POLICY "Admins can manage dispute messages"
  ON dispute_messages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for dispute_timeline
CREATE POLICY "Dispute parties can view timeline"
  ON dispute_timeline FOR SELECT
  USING (
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE created_by = auth.uid() OR disputed_against = auth.uid() OR resolved_by = auth.uid()
    )
  );

CREATE POLICY "System can insert timeline events"
  ON dispute_timeline FOR INSERT
  WITH CHECK (true);

-- RLS Policies for dispute_resolutions
CREATE POLICY "Dispute parties can view resolutions"
  ON dispute_resolutions FOR SELECT
  USING (
    dispute_id IN (
      SELECT id FROM disputes 
      WHERE created_by = auth.uid() OR disputed_against = auth.uid()
    )
  );

CREATE POLICY "Admins can manage resolutions"
  ON dispute_resolutions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_sender ON dispute_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_dispute ON dispute_timeline(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_resolutions_dispute ON dispute_resolutions(dispute_id);

-- Function to log dispute events
CREATE OR REPLACE FUNCTION log_dispute_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description)
    VALUES (NEW.id, 'created', NEW.created_by, 'Dispute opened: ' || NEW.title);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description, metadata)
      VALUES (
        NEW.id, 
        'status_changed', 
        auth.uid(),
        'Status changed from ' || OLD.status || ' to ' || NEW.status,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    IF OLD.escalation_level != NEW.escalation_level THEN
      INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description)
      VALUES (NEW.id, 'escalated', auth.uid(), 'Escalated to level ' || NEW.escalation_level);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for dispute events
DROP TRIGGER IF EXISTS trigger_log_dispute_event ON disputes;
CREATE TRIGGER trigger_log_dispute_event
  AFTER INSERT OR UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION log_dispute_event();

-- Function to check auto-close eligibility
CREATE OR REPLACE FUNCTION get_auto_closeable_disputes()
RETURNS TABLE(dispute_id uuid, days_open integer) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    EXTRACT(DAY FROM (now() - created_at))::integer
  FROM disputes
  WHERE status = 'resolved'
    AND auto_close_date IS NOT NULL
    AND auto_close_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;