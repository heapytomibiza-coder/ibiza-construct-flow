-- Ensure schema visibility for anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT permission on services_catalog view to anon and authenticated users
-- This is required because views need explicit grants separate from backing table RLS
GRANT SELECT ON public.services_catalog TO anon, authenticated;