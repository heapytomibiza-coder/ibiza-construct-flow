-- Create unified view pointing to services_unified_v1 (more complete data)
CREATE OR REPLACE VIEW public.services_catalog AS
SELECT 
  id,
  category,
  subcategory,
  micro,
  created_at,
  updated_at
FROM public.services_unified_v1
WHERE category IS NOT NULL 
  AND subcategory IS NOT NULL 
  AND micro IS NOT NULL
ORDER BY category, subcategory, micro;

-- Add performance indexes on backing table
CREATE INDEX IF NOT EXISTS idx_services_unified_v1_cat_sub 
  ON public.services_unified_v1 (category, subcategory);
  
CREATE INDEX IF NOT EXISTS idx_services_unified_v1_category 
  ON public.services_unified_v1 (category);

-- Add documentation comment
COMMENT ON VIEW public.services_catalog IS 
  'Canonical service catalogue for all app components (wizard, registry, search). Currently backed by services_unified_v1.';