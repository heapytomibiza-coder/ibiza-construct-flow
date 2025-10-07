-- Phase 26: Enhanced Security & Compliance System

-- Security Events Table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  event_data JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT
);

-- Compliance Frameworks Table
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_name TEXT NOT NULL,
  framework_code TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Compliance Status Table
CREATE TABLE IF NOT EXISTS public.user_compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  framework_id UUID NOT NULL,
  compliance_score NUMERIC NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requirements_met JSONB DEFAULT '[]'::jsonb,
  requirements_pending JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, framework_id)
);

-- Data Privacy Controls Table
CREATE TABLE IF NOT EXISTS public.data_privacy_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  data_retention_days INTEGER DEFAULT 365,
  allow_analytics BOOLEAN DEFAULT true,
  allow_marketing BOOLEAN DEFAULT true,
  allow_third_party_sharing BOOLEAN DEFAULT false,
  encryption_enabled BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 60,
  ip_whitelist JSONB DEFAULT '[]'::jsonb,
  consent_given_at TIMESTAMPTZ,
  consent_version TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Audit Log Table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  result TEXT NOT NULL,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Two Factor Authentication Table
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'totp',
  secret_key TEXT NOT NULL,
  backup_codes JSONB DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Active Sessions Table
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  location JSONB DEFAULT '{}'::jsonb,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Breach Incidents Table
CREATE TABLE IF NOT EXISTS public.data_breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_users INTEGER NOT NULL DEFAULT 0,
  affected_data_types JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reported_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'investigating',
  remediation_steps JSONB DEFAULT '[]'::jsonb,
  impact_assessment TEXT,
  reported_by UUID,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Reports Table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  framework_id UUID,
  generated_by UUID,
  report_period_start TIMESTAMPTZ NOT NULL,
  report_period_end TIMESTAMPTZ NOT NULL,
  overall_score NUMERIC,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_compliance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_privacy_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Admins can manage security events"
  ON public.security_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own security events"
  ON public.security_events FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for compliance_frameworks
CREATE POLICY "Anyone can view active frameworks"
  ON public.compliance_frameworks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage frameworks"
  ON public.compliance_frameworks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_compliance_status
CREATE POLICY "Users can view their compliance status"
  ON public.user_compliance_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update compliance status"
  ON public.user_compliance_status FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update compliance status records"
  ON public.user_compliance_status FOR UPDATE
  USING (true);

-- RLS Policies for data_privacy_controls
CREATE POLICY "Users can manage their privacy controls"
  ON public.data_privacy_controls FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for security_audit_log
CREATE POLICY "Admins can view audit logs"
  ON public.security_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.security_audit_log FOR INSERT
  WITH CHECK (true);

-- RLS Policies for two_factor_auth
CREATE POLICY "Users can manage their 2FA settings"
  ON public.two_factor_auth FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for active_sessions
CREATE POLICY "Users can view their active sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
  ON public.active_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sessions"
  ON public.active_sessions FOR UPDATE
  USING (true);

-- RLS Policies for data_breach_incidents
CREATE POLICY "Admins can manage breach incidents"
  ON public.data_breach_incidents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for compliance_reports
CREATE POLICY "Admins can manage compliance reports"
  ON public.compliance_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(detected_at);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_user_compliance_status_user_id ON public.user_compliance_status(user_id);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);

-- Functions
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_category TEXT,
  p_severity TEXT DEFAULT 'low',
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_category, severity, event_data
  ) VALUES (
    p_user_id, p_event_type, p_event_category, p_severity, p_event_data
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_compliance_status(p_user_id UUID, p_framework_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_status
  FROM public.user_compliance_status
  WHERE user_id = p_user_id AND framework_id = p_framework_id;
  
  IF v_status IS NULL THEN
    v_result := jsonb_build_object(
      'compliant', false,
      'score', 0,
      'status', 'not_assessed'
    );
  ELSE
    v_result := jsonb_build_object(
      'compliant', v_status.status = 'compliant',
      'score', v_status.compliance_score,
      'status', v_status.status,
      'last_checked', v_status.last_checked_at
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Insert default compliance frameworks
INSERT INTO public.compliance_frameworks (framework_name, framework_code, description, requirements)
VALUES 
  (
    'GDPR', 
    'GDPR', 
    'General Data Protection Regulation - EU data protection law',
    '[
      {"id": "right_to_access", "name": "Right to Access", "description": "Users can access their personal data"},
      {"id": "right_to_erasure", "name": "Right to Erasure", "description": "Users can request data deletion"},
      {"id": "data_portability", "name": "Data Portability", "description": "Users can export their data"},
      {"id": "consent_management", "name": "Consent Management", "description": "Clear consent for data processing"},
      {"id": "breach_notification", "name": "Breach Notification", "description": "Notify users of data breaches within 72 hours"}
    ]'::jsonb
  ),
  (
    'CCPA', 
    'CCPA', 
    'California Consumer Privacy Act - California data protection law',
    '[
      {"id": "right_to_know", "name": "Right to Know", "description": "Disclose data collection practices"},
      {"id": "right_to_delete", "name": "Right to Delete", "description": "Users can request data deletion"},
      {"id": "right_to_opt_out", "name": "Right to Opt-Out", "description": "Opt-out of data sale"},
      {"id": "non_discrimination", "name": "Non-Discrimination", "description": "No discrimination for exercising rights"}
    ]'::jsonb
  ),
  (
    'SOC2', 
    'SOC2', 
    'Service Organization Control 2 - Security and compliance framework',
    '[
      {"id": "security", "name": "Security", "description": "Protect against unauthorized access"},
      {"id": "availability", "name": "Availability", "description": "System availability and uptime"},
      {"id": "confidentiality", "name": "Confidentiality", "description": "Protect confidential information"},
      {"id": "processing_integrity", "name": "Processing Integrity", "description": "System processing is complete and accurate"},
      {"id": "privacy", "name": "Privacy", "description": "Personal information protection"}
    ]'::jsonb
  )
ON CONFLICT (framework_code) DO NOTHING;