-- Add certifications column to professional_profiles
ALTER TABLE public.professional_profiles 
ADD COLUMN certifications jsonb;