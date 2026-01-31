-- Drop and recreate view with new schema (can't rename columns with CREATE OR REPLACE)
DROP VIEW IF EXISTS public.public_professionals_preview;

CREATE VIEW public.public_professionals_preview AS
SELECT
  pp.user_id,
  pp.user_id AS id,  -- alias for FK compatibility
  pp.business_name,
  pp.tagline,
  pp.skills,
  pp.verification_status,
  pp.is_active,
  pp.updated_at,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.coverage_area,
  p.created_at
FROM public.professional_profiles pp
JOIN public.profiles p ON p.id = pp.user_id
WHERE
  pp.is_active = true
  AND pp.verification_status = 'verified'
  AND pp.tagline IS NOT NULL;

-- Grant view access (not base tables)
GRANT SELECT ON public.public_professionals_preview TO anon, authenticated;

COMMENT ON VIEW public.public_professionals_preview IS 
'Public-safe list of verified + active professionals. Exposes limited profile fields. No security_invoker so anon can read via view owner privileges.';