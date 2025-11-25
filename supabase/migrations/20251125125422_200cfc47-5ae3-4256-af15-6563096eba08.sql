-- Phase 10: Clean up and recreate admin tables

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.platform_metrics CASCADE;
DROP TABLE IF EXISTS public.admin_activity_feed CASCADE;
DROP TABLE IF EXISTS public.admin_action_log CASCADE;
DROP TABLE IF EXISTS public.user_analytics CASCADE;
DROP TABLE IF EXISTS public.category_analytics CASCADE;
DROP TABLE IF EXISTS public.system_health_log CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_action(TEXT, TEXT, UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_activity(TEXT, TEXT, UUID, TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.update_admin_metrics_timestamp() CASCADE;

-- Admin roles table for role-based access control (create this first as others may reference it)
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to check if user is admin
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Platform metrics aggregation table
CREATE TABLE public.platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('daily', 'weekly', 'monthly')),
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  professional_users INTEGER DEFAULT 0,
  client_users INTEGER DEFAULT 0,
  
  -- Job metrics
  total_jobs INTEGER DEFAULT 0,
  new_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  cancelled_jobs INTEGER DEFAULT 0,
  avg_job_value DECIMAL(10,2),
  
  -- Financial metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  platform_fees DECIMAL(12,2) DEFAULT 0,
  escrow_balance DECIMAL(12,2) DEFAULT 0,
  
  -- Activity metrics
  total_messages INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  
  -- System health
  active_disputes INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  error_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(metric_date, metric_type)
);

-- Real-time activity feed for admin
CREATE TABLE public.admin_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  read_by UUID REFERENCES auth.users(id),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin action log for audit trail
CREATE TABLE public.admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  action_data JSONB,
  ip_address INET,
  user_agent TEXT,
  result TEXT CHECK (result IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User analytics detailed view
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  analytics_date DATE NOT NULL,
  
  -- Activity metrics
  jobs_posted INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  reviews_given INTEGER DEFAULT 0,
  reviews_received INTEGER DEFAULT 0,
  
  -- Financial metrics
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  avg_job_value DECIMAL(10,2),
  
  -- Behavior metrics
  response_time_minutes INTEGER,
  completion_rate DECIMAL(5,2),
  cancellation_rate DECIMAL(5,2),
  dispute_count INTEGER DEFAULT 0,
  
  -- Engagement
  login_count INTEGER DEFAULT 0,
  session_duration_minutes INTEGER,
  last_active_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, analytics_date)
);

-- Service category performance
CREATE TABLE public.category_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  analytics_date DATE NOT NULL,
  
  -- Volume metrics
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  avg_completion_time_days DECIMAL(5,2),
  
  -- Financial metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  avg_job_value DECIMAL(10,2),
  
  -- Quality metrics
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  dispute_rate DECIMAL(5,2),
  
  -- Professional metrics
  active_professionals INTEGER DEFAULT 0,
  avg_response_time_hours DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(category_id, analytics_date)
);

-- System health monitoring
CREATE TABLE public.system_health_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Database health
  db_connections INTEGER,
  db_response_time_ms INTEGER,
  db_storage_used_gb DECIMAL(8,2),
  
  -- Application health
  api_response_time_ms INTEGER,
  error_count INTEGER,
  warning_count INTEGER,
  
  -- Traffic metrics
  requests_per_minute INTEGER,
  active_sessions INTEGER,
  
  -- Storage metrics
  storage_used_gb DECIMAL(8,2),
  storage_limit_gb DECIMAL(8,2),
  
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'critical')),
  alerts JSONB
);

-- Enable RLS
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins manage platform_metrics" ON public.platform_metrics FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage admin_activity_feed" ON public.admin_activity_feed FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage admin_action_log" ON public.admin_action_log FOR ALL USING (public.is_admin());
CREATE POLICY "Admins read user_analytics" ON public.user_analytics FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins read category_analytics" ON public.category_analytics FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins read system_health_log" ON public.system_health_log FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins manage admin_roles" ON public.admin_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Admins view admin_roles" ON public.admin_roles FOR SELECT USING (public.is_admin());

-- Indexes
CREATE INDEX idx_platform_metrics_date ON public.platform_metrics(metric_date DESC);
CREATE INDEX idx_platform_metrics_type ON public.platform_metrics(metric_type);
CREATE INDEX idx_admin_activity_feed_created ON public.admin_activity_feed(created_at DESC);
CREATE INDEX idx_admin_activity_feed_severity ON public.admin_activity_feed(severity, is_read);
CREATE INDEX idx_admin_action_log_admin ON public.admin_action_log(admin_id, created_at DESC);
CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, analytics_date DESC);
CREATE INDEX idx_category_analytics_date ON public.category_analytics(analytics_date DESC);
CREATE INDEX idx_system_health_timestamp ON public.system_health_log(check_timestamp DESC);
CREATE INDEX idx_admin_roles_user ON public.admin_roles(user_id);

-- Helper functions
CREATE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_action_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  INSERT INTO public.admin_action_log (admin_id, action_type, target_type, target_id, action_data, result)
  VALUES (auth.uid(), p_action_type, p_target_type, p_target_id, p_action_data, 'success')
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.create_admin_activity(
  p_activity_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.admin_activity_feed (activity_type, entity_type, entity_id, user_id, title, description, severity, metadata)
  VALUES (p_activity_type, p_entity_type, p_entity_id, auth.uid(), p_title, p_description, p_severity, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE FUNCTION public.update_admin_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_platform_metrics_timestamp BEFORE UPDATE ON public.platform_metrics FOR EACH ROW EXECUTE FUNCTION public.update_admin_metrics_timestamp();
CREATE TRIGGER update_user_analytics_timestamp BEFORE UPDATE ON public.user_analytics FOR EACH ROW EXECUTE FUNCTION public.update_admin_metrics_timestamp();
CREATE TRIGGER update_category_analytics_timestamp BEFORE UPDATE ON public.category_analytics FOR EACH ROW EXECUTE FUNCTION public.update_admin_metrics_timestamp();