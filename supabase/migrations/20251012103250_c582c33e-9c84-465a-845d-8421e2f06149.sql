
-- Fix Security Definer Views by adding security_invoker=on
-- This ensures views respect RLS policies of the querying user, not the view creator

-- Drop and recreate currency_exchange_pairs view
DROP VIEW IF EXISTS public.currency_exchange_pairs;

CREATE VIEW public.currency_exchange_pairs
WITH (security_invoker=on)
AS
SELECT 
  from_currency,
  to_currency,
  rate,
  updated_at
FROM exchange_rates
UNION ALL
SELECT 
  to_currency AS from_currency,
  from_currency AS to_currency,
  (1.0 / rate) AS rate,
  updated_at
FROM exchange_rates;

-- Drop and recreate pricing_variance_summary view
DROP VIEW IF EXISTS public.pricing_variance_summary;

CREATE VIEW public.pricing_variance_summary
WITH (security_invoker=on)
AS
SELECT 
  project_type,
  COUNT(*) AS total_projects,
  AVG(variance_percentage) AS avg_variance,
  AVG(estimated_cost) AS avg_estimated,
  AVG(actual_cost) AS avg_actual,
  MIN(completion_date) AS earliest_completion,
  MAX(completion_date) AS latest_completion
FROM project_completions
WHERE actual_cost IS NOT NULL
GROUP BY project_type;

-- Drop and recreate services_catalog view
DROP VIEW IF EXISTS public.services_catalog;

CREATE VIEW public.services_catalog
WITH (security_invoker=on)
AS
SELECT 
  id,
  category,
  subcategory,
  micro,
  created_at,
  updated_at
FROM services_unified_v1
WHERE category IS NOT NULL 
  AND subcategory IS NOT NULL 
  AND micro IS NOT NULL
ORDER BY category, subcategory, micro;
