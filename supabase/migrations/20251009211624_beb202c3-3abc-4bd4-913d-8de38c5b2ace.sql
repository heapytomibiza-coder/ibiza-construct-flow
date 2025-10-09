-- Allow public viewing of professional profiles (needed for discovery page)
-- This is safe because we only expose basic info like name and avatar

-- First, allow viewing profiles for users who are professionals
CREATE POLICY "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.professional_profiles pp
    WHERE pp.user_id = profiles.id 
    AND pp.is_active = true
  )
);

-- Also ensure professional_profiles can be viewed by anyone
DROP POLICY IF EXISTS "Anyone can view active professional profiles" ON public.professional_profiles;

CREATE POLICY "Anyone can view active professional profiles" 
ON public.professional_profiles 
FOR SELECT 
USING (is_active = true);