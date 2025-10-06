-- Phase 5: Complete Admin Platform Enhancement

-- ============================================
-- SECURITY & COMPLIANCE
-- ============================================

-- Two-Factor Authentication
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], -- Encrypted backup codes
  is_enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Session Management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IP Whitelist for Admin
CREATE TABLE IF NOT EXISTS public.admin_ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ip_address)
);

-- GDPR Data Export Requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PERFORMANCE & SCALE
-- ============================================

-- Cache Layer for KPIs
CREATE TABLE IF NOT EXISTS public.kpi_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Background Jobs Queue
CREATE TABLE IF NOT EXISTS public.background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  priority INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_status_priority ON public.background_jobs(status, priority DESC, created_at);

-- ============================================
-- ADVANCED INTELLIGENCE
-- ============================================

-- Fraud Detection Patterns
CREATE TABLE IF NOT EXISTS public.fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detection_count INTEGER DEFAULT 0,
  last_detected_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Professional Performance Scores
CREATE TABLE IF NOT EXISTS public.professional_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality_score NUMERIC(5,2) DEFAULT 0,
  reliability_score NUMERIC(5,2) DEFAULT 0,
  communication_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  rank_percentile NUMERIC(5,2),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(professional_id)
);

-- Revenue Forecasting
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_period TEXT NOT NULL, -- 'week', 'month', 'quarter'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  predicted_revenue NUMERIC(12,2) NOT NULL,
  confidence_level NUMERIC(5,2) DEFAULT 0,
  actual_revenue NUMERIC(12,2),
  variance NUMERIC(12,2),
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Churn Prediction
CREATE TABLE IF NOT EXISTS public.churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  churn_probability NUMERIC(5,2) NOT NULL,
  risk_factors JSONB DEFAULT '[]',
  predicted_churn_date DATE,
  prevention_actions JSONB DEFAULT '[]',
  is_prevented BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INTEGRATION HUB
-- ============================================

-- External Integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL CHECK (
    integration_type IN ('stripe', 'calendar', 'email', 'sms', 'webhook')
  ),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- Encrypted
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar Sync
CREATE TABLE IF NOT EXISTS public.calendar_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
  calendar_id TEXT NOT NULL,
  sync_token TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification Queue
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('email', 'sms', 'push', 'in_app')
  ),
  template_id TEXT,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'failed', 'cancelled')
  ),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_scheduled 
  ON public.notification_queue(status, scheduled_for) 
  WHERE status = 'pending';

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- 2FA Policies
CREATE POLICY "Users can view own 2FA" ON public.two_factor_auth
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2FA" ON public.two_factor_auth
  FOR ALL USING (auth.uid() = user_id);

-- Session Policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin IP Whitelist
CREATE POLICY "Admins can manage IP whitelist" ON public.admin_ip_whitelist
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Data Export Requests
CREATE POLICY "Users can view own export requests" ON public.data_export_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" ON public.data_export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- KPI Cache
CREATE POLICY "Admins can view cache" ON public.kpi_cache
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage cache" ON public.kpi_cache
  FOR ALL USING (true);

-- Background Jobs
CREATE POLICY "System can manage jobs" ON public.background_jobs
  FOR ALL USING (true);

-- Fraud Patterns
CREATE POLICY "Admins can view fraud patterns" ON public.fraud_patterns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Professional Scores
CREATE POLICY "Professionals can view own scores" ON public.professional_scores
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Public can view scores" ON public.professional_scores
  FOR SELECT USING (true);

-- Revenue Forecasts
CREATE POLICY "Admins can view forecasts" ON public.revenue_forecasts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Churn Predictions
CREATE POLICY "Admins can view churn predictions" ON public.churn_predictions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Integrations
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Calendar Sync
CREATE POLICY "Users can manage own calendar sync" ON public.calendar_sync
  FOR ALL USING (auth.uid() = user_id);

-- Notification Queue
CREATE POLICY "Users can view own notifications" ON public.notification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage notifications" ON public.notification_queue
  FOR ALL USING (true);

-- Webhooks
CREATE POLICY "Users can manage own webhooks" ON public.webhook_endpoints
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Cache Retrieval
CREATE OR REPLACE FUNCTION public.get_cached_kpi(p_cache_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_data JSONB;
BEGIN
  SELECT data INTO v_data
  FROM public.kpi_cache
  WHERE cache_key = p_cache_key
    AND expires_at > now();
  
  RETURN v_data;
END;
$$;

-- Calculate Professional Score
CREATE OR REPLACE FUNCTION public.calculate_professional_score(p_professional_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quality NUMERIC;
  v_reliability NUMERIC;
  v_communication NUMERIC;
  v_overall NUMERIC;
BEGIN
  -- Quality score based on reviews
  SELECT COALESCE(AVG(rating), 0) INTO v_quality
  FROM reviews WHERE professional_id = p_professional_id;
  
  -- Reliability score based on completion rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    0
  ) INTO v_reliability
  FROM booking_requests WHERE professional_id = p_professional_id;
  
  -- Communication score based on response times
  SELECT COALESCE(
    CASE 
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 3600 THEN 100
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 7200 THEN 85
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 14400 THEN 70
      ELSE 50
    END,
    0
  ) INTO v_communication
  FROM messages WHERE sender_id = p_professional_id;
  
  -- Overall score (weighted average)
  v_overall := (v_quality * 20 + v_reliability + v_communication * 0.5) / 1.5;
  
  INSERT INTO public.professional_scores (
    professional_id, quality_score, reliability_score, 
    communication_score, overall_score
  ) VALUES (
    p_professional_id, v_quality * 20, v_reliability, 
    v_communication, v_overall
  )
  ON CONFLICT (professional_id) DO UPDATE SET
    quality_score = EXCLUDED.quality_score,
    reliability_score = EXCLUDED.reliability_score,
    communication_score = EXCLUDED.communication_score,
    overall_score = EXCLUDED.overall_score,
    calculated_at = now();
END;
$$;

-- Detect Fraud Pattern
CREATE OR REPLACE FUNCTION public.detect_fraud_pattern(
  p_user_id UUID,
  p_pattern_type TEXT,
  p_severity TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.fraud_patterns (
    pattern_type, 
    pattern_data, 
    severity, 
    detection_count,
    last_detected_at
  ) VALUES (
    p_pattern_type,
    jsonb_build_object('user_id', p_user_id, 'detected_at', now()),
    p_severity,
    1,
    now()
  )
  ON CONFLICT (pattern_type) DO UPDATE SET
    detection_count = fraud_patterns.detection_count + 1,
    last_detected_at = now();
    
  RETURN true;
END;
$$;

-- Enhanced get_dashboard_kpis with caching
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cached JSONB;
  v_kpis JSONB;
BEGIN
  -- Try cache first
  v_cached := public.get_cached_kpi('dashboard_kpis');
  IF v_cached IS NOT NULL THEN
    RETURN v_cached;
  END IF;

  -- Calculate fresh KPIs
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
    ),
    'fraud_alerts', (SELECT COUNT(*) FROM fraud_patterns WHERE is_active = true AND last_detected_at > now() - interval '7 days'),
    'churn_risk_users', (SELECT COUNT(*) FROM churn_predictions WHERE churn_probability > 70)
  ) INTO v_kpis;

  -- Cache for 5 minutes
  INSERT INTO public.kpi_cache (cache_key, data, expires_at)
  VALUES ('dashboard_kpis', v_kpis, now() + interval '5 minutes')
  ON CONFLICT (cache_key) DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at;

  RETURN v_kpis;
END;
$$;