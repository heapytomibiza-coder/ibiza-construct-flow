
-- Fix SECURITY DEFINER views by enabling SECURITY INVOKER
-- This makes views respect RLS policies

-- Fix all public views
ALTER VIEW public.professional_profiles_public SET (security_invoker = on);
ALTER VIEW public.services_catalog SET (security_invoker = on);
ALTER VIEW public.currency_exchange_pairs SET (security_invoker = on);
ALTER VIEW public.pricing_variance_summary SET (security_invoker = on);
ALTER VIEW public.legacy_booking_requests SET (security_invoker = on);

-- Restrict materialized view from API access
-- Move analytics_live_kpis to a private schema or revoke access
REVOKE ALL ON public.analytics_live_kpis FROM anon, authenticated;
