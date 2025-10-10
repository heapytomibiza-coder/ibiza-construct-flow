-- Drop the restrictive policy
DROP POLICY IF EXISTS "Secure job visibility - owners and qualified professionals only" ON public.jobs;

-- Create new permissive policy for viewing jobs
CREATE POLICY "Anyone can view open jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  (status = 'open') OR (auth.uid() = client_id)
);