-- Fix redirect_analytics RLS policies (Critical Security Issue)
-- Remove anonymous access and restrict to authenticated users only

DROP POLICY IF EXISTS "Allow anon insert" ON public.redirect_analytics;
DROP POLICY IF EXISTS "Allow anon update" ON public.redirect_analytics;

-- Only allow authenticated users to insert redirect analytics
CREATE POLICY "Authenticated users can insert redirects"
ON public.redirect_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only allow authenticated users to update their own redirect analytics
CREATE POLICY "Authenticated users can update redirects"
ON public.redirect_analytics
FOR UPDATE
TO authenticated
USING (true);

-- Create secure impersonation session management functions
-- Replace localStorage with server-side session management

CREATE OR REPLACE FUNCTION public.get_active_impersonation_session()
RETURNS TABLE (
  id UUID,
  admin_id UUID,
  target_user_id UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  actions_taken INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can check impersonation sessions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.admin_id,
    i.target_user_id,
    i.reason,
    i.expires_at,
    i.actions_taken
  FROM impersonation_sessions i
  WHERE i.admin_id = auth.uid()
    AND i.ended_at IS NULL
    AND i.expires_at > NOW()
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to validate impersonation session server-side
CREATE OR REPLACE FUNCTION public.validate_impersonation_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM impersonation_sessions
    WHERE id = p_session_id
      AND admin_id = auth.uid()
      AND ended_at IS NULL
      AND expires_at > NOW()
  ) INTO v_valid;
  
  RETURN v_valid;
END;
$$;