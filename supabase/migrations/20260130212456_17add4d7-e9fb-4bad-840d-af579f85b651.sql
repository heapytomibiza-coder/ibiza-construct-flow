-- Fix public_jobs_preview: Remove address exposure, simplify status filter
-- Must DROP first since we're removing a column (address_preview)
DROP VIEW IF EXISTS public.public_jobs_preview;

CREATE VIEW public.public_jobs_preview 
WITH (security_invoker=on) AS
SELECT
  id,
  title,
  LEFT(COALESCE(description, ''), 200) AS teaser,
  budget_type,
  budget_value,
  -- SAFE: Only expose area/town via COALESCE fallback, NEVER address
  COALESCE(location->>'area', location->>'town', 'Ibiza') AS area,
  location->>'town' AS town,
  created_at,
  published_at,
  status,
  micro_id,
  CASE 
    WHEN answers->'extras'->'photos' IS NOT NULL 
         AND jsonb_array_length(answers->'extras'->'photos') > 0 
    THEN true 
    ELSE false 
  END AS has_photos
FROM public.jobs
WHERE is_publicly_listed = true;

-- Grant access to both anonymous and authenticated users
GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;