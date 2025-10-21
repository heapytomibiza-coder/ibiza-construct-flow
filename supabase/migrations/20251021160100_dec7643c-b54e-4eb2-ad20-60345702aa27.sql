-- Phase 1: Lock Down Public Data
-- Restrict profiles table to prevent PII exposure

-- Drop overly permissive policies on profiles
DROP POLICY IF EXISTS "Public can view professional profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create restricted profile access policy
CREATE POLICY "Authenticated users can view own or active professional profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR  -- Users can view their own profile
  has_role(auth.uid(), 'admin'::app_role) OR  -- Admins can view all
  EXISTS (  -- Or if it's an active professional profile
    SELECT 1 FROM professional_profiles pp
    WHERE pp.user_id = profiles.id 
    AND pp.is_active = true 
    AND pp.verification_status = 'verified'
  )
);

-- Restrict professional_profiles table
-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON professional_profiles;
DROP POLICY IF EXISTS "Public can view professional profiles" ON professional_profiles;

-- Create restricted policy for professional_profiles
CREATE POLICY "Limited professional profile access"
ON professional_profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR  -- Owners can view their own
  has_role(auth.uid(), 'admin'::app_role) OR  -- Admins can view all
  (is_active = true AND verification_status = 'verified')  -- Public can only see active verified profiles
);

-- Create a public view with only safe fields for professional profiles
CREATE OR REPLACE VIEW public.professional_profiles_public AS
SELECT 
  user_id,
  business_name,
  primary_trade,
  bio,
  tagline,
  hourly_rate,
  zones,
  service_regions,
  is_active,
  verification_status,
  instant_booking_enabled,
  response_time_hours,
  skills,
  experience_years,
  work_philosophy,
  created_at
FROM professional_profiles
WHERE is_active = true 
  AND verification_status = 'verified';

-- Grant access to the public view
GRANT SELECT ON public.professional_profiles_public TO authenticated, anon;

-- Restrict professional_stats to owners and admins only
DROP POLICY IF EXISTS "Anyone can view stats" ON professional_stats;
DROP POLICY IF EXISTS "Public can view professional stats" ON professional_stats;

CREATE POLICY "Owner and admins only for professional stats"
ON professional_stats FOR SELECT
TO authenticated
USING (
  professional_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure all other operations on professional_stats are restricted
CREATE POLICY "Owner can update own stats"
ON professional_stats FOR UPDATE
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Only owner can insert stats"
ON professional_stats FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());