-- Phase 14: Advanced Booking & Scheduling System

-- Booking Templates
CREATE TABLE IF NOT EXISTS public.booking_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  default_duration INTEGER NOT NULL, -- minutes
  default_price DECIMAL(10,2),
  default_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recurring Bookings
CREATE TABLE IF NOT EXISTS public.recurring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  recurrence_pattern TEXT NOT NULL, -- daily, weekly, monthly, custom
  recurrence_config JSONB NOT NULL, -- frequency, interval, end_date, etc.
  next_occurrence_date TIMESTAMPTZ,
  occurrences_created INTEGER DEFAULT 0,
  max_occurrences INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Booking Conflicts
CREATE TABLE IF NOT EXISTS public.booking_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  conflicting_booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL, -- time_overlap, resource_unavailable, double_booking
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  conflict_details JSONB,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  detected_at TIMESTAMPTZ DEFAULT now()
);

-- Booking Workflows
CREATE TABLE IF NOT EXISTS public.booking_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- status_change, time_based, manual
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL, -- array of actions to perform
  is_active BOOLEAN DEFAULT true,
  execution_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Booking Workflow Executions
CREATE TABLE IF NOT EXISTS public.booking_workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.booking_workflows(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  execution_status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  execution_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Booking Time Slots
CREATE TABLE IF NOT EXISTS public.booking_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 1,
  booked_count INTEGER DEFAULT 0,
  price_override DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.booking_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_time_slots ENABLE ROW LEVEL SECURITY;

-- Booking Templates Policies
CREATE POLICY "Users can view their own booking templates"
  ON public.booking_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own booking templates"
  ON public.booking_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own booking templates"
  ON public.booking_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own booking templates"
  ON public.booking_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Bookings Policies
CREATE POLICY "Users can view recurring bookings for their bookings"
  ON public.recurring_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = recurring_bookings.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recurring bookings for their bookings"
  ON public.recurring_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = recurring_bookings.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recurring bookings for their bookings"
  ON public.recurring_bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = recurring_bookings.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- Booking Conflicts Policies
CREATE POLICY "Users can view conflicts for their bookings"
  ON public.booking_conflicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_conflicts.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "System can create booking conflicts"
  ON public.booking_conflicts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update conflicts for their bookings"
  ON public.booking_conflicts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_conflicts.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- Booking Workflows Policies
CREATE POLICY "Anyone can view active workflows"
  ON public.booking_workflows FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create workflows"
  ON public.booking_workflows FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their workflows"
  ON public.booking_workflows FOR UPDATE
  USING (auth.uid() = created_by);

-- Booking Workflow Executions Policies
CREATE POLICY "Users can view workflow executions for their bookings"
  ON public.booking_workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_workflow_executions.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "System can create workflow executions"
  ON public.booking_workflow_executions FOR INSERT
  WITH CHECK (true);

-- Booking Time Slots Policies
CREATE POLICY "Anyone can view available time slots"
  ON public.booking_time_slots FOR SELECT
  USING (is_available = true);

CREATE POLICY "Professionals can manage their time slots"
  ON public.booking_time_slots FOR ALL
  USING (auth.uid() = professional_id);

-- Indexes
CREATE INDEX idx_booking_templates_user ON public.booking_templates(user_id);
CREATE INDEX idx_booking_templates_service ON public.booking_templates(service_id);
CREATE INDEX idx_recurring_bookings_booking ON public.recurring_bookings(booking_id);
CREATE INDEX idx_recurring_bookings_next_occurrence ON public.recurring_bookings(next_occurrence_date) WHERE is_active = true;
CREATE INDEX idx_booking_conflicts_booking ON public.booking_conflicts(booking_id);
CREATE INDEX idx_booking_conflicts_unresolved ON public.booking_conflicts(booking_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_booking_workflows_active ON public.booking_workflows(trigger_type) WHERE is_active = true;
CREATE INDEX idx_booking_workflow_executions_workflow ON public.booking_workflow_executions(workflow_id);
CREATE INDEX idx_booking_workflow_executions_booking ON public.booking_workflow_executions(booking_id);
CREATE INDEX idx_booking_time_slots_professional_date ON public.booking_time_slots(professional_id, slot_date);
CREATE INDEX idx_booking_time_slots_available ON public.booking_time_slots(slot_date, is_available) WHERE is_available = true;

-- Functions
CREATE OR REPLACE FUNCTION public.detect_booking_conflicts(p_booking_id UUID)
RETURNS TABLE(conflict_type TEXT, conflicting_id UUID, details JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a simplified conflict detection
  -- In production, you'd have more sophisticated logic
  RETURN QUERY
  SELECT 
    'time_overlap'::TEXT,
    b2.id,
    jsonb_build_object(
      'booking1', p_booking_id,
      'booking2', b2.id,
      'reason', 'Time slots overlap'
    )
  FROM public.bookings b1
  CROSS JOIN public.bookings b2
  WHERE b1.id = p_booking_id
    AND b2.id != p_booking_id
    AND b1.status NOT IN ('cancelled', 'rejected')
    AND b2.status NOT IN ('cancelled', 'rejected');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_next_occurrence(p_recurring_booking_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_date TIMESTAMPTZ;
  v_pattern TEXT;
  v_config JSONB;
BEGIN
  SELECT recurrence_pattern, recurrence_config, next_occurrence_date
  INTO v_pattern, v_config, v_next_date
  FROM public.recurring_bookings
  WHERE id = p_recurring_booking_id;
  
  -- Simplified logic - in production, handle various recurrence patterns
  IF v_pattern = 'daily' THEN
    v_next_date := v_next_date + INTERVAL '1 day';
  ELSIF v_pattern = 'weekly' THEN
    v_next_date := v_next_date + INTERVAL '1 week';
  ELSIF v_pattern = 'monthly' THEN
    v_next_date := v_next_date + INTERVAL '1 month';
  END IF;
  
  RETURN v_next_date;
END;
$$;