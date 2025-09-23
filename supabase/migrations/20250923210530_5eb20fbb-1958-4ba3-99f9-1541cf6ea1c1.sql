-- Update the function with proper search_path for security
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has admin role in their JWT claims
  -- This avoids querying the profiles table within a profiles policy
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'is_admin',
    'false'
  )::boolean;
END;
$$;