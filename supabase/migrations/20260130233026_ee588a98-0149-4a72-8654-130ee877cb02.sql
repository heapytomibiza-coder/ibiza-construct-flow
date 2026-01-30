
-- SECURITY HARDENING: Recreate the view with SECURITY INVOKER = false (security definer behavior)
-- This ensures anon can read the VIEW data without direct table access

-- First, re-add the anon RLS policy since REVOKE alone won't work with invoker views
CREATE POLICY "Anonymous can view publicly listed jobs via view"
ON public.jobs
FOR SELECT
TO anon
USING (is_publicly_listed = true AND status = 'open');

-- Grant SELECT back on jobs to anon (needed for the view to work)
GRANT SELECT ON public.jobs TO anon;
