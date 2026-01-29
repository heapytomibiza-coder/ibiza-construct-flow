-- Add capability columns to professional_services table for enhanced matching
ALTER TABLE professional_services 
ADD COLUMN IF NOT EXISTS min_budget numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_work_solo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_helper boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tools_available text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications_required text[] DEFAULT '{}';

-- Add index for faster matching queries
CREATE INDEX IF NOT EXISTS idx_professional_services_matching 
ON professional_services(professional_id, micro_service_id, is_active) 
WHERE is_active = true;