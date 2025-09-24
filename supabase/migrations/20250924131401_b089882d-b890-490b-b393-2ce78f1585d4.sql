-- Create business_metrics table for tracking KPIs
CREATE TABLE public.business_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  previous_value NUMERIC,
  change_percentage NUMERIC,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  dimensions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_templates table for executive reports
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  template_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_reports table for storing report instances
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.report_templates(id),
  report_name TEXT NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Create alert_rules table for business alerting
CREATE TABLE public.alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  metric_name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  comparison_operator TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_channels JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_health_metrics table for platform monitoring
CREATE TABLE public.system_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  response_time_ms INTEGER,
  error_rate NUMERIC DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create analytics_dashboards table for custom dashboard configs
CREATE TABLE public.analytics_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dashboard_type TEXT NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '{}',
  widget_configs JSONB NOT NULL DEFAULT '[]',
  user_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_metrics
CREATE POLICY "Admins can manage business metrics" ON public.business_metrics
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- Create RLS policies for report_templates
CREATE POLICY "Admins can manage report templates" ON public.report_templates
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- Create RLS policies for generated_reports
CREATE POLICY "Admins can manage generated reports" ON public.generated_reports
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "Users can view reports generated for them" ON public.generated_reports
  FOR SELECT USING (auth.uid() = generated_by);

-- Create RLS policies for alert_rules
CREATE POLICY "Admins can manage alert rules" ON public.alert_rules
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- Create RLS policies for system_health_metrics
CREATE POLICY "Admins can manage system health metrics" ON public.system_health_metrics
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

-- Create RLS policies for analytics_dashboards
CREATE POLICY "Users can manage their own dashboards" ON public.analytics_dashboards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public dashboards are viewable by authenticated users" ON public.analytics_dashboards
  FOR SELECT USING (is_public = true AND auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_business_metrics_category_name ON public.business_metrics(metric_category, metric_name);
CREATE INDEX idx_business_metrics_period ON public.business_metrics(period_start, period_end);
CREATE INDEX idx_system_health_service_time ON public.system_health_metrics(service_name, recorded_at);
CREATE INDEX idx_generated_reports_template_period ON public.generated_reports(template_id, period_start, period_end);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_business_metrics_updated_at
  BEFORE UPDATE ON public.business_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at
  BEFORE UPDATE ON public.analytics_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();