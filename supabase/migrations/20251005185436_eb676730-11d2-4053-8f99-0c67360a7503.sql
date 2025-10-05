-- Update professional_availability table for better scheduling
ALTER TABLE professional_availability
ADD COLUMN IF NOT EXISTS working_hours jsonb DEFAULT '{"monday":{"enabled":true,"start":"09:00","end":"17:00"},"tuesday":{"enabled":true,"start":"09:00","end":"17:00"},"wednesday":{"enabled":true,"start":"09:00","end":"17:00"},"thursday":{"enabled":true,"start":"09:00","end":"17:00"},"friday":{"enabled":true,"start":"09:00","end":"17:00"},"saturday":{"enabled":false},"sunday":{"enabled":false}}'::jsonb,
ADD COLUMN IF NOT EXISTS buffer_time_minutes integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS max_bookings_per_day integer DEFAULT 4;

-- Create index for availability queries
CREATE INDEX IF NOT EXISTS idx_professional_availability_status 
ON professional_availability(professional_id, status, available_until);

-- Update calendar_events table with additional fields
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add check constraint for event status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'calendar_events_status_check'
  ) THEN
    ALTER TABLE calendar_events 
    ADD CONSTRAINT calendar_events_status_check 
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'));
  END IF;
END $$;

-- Function to check professional availability for a time slot
CREATE OR REPLACE FUNCTION public.check_availability(
  p_professional_id uuid,
  p_start_time timestamp with time zone,
  p_end_time timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week text;
  v_working_hours jsonb;
  v_is_available boolean := false;
  v_conflicting_events integer;
BEGIN
  -- Get day of week
  v_day_of_week := lower(to_char(p_start_time, 'Day'));
  v_day_of_week := trim(v_day_of_week);
  
  -- Get working hours for professional
  SELECT working_hours INTO v_working_hours
  FROM professional_availability
  WHERE professional_id = p_professional_id;
  
  -- Check if day is enabled and time is within working hours
  IF v_working_hours IS NOT NULL AND 
     (v_working_hours->v_day_of_week->>'enabled')::boolean = true THEN
    v_is_available := true;
  END IF;
  
  -- Check for conflicting events
  IF v_is_available THEN
    SELECT COUNT(*) INTO v_conflicting_events
    FROM calendar_events
    WHERE user_id = p_professional_id
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );
    
    IF v_conflicting_events > 0 THEN
      v_is_available := false;
    END IF;
  END IF;
  
  RETURN v_is_available;
END;
$$;

-- Function to get available time slots for a professional
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_professional_id uuid,
  p_date date,
  p_duration_minutes integer DEFAULT 60
)
RETURNS TABLE(
  slot_start timestamp with time zone,
  slot_end timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week text;
  v_working_hours jsonb;
  v_start_time time;
  v_end_time time;
  v_buffer_minutes integer;
  v_current_slot timestamp with time zone;
  v_slot_end timestamp with time zone;
BEGIN
  -- Get day of week
  v_day_of_week := lower(to_char(p_date, 'Day'));
  v_day_of_week := trim(v_day_of_week);
  
  -- Get professional availability settings
  SELECT 
    pa.working_hours,
    COALESCE(pa.buffer_time_minutes, 15)
  INTO v_working_hours, v_buffer_minutes
  FROM professional_availability pa
  WHERE pa.professional_id = p_professional_id;
  
  -- Check if professional works this day
  IF v_working_hours IS NULL OR 
     (v_working_hours->v_day_of_week->>'enabled')::boolean = false THEN
    RETURN;
  END IF;
  
  -- Get working hours for the day
  v_start_time := (v_working_hours->v_day_of_week->>'start')::time;
  v_end_time := (v_working_hours->v_day_of_week->>'end')::time;
  
  -- Generate time slots
  v_current_slot := p_date + v_start_time;
  
  WHILE v_current_slot + (p_duration_minutes || ' minutes')::interval <= p_date + v_end_time LOOP
    v_slot_end := v_current_slot + (p_duration_minutes || ' minutes')::interval;
    
    -- Check if slot is available
    IF check_availability(p_professional_id, v_current_slot, v_slot_end) THEN
      slot_start := v_current_slot;
      slot_end := v_slot_end;
      RETURN NEXT;
    END IF;
    
    -- Move to next slot (duration + buffer)
    v_current_slot := v_current_slot + ((p_duration_minutes + v_buffer_minutes) || ' minutes')::interval;
  END LOOP;
  
  RETURN;
END;
$$;