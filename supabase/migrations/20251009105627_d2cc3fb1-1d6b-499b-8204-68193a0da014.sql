
-- Fix Security Definer Views by explicitly setting them as SECURITY INVOKER
-- This ensures views run with the permissions of the querying user, not the view creator

-- Drop and recreate currency_exchange_pairs as SECURITY INVOKER
DROP VIEW IF EXISTS public.currency_exchange_pairs;

CREATE VIEW public.currency_exchange_pairs 
WITH (security_invoker = true) AS
SELECT 
  from_currency,
  to_currency,
  rate,
  updated_at
FROM public.exchange_rates
UNION ALL
SELECT 
  to_currency as from_currency,
  from_currency as to_currency,
  1.0 / rate AS rate,
  updated_at
FROM public.exchange_rates;

COMMENT ON VIEW public.currency_exchange_pairs IS 
'Bidirectional currency exchange rate view. Runs with SECURITY INVOKER to enforce RLS policies of querying user.';

-- Drop and recreate services_catalog as SECURITY INVOKER  
DROP VIEW IF EXISTS public.services_catalog;

CREATE VIEW public.services_catalog
WITH (security_invoker = true) AS
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

COMMENT ON VIEW public.services_catalog IS
'Filtered services catalog view. Runs with SECURITY INVOKER to enforce RLS policies of querying user.';
