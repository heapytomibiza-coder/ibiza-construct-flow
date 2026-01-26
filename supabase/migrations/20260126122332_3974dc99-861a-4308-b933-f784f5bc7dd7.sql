-- Backfill missing user roles for existing profiles
INSERT INTO user_roles (user_id, role)
SELECT p.id, 
  CASE 
    WHEN p.active_role = 'professional' THEN 'professional'::app_role
    WHEN p.active_role = 'admin' THEN 'admin'::app_role
    ELSE 'client'::app_role
  END
FROM profiles p
WHERE p.id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create or replace trigger function to auto-assign role on profile creation
CREATE OR REPLACE FUNCTION public.ensure_user_role_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.active_role = 'professional' THEN 'professional'::app_role
      WHEN NEW.active_role = 'admin' THEN 'admin'::app_role
      ELSE 'client'::app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS ensure_user_role_on_profile_trigger ON profiles;

CREATE TRIGGER ensure_user_role_on_profile_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_role_on_profile();