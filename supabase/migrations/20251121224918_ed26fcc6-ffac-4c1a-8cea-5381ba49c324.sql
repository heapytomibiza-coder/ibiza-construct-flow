-- Fix RLS policies to allow public viewing of verified professional profiles

-- Drop and recreate profiles SELECT policy for public (anonymous) users
DROP POLICY IF EXISTS "Public can view verified professional profiles" ON public.profiles;

CREATE POLICY "Public can view verified professional profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.professional_profiles pp
    WHERE pp.user_id = profiles.id
    AND pp.is_active = true
    AND pp.verification_status = 'verified'
  )
);