-- Add audit tracking columns to bookings table
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS micro_slug text,
  ADD COLUMN IF NOT EXISTS catalogue_version_used int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS origin text DEFAULT 'web';

-- Add index for micro_slug lookups
CREATE INDEX IF NOT EXISTS idx_bookings_micro_slug ON public.bookings(micro_slug);

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.micro_slug IS 'Stable micro-service identifier from services catalogue';
COMMENT ON COLUMN public.bookings.catalogue_version_used IS 'Version of service catalogue when booking was created';
COMMENT ON COLUMN public.bookings.locale IS 'Locale/language used when creating the booking';
COMMENT ON COLUMN public.bookings.origin IS 'Origin of booking creation (web, mobile, api)';