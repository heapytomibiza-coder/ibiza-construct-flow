-- Create booking reminders table
CREATE TABLE IF NOT EXISTS public.booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL, -- '24h', '2h', '30m'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivery_method TEXT NOT NULL DEFAULT 'email', -- 'email', 'sms', 'push', 'in_app'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id, reminder_type, delivery_method)
);

ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reminders" ON public.booking_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders" ON public.booking_reminders
  FOR ALL USING (true);

CREATE INDEX idx_booking_reminders_scheduled ON public.booking_reminders(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_booking_reminders_user ON public.booking_reminders(user_id);
CREATE INDEX idx_booking_reminders_booking ON public.booking_reminders(booking_id);

-- Create availability presets table
CREATE TABLE IF NOT EXISTS public.availability_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  working_hours JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.availability_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system presets" ON public.availability_presets
  FOR SELECT USING (is_system = true);

CREATE POLICY "Users can view their presets" ON public.availability_presets
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can manage their presets" ON public.availability_presets
  FOR ALL USING (created_by = auth.uid());

-- Insert default system presets
INSERT INTO public.availability_presets (name, description, working_hours, is_system) VALUES
('Weekdays 9-5', 'Standard business hours Monday to Friday', '{
  "monday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": false, "start": "09:00", "end": "17:00"}
}'::jsonb, true),
('Evenings & Weekends', 'Available after work hours and weekends', '{
  "monday": {"enabled": true, "start": "18:00", "end": "22:00"},
  "tuesday": {"enabled": true, "start": "18:00", "end": "22:00"},
  "wednesday": {"enabled": true, "start": "18:00", "end": "22:00"},
  "thursday": {"enabled": true, "start": "18:00", "end": "22:00"},
  "friday": {"enabled": true, "start": "18:00", "end": "22:00"},
  "saturday": {"enabled": true, "start": "10:00", "end": "20:00"},
  "sunday": {"enabled": true, "start": "10:00", "end": "20:00"}
}'::jsonb, true),
('Weekends Only', 'Saturday and Sunday availability', '{
  "monday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": true, "start": "09:00", "end": "18:00"},
  "sunday": {"enabled": true, "start": "09:00", "end": "18:00"}
}'::jsonb, true),
('24/7 Available', 'Always available any day, any time', '{
  "monday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "tuesday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "wednesday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "thursday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "friday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "saturday": {"enabled": true, "start": "00:00", "end": "23:59"},
  "sunday": {"enabled": true, "start": "00:00", "end": "23:59"}
}'::jsonb, true);

-- Create blocked dates table for holidays/time off
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date >= start_date)
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage blocked dates" ON public.blocked_dates
  FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates
  FOR SELECT USING (true);

CREATE INDEX idx_blocked_dates_professional ON public.blocked_dates(professional_id);
CREATE INDEX idx_blocked_dates_range ON public.blocked_dates(start_date, end_date);

-- Function to get pending reminders that need to be sent
CREATE OR REPLACE FUNCTION public.get_pending_reminders()
RETURNS TABLE (
  reminder_id UUID,
  booking_id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  event_title TEXT,
  event_start TIMESTAMPTZ,
  event_location JSONB,
  reminder_type TEXT,
  delivery_method TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.id,
    br.booking_id,
    br.user_id,
    au.email,
    p.full_name,
    ce.title,
    ce.start_time,
    ce.location,
    br.reminder_type,
    br.delivery_method
  FROM public.booking_reminders br
  JOIN public.calendar_events ce ON ce.id = br.booking_id
  JOIN public.profiles p ON p.id = br.user_id
  JOIN auth.users au ON au.id = br.user_id
  WHERE br.status = 'pending'
    AND br.scheduled_for <= now()
    AND ce.status NOT IN ('cancelled', 'no_show')
  ORDER BY br.scheduled_for ASC
  LIMIT 100;
END;
$$;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(
  p_reminder_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.booking_reminders
  SET 
    status = CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
    sent_at = CASE WHEN p_success THEN now() ELSE NULL END,
    error_message = p_error_message
  WHERE id = p_reminder_id;
END;
$$;

-- Function to create reminders for a booking
CREATE OR REPLACE FUNCTION public.create_booking_reminders(
  p_booking_id UUID,
  p_user_id UUID,
  p_event_start TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 24 hour reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '24h', p_event_start - interval '24 hours', 'email')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
  
  -- 2 hour reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '2h', p_event_start - interval '2 hours', 'email')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
  
  -- 30 minute in-app reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '30m', p_event_start - interval '30 minutes', 'in_app')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
END;
$$;

-- Trigger to auto-create reminders when calendar events are created
CREATE OR REPLACE FUNCTION public.trigger_create_booking_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type = 'booking' AND NEW.status = 'scheduled' THEN
    PERFORM public.create_booking_reminders(NEW.id, NEW.user_id, NEW.start_time);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_booking_reminders
  AFTER INSERT ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_create_booking_reminders();