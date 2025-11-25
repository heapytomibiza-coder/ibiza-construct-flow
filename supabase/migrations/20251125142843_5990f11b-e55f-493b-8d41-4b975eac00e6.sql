-- Fix search_path for Phase 14 functions

DROP FUNCTION IF EXISTS public.detect_booking_conflicts(UUID);
DROP FUNCTION IF EXISTS public.generate_next_occurrence(UUID);

CREATE OR REPLACE FUNCTION public.detect_booking_conflicts(p_booking_id UUID)
RETURNS TABLE(conflict_type TEXT, conflicting_id UUID, details JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'time_overlap'::TEXT,
    b2.id,
    jsonb_build_object(
      'booking1', p_booking_id,
      'booking2', b2.id,
      'reason', 'Time slots overlap'
    )
  FROM bookings b1
  CROSS JOIN bookings b2
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
SET search_path = public
AS $$
DECLARE
  v_next_date TIMESTAMPTZ;
  v_pattern TEXT;
  v_config JSONB;
BEGIN
  SELECT recurrence_pattern, recurrence_config, next_occurrence_date
  INTO v_pattern, v_config, v_next_date
  FROM recurring_bookings
  WHERE id = p_recurring_booking_id;
  
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