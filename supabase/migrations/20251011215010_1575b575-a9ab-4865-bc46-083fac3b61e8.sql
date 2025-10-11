-- Add missing columns for professional onboarding flow
ALTER TABLE public.professional_profiles 
ADD COLUMN IF NOT EXISTS intro_categories jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS service_regions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_phase text DEFAULT 'not_started';