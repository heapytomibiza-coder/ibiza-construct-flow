-- Fix database schema inconsistencies and conflicts

-- 1. Ensure proper foreign key references and constraints
-- Update existing foreign keys to reference profiles instead of auth.users where needed
-- (Most tables are already correctly referencing profiles)

-- 2. Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING gin(roles);
CREATE INDEX IF NOT EXISTS idx_profiles_active_role ON public.profiles(active_role);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON public.professional_profiles(user_id);

-- 3. Add missing RLS policies for better security
-- Add policy for admins to view all profiles (needed for admin functionality)
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE roles ? 'admin'::text
  )
);

-- 4. Fix professional_profiles table structure if needed
-- Ensure it has all necessary columns for onboarding data
ALTER TABLE public.professional_profiles 
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS portfolio_images jsonb DEFAULT '[]'::jsonb;

-- 5. Add RLS policy for professionals to create their own profile
CREATE POLICY "Professionals can create their own profile" ON public.professional_profiles
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Update the user creation trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, roles, active_role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE 
            WHEN NEW.raw_user_meta_data->>'intent_role' = 'professional' THEN '["professional"]'::jsonb
            WHEN NEW.raw_user_meta_data->>'intent_role' = 'client' THEN '["client"]'::jsonb
            ELSE '["client"]'::jsonb
        END,
        COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        roles = EXCLUDED.roles,
        active_role = EXCLUDED.active_role,
        updated_at = now();
    
    RETURN NEW;
END;
$$;

-- 7. Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Add function to safely get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT active_role FROM public.profiles WHERE id = user_id;
$$;

-- 9. Add function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND roles ? role_name::text
  );
$$;