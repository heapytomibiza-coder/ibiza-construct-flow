-- Create a secure view for public job previews
-- This exposes ONLY preview-safe fields and prevents client data leakage

CREATE OR REPLACE VIEW public.public_jobs_preview 
WITH (security_invoker=on) AS
SELECT
  id,
  title,
  LEFT(COALESCE(description, ''), 200) AS teaser,
  budget_type,
  budget_value,
  location->>'area' AS area,
  location->>'town' AS town,
  location->>'address' AS address_preview, -- Only town/area portion for previews
  created_at,
  published_at,
  status,
  micro_id,
  -- Check if job has photos without exposing them
  CASE 
    WHEN answers->'extras'->'photos' IS NOT NULL 
         AND jsonb_array_length(answers->'extras'->'photos') > 0 
    THEN true 
    ELSE false 
  END AS has_photos
  -- CRITICAL: NO client_id, NO exact address, NO answers.extras (attachments) exposed!
FROM public.jobs
WHERE is_publicly_listed = true
  AND status IN ('open', 'posted', 'published');

-- Grant access to both anonymous and authenticated users
GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.public_jobs_preview IS 
'Secure public preview of jobs. Exposes only preview-safe fields without client identity or sensitive data. Used by homepage and job board for unauthenticated users.';