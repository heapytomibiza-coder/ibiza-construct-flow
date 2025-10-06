-- Phase 3.1: Review Moderation System
CREATE TABLE public.review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  flag_reason TEXT NOT NULL CHECK (
    flag_reason IN ('abuse', 'false_information', 'doxxing', 'off_platform_deal', 'spam', 'inappropriate')
  ),
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'under_review', 'resolved', 'dismissed')
  ),
  reviewed_by UUID REFERENCES auth.users(id),
  moderation_action TEXT CHECK (
    moderation_action IN ('redacted', 'removed', 'shadow_hidden', 'request_proof', 'dismissed')
  ),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_review_flags_review ON review_flags(review_id);
CREATE INDEX idx_review_flags_status ON review_flags(status);

ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can flag reviews"
  ON public.review_flags FOR INSERT
  WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can view all flags"
  ON public.review_flags FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update flags"
  ON public.review_flags FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add moderation fields to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (
  moderation_status IN ('pending', 'approved', 'hidden', 'removed')
),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Phase 3.2: Bulk Operations Functions
CREATE OR REPLACE FUNCTION public.bulk_user_suspend(
  user_ids UUID[],
  reason TEXT,
  suspended_by UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET updated_at = now()
  WHERE id = ANY(user_ids);
  
  INSERT INTO public.admin_audit_log (
    admin_id, action, entity_type, changes
  ) VALUES (
    suspended_by, 'bulk_suspend', 'user',
    jsonb_build_object('user_ids', user_ids, 'count', array_length(user_ids, 1), 'reason', reason)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.bulk_verification_action(
  verification_ids UUID[],
  action TEXT,
  reason TEXT,
  actioned_by UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.professional_verifications
  SET status = CASE 
    WHEN action = 'approve' THEN 'approved'
    WHEN action = 'reject' THEN 'rejected'
    ELSE status
  END,
  reviewed_by = actioned_by,
  reviewed_at = now()
  WHERE id = ANY(verification_ids);
  
  INSERT INTO public.admin_audit_log (
    admin_id, action, entity_type, changes
  ) VALUES (
    actioned_by, 'bulk_verification_' || action, 'verification',
    jsonb_build_object('verification_ids', verification_ids, 'count', array_length(verification_ids, 1), 'reason', reason)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 3.3: Helpdesk System
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')
  ),
  priority TEXT DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  category TEXT NOT NULL CHECK (
    category IN ('billing', 'technical', 'account', 'dispute', 'verification', 'other')
  ),
  subject TEXT NOT NULL,
  description TEXT,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.ticket_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_sla ON support_tickets(sla_deadline);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can view messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
    AND (NOT is_internal_note OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users and admins can send messages"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Users and admins can view attachments"
  ON public.ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Users and admins can upload attachments"
  ON public.ticket_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by 
    AND EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Function to calculate SLA deadline
CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(
  p_priority TEXT,
  p_created_at TIMESTAMPTZ DEFAULT now()
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE p_priority
    WHEN 'urgent' THEN p_created_at + INTERVAL '2 hours'
    WHEN 'high' THEN p_created_at + INTERVAL '8 hours'
    WHEN 'medium' THEN p_created_at + INTERVAL '24 hours'
    WHEN 'low' THEN p_created_at + INTERVAL '72 hours'
    ELSE p_created_at + INTERVAL '24 hours'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-set SLA deadline on ticket creation
CREATE OR REPLACE FUNCTION public.set_ticket_sla()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_deadline IS NULL THEN
    NEW.sla_deadline := public.calculate_sla_deadline(NEW.priority, NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_sla
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_sla();

-- Function to get tickets needing SLA breach alerts
CREATE OR REPLACE FUNCTION public.get_sla_breach_tickets()
RETURNS TABLE(
  ticket_id UUID,
  ticket_number INTEGER,
  subject TEXT,
  priority TEXT,
  user_id UUID,
  assigned_to UUID,
  sla_deadline TIMESTAMPTZ,
  minutes_until_breach INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.ticket_number,
    st.subject,
    st.priority,
    st.user_id,
    st.assigned_to,
    st.sla_deadline,
    EXTRACT(EPOCH FROM (st.sla_deadline - now()))::INTEGER / 60 as minutes_until_breach
  FROM public.support_tickets st
  WHERE st.status IN ('open', 'in_progress', 'waiting_response')
    AND st.sla_deadline IS NOT NULL
    AND st.sla_deadline <= now() + INTERVAL '2 hours'
  ORDER BY st.sla_deadline ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;