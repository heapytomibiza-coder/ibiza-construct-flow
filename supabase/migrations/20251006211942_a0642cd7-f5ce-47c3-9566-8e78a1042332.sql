-- Phase 4.1: Feature Flag Rollout Controls
ALTER TABLE public.feature_flags
ADD COLUMN IF NOT EXISTS rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
ADD COLUMN IF NOT EXISTS kill_switch_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_budget_threshold NUMERIC DEFAULT 0.05;

CREATE TABLE IF NOT EXISTS public.feature_flag_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exposed_at TIMESTAMPTZ DEFAULT now(),
  user_segment JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_flag_exposures_flag ON feature_flag_exposures(flag_key);
CREATE INDEX idx_flag_exposures_user ON feature_flag_exposures(user_id);
CREATE INDEX idx_flag_exposures_date ON feature_flag_exposures(exposed_at);

ALTER TABLE public.feature_flag_exposures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view flag exposures"
  ON public.feature_flag_exposures FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert exposures"
  ON public.feature_flag_exposures FOR INSERT
  WITH CHECK (true);

-- Function to determine if user should see a feature flag
CREATE OR REPLACE FUNCTION public.should_expose_feature(
  p_flag_key TEXT,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_user_hash INTEGER;
  v_exposure_threshold INTEGER;
BEGIN
  -- Get flag settings
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_flag_key AND is_enabled = true;

  -- If flag doesn't exist or is disabled, return false
  IF v_flag IS NULL THEN
    RETURN false;
  END IF;

  -- Check kill switch
  IF v_flag.kill_switch_active THEN
    RETURN false;
  END IF;

  -- If 100% rollout, expose to everyone
  IF v_flag.rollout_percentage = 100 THEN
    -- Log exposure
    INSERT INTO public.feature_flag_exposures (flag_key, user_id)
    VALUES (p_flag_key, p_user_id)
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;

  -- Calculate user hash (deterministic based on user_id)
  v_user_hash := ABS(HASHTEXT(p_user_id::TEXT)) % 100;
  v_exposure_threshold := v_flag.rollout_percentage;

  -- Expose if user hash is within threshold
  IF v_user_hash < v_exposure_threshold THEN
    -- Log exposure
    INSERT INTO public.feature_flag_exposures (flag_key, user_id)
    VALUES (p_flag_key, p_user_id)
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 4.3: Job Version History
CREATE TABLE IF NOT EXISTS public.job_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_versions_job ON job_versions(job_id);
CREATE INDEX idx_job_versions_created ON job_versions(created_at);

ALTER TABLE public.job_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their jobs"
  ON public.job_versions FOR SELECT
  USING (
    job_id IN (SELECT id FROM public.jobs WHERE client_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can create versions"
  ON public.job_versions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to create job version snapshot
CREATE OR REPLACE FUNCTION public.create_job_version(
  p_job_id UUID,
  p_changed_by UUID,
  p_change_reason TEXT,
  p_new_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_current_data JSONB;
  v_version_number INTEGER;
  v_version_id UUID;
  v_diff JSONB;
BEGIN
  -- Get current job data
  SELECT to_jsonb(j.*) INTO v_current_data
  FROM public.jobs j
  WHERE id = p_job_id;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM public.job_versions
  WHERE job_id = p_job_id;

  -- Calculate diff (simplified - just store both)
  v_diff := jsonb_build_object(
    'before', v_current_data,
    'after', p_new_data
  );

  -- Create version record
  INSERT INTO public.job_versions (
    job_id,
    version_number,
    snapshot_data,
    changed_by,
    change_reason,
    diff
  ) VALUES (
    p_job_id,
    v_version_number,
    v_current_data,
    p_changed_by,
    p_change_reason,
    v_diff
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 4.4: Report Exports
CREATE TABLE IF NOT EXISTS public.report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (
    report_type IN ('jobs', 'bookings', 'disputes', 'payouts', 'reviews', 'users', 'analytics')
  ),
  export_format TEXT NOT NULL CHECK (
    export_format IN ('csv', 'json', 'pdf')
  ),
  filters JSONB DEFAULT '{}'::jsonb,
  include_pii BOOLEAN DEFAULT false,
  file_path TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  error_message TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_report_exports_user ON report_exports(requested_by);
CREATE INDEX idx_report_exports_status ON report_exports(status);
CREATE INDEX idx_report_exports_created ON report_exports(created_at);

ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage exports"
  ON public.report_exports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get dashboard KPIs
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
  v_kpis JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'open'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_verifications', (SELECT COUNT(*) FROM professional_verifications WHERE status = 'pending'),
    'active_disputes', (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM payment_transactions 
      WHERE status IN ('completed', 'succeeded')
      AND created_at >= now() - interval '30 days'
    ),
    'pending_support_tickets', (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')),
    'flagged_reviews', (SELECT COUNT(*) FROM review_flags WHERE status = 'pending'),
    'sla_breaches', (
      SELECT COUNT(*) FROM support_tickets 
      WHERE status NOT IN ('resolved', 'closed')
      AND sla_deadline < now()
    )
  ) INTO v_kpis;

  RETURN v_kpis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;