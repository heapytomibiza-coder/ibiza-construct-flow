-- Phase 4: Database Cleanup & Migration
-- Mark booking_requests table as deprecated

-- Add deprecation tracking
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMPTZ DEFAULT NOW();

-- Add table comment indicating deprecation
COMMENT ON TABLE public.booking_requests IS 
'DEPRECATED: This table is maintained for historical data only. All new quote workflows use the job_quotes table. Do not use this table for new features.';

-- Create legacy view for historical reporting
CREATE OR REPLACE VIEW public.legacy_booking_requests AS
SELECT 
  br.id,
  br.client_id,
  br.professional_id,
  br.service_id,
  br.title,
  br.description,
  br.status,
  br.total_estimated_price,
  br.professional_quote,
  br.created_at,
  br.updated_at,
  p.full_name as client_name,
  pp.full_name as professional_name
FROM public.booking_requests br
LEFT JOIN public.profiles p ON p.id = br.client_id
LEFT JOIN public.profiles pp ON pp.id = br.professional_id
ORDER BY br.created_at DESC;

-- Grant access to legacy view
GRANT SELECT ON public.legacy_booking_requests TO authenticated;

-- Add comment to job_quotes confirming it as primary system
COMMENT ON TABLE public.job_quotes IS 
'PRIMARY QUOTE SYSTEM: All new quote workflows use this table. Replaces the deprecated booking_requests system.';

-- Verify job_quotes notification triggers exist
DO $$
BEGIN
  -- Check if notify_on_quote_status_change trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'notify_on_quote_status_change'
  ) THEN
    RAISE NOTICE 'WARNING: notify_on_quote_status_change trigger is missing';
  END IF;
  
  -- Check if notify_professional_on_new_quote trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'notify_professional_on_new_quote'
  ) THEN
    RAISE NOTICE 'WARNING: notify_professional_on_new_quote trigger is missing';
  END IF;
END $$;