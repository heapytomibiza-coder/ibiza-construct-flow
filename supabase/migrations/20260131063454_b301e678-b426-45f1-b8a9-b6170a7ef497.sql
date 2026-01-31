-- =====================================================
-- PROFILES TABLE SECURITY HARDENING
-- Fix: Customer Personal Data Exposed to Public Internet
-- =====================================================

-- Ensure RLS is on and enforced
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Remove broad grants (defense in depth)
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.profiles FROM authenticated;

-- Allow authenticated to interact, but only through RLS policies
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Public can view verified professional profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Owner-only SELECT
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Owner-only UPDATE
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Owner-only INSERT (for profile creation)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Admin access via security definer function (uses existing is_super_admin)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- =====================================================
-- PUBLIC PROFESSIONALS DIRECTORY (Safe View)
-- Exposes ONLY non-sensitive fields for verified pros
-- No email, phone, notification_preferences, location exposed
-- =====================================================

CREATE OR REPLACE VIEW public.public_professionals_preview
WITH (security_invoker = on) AS
SELECT
  id,
  display_name,
  avatar_url,
  bio,
  verification_status,
  coverage_area,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';

-- Grant read access to everyone for the safe view
GRANT SELECT ON public.public_professionals_preview TO anon, authenticated;