
-- SECURITY HARDENING: View-only access for anonymous users
-- This prevents column leakage by blocking direct table access

-- 1) Revoke direct table access from anon
REVOKE SELECT ON TABLE public.jobs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.jobs FROM anon;

-- 2) Grant access to the safe view only
GRANT SELECT ON public.public_jobs_preview TO anon;

-- 3) Ensure authenticated users can still read jobs
GRANT SELECT ON TABLE public.jobs TO authenticated;

-- 4) Drop the anon RLS policy on jobs table since anon can't access the table anyway
-- (The view still uses the view's WHERE clause for filtering)
DROP POLICY IF EXISTS "Anonymous can view publicly listed jobs via view" ON public.jobs;

-- Note: The authenticated RLS policy remains in place for logged-in users
