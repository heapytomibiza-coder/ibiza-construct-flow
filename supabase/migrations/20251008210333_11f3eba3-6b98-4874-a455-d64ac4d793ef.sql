-- Create the is_feature_on RPC function for feature flag checking
CREATE OR REPLACE FUNCTION public.is_feature_on(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flag RECORD;
  v_user_id UUID;
BEGIN
  -- Get current user ID (may be null for anonymous users)
  v_user_id := auth.uid();
  
  -- Get the feature flag
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_key;
  
  -- If flag doesn't exist, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If kill switch is active, return false
  IF v_flag.kill_switch_active THEN
    RETURN FALSE;
  END IF;
  
  -- If flag is not enabled, return false
  IF NOT v_flag.enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check rollout percentage
  IF v_flag.rollout_percentage >= 100 THEN
    RETURN TRUE;
  END IF;
  
  -- For partial rollout, return true if rollout > 0
  -- In production, you might want more sophisticated rollout logic
  -- (e.g., based on user ID hash for consistent assignment)
  RETURN v_flag.rollout_percentage > 0;
END;
$$;