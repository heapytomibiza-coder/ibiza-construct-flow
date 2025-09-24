-- Add coverage area and service radius to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coverage_area TEXT,
ADD COLUMN IF NOT EXISTS service_radius INTEGER;