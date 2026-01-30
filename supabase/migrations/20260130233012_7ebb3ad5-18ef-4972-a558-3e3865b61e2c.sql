
-- SECURITY HARDENING: Revoke direct SELECT on jobs table from anon
-- Anonymous users should ONLY access data through the public_jobs_preview view
-- This prevents them from querying jobs directly and seeing sensitive columns

REVOKE SELECT ON public.jobs FROM anon;

-- The view will still work because it runs with the definer's permissions
-- We need to ensure the view is set to security_definer or grant select on view
GRANT SELECT ON public.public_jobs_preview TO anon;

-- Drop the anon RLS policy since we're using REVOKE instead (cleaner approach)
DROP POLICY IF EXISTS "Anonymous can view publicly listed jobs" ON public.jobs;
