-- Create admin_roles table (separate from user_roles for additional admin permissions)
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(admin_id, permission)
);

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_metrics table for dashboard analytics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_metadata JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_permissions
CREATE POLICY "Admins can view all permissions"
  ON public.admin_permissions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can grant permissions"
  ON public.admin_permissions
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can revoke permissions"
  ON public.admin_permissions
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for admin_audit_log
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for system_metrics
CREATE POLICY "Admins can view system metrics"
  ON public.system_metrics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert metrics"
  ON public.system_metrics
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_admin_permissions_admin ON public.admin_permissions(admin_id);
CREATE INDEX idx_admin_permissions_permission ON public.admin_permissions(permission);
CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at);
CREATE INDEX idx_admin_audit_log_entity ON public.admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX idx_system_metrics_recorded ON public.system_metrics(recorded_at);

-- Create function to get dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Check admin permission
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_professionals', (SELECT COUNT(*) FROM professional_profiles),
    'total_jobs', (SELECT COUNT(*) FROM jobs),
    'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'open'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'total_reviews', (SELECT COUNT(*) FROM reviews),
    'pending_disputes', (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status IN ('completed', 'succeeded')),
    'pending_payments', (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'pending')
  ) INTO stats;

  RETURN stats;
END;
$$;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;