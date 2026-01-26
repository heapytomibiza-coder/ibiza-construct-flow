-- Phase 1: Harden the role assignment trigger
-- Replace existing trigger function to ALWAYS default to 'client' role
-- Never trust user-provided data for role assignment

CREATE OR REPLACE FUNCTION public.ensure_user_role_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always default to 'client' - never trust user-provided data for roles
  -- Role promotions must happen through admin-only functions
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;