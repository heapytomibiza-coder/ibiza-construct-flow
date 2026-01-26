-- Fix analytics_events INSERT policy for mixed anonymous/authenticated tracking
-- The previous policy blocked anonymous visitors from logging page views

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Authenticated insert analytics" ON public.analytics_events;

-- Allow anonymous inserts (for unauthenticated visitors)
-- They cannot claim to be a user (user_id must be NULL)
CREATE POLICY "Anon can insert analytics without user_id"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow authenticated inserts with ownership enforcement
-- If user_id is set, it must match auth.uid() (prevents impersonation)
-- If user_id is NULL, that's also allowed (session-only tracking)
CREATE POLICY "Authenticated can insert analytics with ownership"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL) OR (user_id = auth.uid())
);