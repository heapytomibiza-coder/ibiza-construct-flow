-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new admin policy that doesn't cause recursion
-- We'll use a function to check admin status from auth metadata
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create a new admin policy using the function
CREATE POLICY "Admins can view all profiles via function" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  auth.uid() = id OR public.is_admin_user()
);

-- Also ensure we have proper policies for other operations
-- Update policy for admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO public
USING (
  auth.uid() = id OR public.is_admin_user()
);