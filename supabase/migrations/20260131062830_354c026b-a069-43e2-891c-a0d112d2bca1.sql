
-- =====================================================
-- SECURITY FIX MIGRATION
-- Fix: public_jobs_preview, admin_roles recursion, stripe_customers lockdown
-- =====================================================

-- ===========================================
-- 1) FIX is_super_admin() FUNCTION FOR ADMIN_ROLES
-- Create SECURITY DEFINER function to avoid infinite recursion
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result boolean;
BEGIN
  -- Check if user has super_admin role
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid()
      AND ar.role = 'super_admin'
  ) INTO result;
  
  RETURN COALESCE(result, false);
END;
$$;

-- Replace the recursive policy with function-based check
DROP POLICY IF EXISTS "Super admins manage admin_roles" ON public.admin_roles;

CREATE POLICY "Super admins manage admin_roles"
ON public.admin_roles
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- ===========================================
-- 2) FIX PUBLIC_JOBS_PREVIEW ACCESS
-- Grant view access + column-level grants on jobs table
-- ===========================================

-- 2A) Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;

-- 2B) Grant column-level SELECT on jobs for ONLY the safe columns used by the view
-- Based on view definition: id, title, description, budget_type, budget_value, 
-- location (for area/town extraction), created_at, published_at, status, micro_id, 
-- answers (for photos check), is_publicly_listed
GRANT SELECT (
  id,
  title,
  description,
  status,
  budget_type,
  budget_value,
  location,
  micro_id,
  created_at,
  published_at,
  is_publicly_listed,
  answers
) ON public.jobs TO anon;

-- 2C) Create RLS policy for anon to read only publicly listed jobs
DROP POLICY IF EXISTS "anon_can_view_public_jobs" ON public.jobs;

CREATE POLICY "anon_can_view_public_jobs"
ON public.jobs
FOR SELECT
TO anon
USING (is_publicly_listed = true);

-- ===========================================
-- 3) LOCK DOWN STRIPE_CUSTOMERS TABLE
-- Remove overly permissive policies, restrict to service_role only
-- ===========================================

-- 3A) Revoke all privileges from anon/authenticated
REVOKE ALL ON public.stripe_customers FROM anon;
REVOKE ALL ON public.stripe_customers FROM authenticated;

-- 3B) Re-grant only SELECT for users to see their own record
GRANT SELECT ON public.stripe_customers TO authenticated;

-- 3C) Ensure RLS is enabled and forced
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers FORCE ROW LEVEL SECURITY;

-- 3D) Drop the overly permissive "System can manage" policy
DROP POLICY IF EXISTS "System can manage Stripe customers" ON public.stripe_customers;

-- 3E) Keep the user-specific SELECT policy (already exists, but recreate to be sure)
DROP POLICY IF EXISTS "Users can view their own Stripe customer" ON public.stripe_customers;

CREATE POLICY "Users can view their own Stripe customer"
ON public.stripe_customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3F) Service role policy for backend operations
DROP POLICY IF EXISTS "Service role manages stripe_customers" ON public.stripe_customers;

CREATE POLICY "Service role manages stripe_customers"
ON public.stripe_customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===========================================
-- 4) ADDITIONAL SECURITY: Restrict analytics_events for anon
-- Anon can INSERT (for tracking) but not SELECT
-- ===========================================

-- Revoke SELECT from anon on analytics_events (privacy)
REVOKE SELECT ON public.analytics_events FROM anon;

-- Grant only INSERT for anonymous tracking
GRANT INSERT ON public.analytics_events TO anon;
