-- Fix RLS policy for services_unified_v1 to allow anonymous access
DROP POLICY IF EXISTS "Services are publicly readable" ON services_unified_v1;

CREATE POLICY "Services are publicly readable"
ON services_unified_v1
FOR SELECT
TO anon, authenticated
USING (true);