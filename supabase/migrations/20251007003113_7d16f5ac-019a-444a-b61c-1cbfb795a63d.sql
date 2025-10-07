-- Fix demo accounts by ensuring they have the correct roles
-- Add missing admin role to demo-admin account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'demo-admin@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure demo accounts can update their own active_role in profiles
-- Create policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own active_role'
  ) THEN
    CREATE POLICY "Users can update their own active_role"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;