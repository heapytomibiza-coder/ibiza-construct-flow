-- =====================================================
-- FIX: Grants for public preview views
-- =====================================================

-- 1) Professionals public preview: grant SELECT on the view
GRANT SELECT ON public.public_professionals_preview TO anon, authenticated;

-- 2) Jobs public preview
-- For security_invoker views, caller needs:
-- (a) SELECT on the view
-- (b) SELECT on underlying columns the view reads
-- (c) RLS policies allowing the rows

-- 2A) Grant SELECT on the view
GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;

-- 2B) Grant minimal column SELECT on jobs to anon/authenticated
-- Based on actual view definition which reads:
-- id, title, description, budget_type, budget_value, location, 
-- created_at, published_at, status, micro_id, answers, is_publicly_listed
GRANT SELECT (
  id,
  title,
  description,      -- view reads left(description, 200) for teaser
  status,
  budget_type,
  budget_value,
  location,         -- view extracts area/town from location JSON
  micro_id,
  created_at,
  published_at,
  is_publicly_listed,
  answers           -- view checks answers->'extras'->'photos' for has_photos
) ON public.jobs TO anon, authenticated;

-- 2C) Ensure RLS allows anon to read only publicly listed jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_can_view_public_jobs_preview" ON public.jobs;

CREATE POLICY "anon_can_view_public_jobs_preview"
ON public.jobs
FOR SELECT
TO anon
USING (is_publicly_listed = true);

-- Also allow authenticated users to read public jobs via preview
DROP POLICY IF EXISTS "authenticated_can_view_public_jobs_preview" ON public.jobs;

CREATE POLICY "authenticated_can_view_public_jobs_preview"
ON public.jobs
FOR SELECT
TO authenticated
USING (is_publicly_listed = true);