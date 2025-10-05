-- Add missing columns to professional_profiles for complete business info
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24;

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_professional_profiles_active 
  ON professional_profiles(is_active, verification_status) 
  WHERE is_active = true;