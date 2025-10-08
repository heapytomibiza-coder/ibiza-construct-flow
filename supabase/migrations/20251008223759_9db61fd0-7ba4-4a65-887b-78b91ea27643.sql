-- =============================================
-- Phase 1 Security Fix: Lock down user_roles
-- =============================================

-- 1) Drop dangerous policies that allow user self-assignment
DROP POLICY IF EXISTS "Users can insert their own roles during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- 2) Create dedicated audit table for role changes
CREATE TABLE IF NOT EXISTS public.user_roles_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,           -- who made the change
  target_user_id UUID,          -- user affected
  action TEXT NOT NULL,         -- 'insert'|'update'|'delete'
  old_row JSONB,
  new_row JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Recreate safe SELECT policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 4) Recreate admin-only management policy
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5) Create SECURITY DEFINER function for admins to assign roles
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  p_target_user_id uuid,
  p_role public.app_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  -- Ensure the caller is an admin
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, new_row)
  VALUES (v_actor, p_target_user_id, 'insert', to_jsonb(ROW(p_target_user_id, p_role)));
END;
$$;

-- 6) Create SECURITY DEFINER function for admins to revoke roles
CREATE OR REPLACE FUNCTION public.admin_revoke_role(
  p_target_user_id uuid,
  p_role public.app_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_old jsonb;
BEGIN
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Capture old row
  SELECT to_jsonb(ur.*) INTO v_old 
  FROM public.user_roles ur 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Delete role
  DELETE FROM public.user_roles 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, old_row)
  VALUES (v_actor, p_target_user_id, 'delete', v_old);
END;
$$;

-- 7) Create trigger function to log all direct changes
CREATE OR REPLACE FUNCTION public.log_user_roles_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, new_row)
    VALUES (auth.uid(), NEW.user_id, 'insert', to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, old_row, new_row)
    VALUES (auth.uid(), NEW.user_id, 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, old_row)
    VALUES (auth.uid(), OLD.user_id, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 8) Attach trigger to user_roles
DROP TRIGGER IF EXISTS trg_log_user_roles_change ON public.user_roles;
CREATE TRIGGER trg_log_user_roles_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_user_roles_change();

-- 9) Create RLS policy for audit log (admins can view)
ALTER TABLE public.user_roles_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON public.user_roles_audit_log;
CREATE POLICY "Admins can view audit log"
ON public.user_roles_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));