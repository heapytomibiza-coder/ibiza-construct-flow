-- AI Infrastructure Tables for Advanced Admin Dashboard

-- AI Runs - Track all AI operations with full audit trail
CREATE TABLE public.ai_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  prompt_template_id UUID,
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  confidence_score DECIMAL(5,4),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- AI Prompts - Versioned prompt templates for consistency and A/B testing
CREATE TABLE public.ai_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  parameters JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, version)
);

-- AI Alerts - Proactive notifications for anomalies and issues
CREATE TABLE public.ai_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job Lifecycle Events - Complete tracking of job state changes
CREATE TABLE public.job_lifecycle_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job Broadcasts - Track notification delivery and engagement
CREATE TABLE public.job_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  broadcast_type TEXT NOT NULL,
  target_criteria JSONB NOT NULL,
  professionals_notified INTEGER DEFAULT 0,
  professionals_viewed INTEGER DEFAULT 0,
  professionals_applied INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- System Activity Log - Comprehensive audit trail for all admin actions
CREATE TABLE public.system_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Metrics - Track system performance and optimization opportunities
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  dimensions JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Runs
CREATE POLICY "Admins can manage AI runs" ON public.ai_runs
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "Users can view their own AI runs" ON public.ai_runs
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for AI Prompts  
CREATE POLICY "Admins can manage AI prompts" ON public.ai_prompts
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "AI prompts are readable by authenticated users" ON public.ai_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for AI Alerts
CREATE POLICY "Admins can manage AI alerts" ON public.ai_alerts
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- RLS Policies for Job Lifecycle Events
CREATE POLICY "Admins can view all job lifecycle events" ON public.job_lifecycle_events
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "Admins can insert job lifecycle events" ON public.job_lifecycle_events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- RLS Policies for Job Broadcasts
CREATE POLICY "Admins can manage job broadcasts" ON public.job_broadcasts
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- RLS Policies for System Activity Log
CREATE POLICY "Admins can view activity log" ON public.system_activity_log
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "System can insert activity log" ON public.system_activity_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Performance Metrics
CREATE POLICY "Admins can manage performance metrics" ON public.performance_metrics
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- Indexes for Performance
CREATE INDEX idx_ai_runs_user_id ON public.ai_runs(user_id);
CREATE INDEX idx_ai_runs_operation_type ON public.ai_runs(operation_type);
CREATE INDEX idx_ai_runs_status ON public.ai_runs(status);
CREATE INDEX idx_ai_runs_created_at ON public.ai_runs(created_at);

CREATE INDEX idx_ai_prompts_name ON public.ai_prompts(name);
CREATE INDEX idx_ai_prompts_category ON public.ai_prompts(category);
CREATE INDEX idx_ai_prompts_active ON public.ai_prompts(is_active);

CREATE INDEX idx_ai_alerts_type ON public.ai_alerts(alert_type);
CREATE INDEX idx_ai_alerts_severity ON public.ai_alerts(severity);
CREATE INDEX idx_ai_alerts_status ON public.ai_alerts(status);
CREATE INDEX idx_ai_alerts_created_at ON public.ai_alerts(created_at);

CREATE INDEX idx_job_lifecycle_job_id ON public.job_lifecycle_events(job_id);
CREATE INDEX idx_job_lifecycle_event_type ON public.job_lifecycle_events(event_type);
CREATE INDEX idx_job_lifecycle_created_at ON public.job_lifecycle_events(created_at);

CREATE INDEX idx_job_broadcasts_job_id ON public.job_broadcasts(job_id);
CREATE INDEX idx_job_broadcasts_created_at ON public.job_broadcasts(created_at);

CREATE INDEX idx_activity_log_user_id ON public.system_activity_log(user_id);
CREATE INDEX idx_activity_log_action ON public.system_activity_log(action);
CREATE INDEX idx_activity_log_created_at ON public.system_activity_log(created_at);

CREATE INDEX idx_performance_metrics_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_recorded_at ON public.performance_metrics(recorded_at);

-- Functions for automatic tracking
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_activity_log (
    user_id, action, entity_type, entity_id, changes
  ) VALUES (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_changes
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for job lifecycle tracking
CREATE OR REPLACE FUNCTION public.track_job_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.job_lifecycle_events (
      job_id, event_type, from_status, to_status, triggered_by
    ) VALUES (
      NEW.id, 'status_change', OLD.status, NEW.status, auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to jobs table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS track_job_status_changes ON public.jobs;
    CREATE TRIGGER track_job_status_changes
      AFTER UPDATE ON public.jobs
      FOR EACH ROW
      EXECUTE FUNCTION public.track_job_lifecycle();
  END IF;
END $$;

-- Seed essential AI prompts
INSERT INTO public.ai_prompts (name, category, template, parameters) VALUES
('question_logic_tester', 'validation', 'Test the following service configuration for logical consistency and user experience:\n\nService: {{service_type}}\nCategory: {{category}}\nSubcategory: {{subcategory}}\nQuestions: {{questions}}\n\nAnalyze for:\n1. Question flow and dependencies\n2. Missing essential questions\n3. Redundant or confusing questions\n4. Pricing impact clarity\n\nProvide specific recommendations for improvement.', '{"service_type": "string", "category": "string", "subcategory": "string", "questions": "array"}'),

('price_band_validator', 'pricing', 'Analyze the following pricing configuration for market alignment:\n\nService: {{service_type}}\nLocation: {{location}}\nProposed Pricing: {{pricing_data}}\nHistorical Data: {{historical_data}}\n\nProvide:\n1. Market comparison analysis\n2. Pricing recommendations\n3. Risk assessment\n4. Confidence score (0-1)', '{"service_type": "string", "location": "string", "pricing_data": "object", "historical_data": "array"}'),

('professional_matcher', 'routing', 'Match professionals to the following job based on skills, location, availability, and past performance:\n\nJob Requirements: {{job_requirements}}\nLocation: {{location}}\nBudget: {{budget}}\nUrgency: {{urgency}}\n\nAvailable Professionals: {{professionals}}\n\nRank professionals by fit and provide explanation for each match. Include confidence scores.', '{"job_requirements": "object", "location": "string", "budget": "string", "urgency": "string", "professionals": "array"}'),

('communications_drafter', 'content', 'Generate professional communication for:\n\nType: {{communication_type}}\nContext: {{context}}\nRecipient: {{recipient_type}}\nTone: {{tone}}\n\nKey points to include:\n{{key_points}}\n\nGenerate appropriate subject line and body content.', '{"communication_type": "string", "context": "object", "recipient_type": "string", "tone": "string", "key_points": "array"}');

-- Create updated_at trigger for ai_prompts
CREATE TRIGGER update_ai_prompts_updated_at
  BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();