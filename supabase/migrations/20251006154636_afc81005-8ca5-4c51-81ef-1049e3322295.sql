-- ============================================================================
-- Phase 15.2: Timeline & Communication Hub
-- Transparent, structured communication with automated tracking
-- ============================================================================

-- 1) Add new fields to dispute_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'dispute_messages' 
                 AND column_name = 'response_time_seconds') THEN
    ALTER TABLE public.dispute_messages ADD COLUMN response_time_seconds integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'dispute_messages' 
                 AND column_name = 'template_used') THEN
    ALTER TABLE public.dispute_messages ADD COLUMN template_used text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'dispute_messages' 
                 AND column_name = 'is_admin_note') THEN
    ALTER TABLE public.dispute_messages ADD COLUMN is_admin_note boolean DEFAULT false;
  END IF;
END$$;

-- 2) Add new fields to disputes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'disputes' 
                 AND column_name = 'escalation_reasons') THEN
    ALTER TABLE public.disputes ADD COLUMN escalation_reasons jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'disputes' 
                 AND column_name = 'last_activity_at') THEN
    ALTER TABLE public.disputes ADD COLUMN last_activity_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- 3) Function to calculate message response time
CREATE OR REPLACE FUNCTION public.set_message_response_time()
RETURNS trigger AS $$
DECLARE
  prev_msg record;
BEGIN
  -- Find previous message from different sender
  SELECT created_at INTO prev_msg
  FROM public.dispute_messages
  WHERE dispute_id = NEW.dispute_id
    AND sender_id != NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF prev_msg IS NOT NULL THEN
    NEW.response_time_seconds := EXTRACT(EPOCH FROM (NEW.created_at - prev_msg.created_at))::integer;
  ELSE
    NEW.response_time_seconds := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_msg_response_time ON public.dispute_messages;
CREATE TRIGGER trg_set_msg_response_time
BEFORE INSERT ON public.dispute_messages
FOR EACH ROW EXECUTE FUNCTION public.set_message_response_time();

-- 4) Function to update dispute last_activity_at
CREATE OR REPLACE FUNCTION public.update_dispute_last_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE public.disputes
  SET last_activity_at = now()
  WHERE id = NEW.dispute_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_dispute_activity_on_message ON public.dispute_messages;
CREATE TRIGGER trg_update_dispute_activity_on_message
AFTER INSERT ON public.dispute_messages
FOR EACH ROW EXECUTE FUNCTION public.update_dispute_last_activity();

DROP TRIGGER IF EXISTS trg_update_dispute_activity_on_timeline ON public.dispute_timeline;
CREATE TRIGGER trg_update_dispute_activity_on_timeline
AFTER INSERT ON public.dispute_timeline
FOR EACH ROW EXECUTE FUNCTION public.update_dispute_last_activity();

-- 5) Function to check and update escalation reasons
CREATE OR REPLACE FUNCTION public.escalation_reasons_updater(p_dispute_id uuid)
RETURNS void AS $$
DECLARE
  d record;
  new_reasons jsonb := '{}'::jsonb;
BEGIN
  SELECT * INTO d FROM public.disputes WHERE id = p_dispute_id;
  IF d IS NULL THEN RETURN; END IF;

  -- Check inactivity > 48h
  IF d.last_activity_at IS NOT NULL AND (now() - d.last_activity_at) > interval '48 hours' THEN
    new_reasons := new_reasons || jsonb_build_object(
      'inactivity_hours', 
      EXTRACT(EPOCH FROM (now() - d.last_activity_at))/3600
    );
  END IF;

  -- Check deadline passed
  IF d.response_deadline IS NOT NULL AND now() > d.response_deadline THEN
    new_reasons := new_reasons || jsonb_build_object(
      'deadline_passed', 
      true,
      'hours_overdue',
      EXTRACT(EPOCH FROM (now() - d.response_deadline))/3600
    );
  END IF;

  -- Update escalation reasons if any found
  IF new_reasons != '{}'::jsonb THEN
    UPDATE public.disputes 
    SET escalation_reasons = COALESCE(escalation_reasons, '{}'::jsonb) || new_reasons
    WHERE id = p_dispute_id;

    -- Add timeline event
    INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
    VALUES (
      p_dispute_id,
      'deadline_warning',
      'Escalation check triggered',
      new_reasons
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Enable realtime for disputes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;

-- 7) Update RLS policies (already exist, just verify they're enabled)
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_timeline ENABLE ROW LEVEL SECURITY;

-- 8) Add index for performance
CREATE INDEX IF NOT EXISTS idx_disputes_last_activity ON public.disputes(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_created ON public.dispute_messages(dispute_id, created_at);
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_created ON public.dispute_timeline(dispute_id, created_at);