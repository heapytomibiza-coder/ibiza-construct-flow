-- Add RLS policy to allow anonymous users to view publicly listed jobs
-- This enables the public_jobs_preview view to work for unauthenticated visitors

CREATE POLICY "Anonymous can view publicly listed jobs"
ON public.jobs
FOR SELECT
TO anon
USING (is_publicly_listed = true AND status = 'open');