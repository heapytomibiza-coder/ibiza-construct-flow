-- Create ux_health_checks table for automated UX warnings
CREATE TABLE public.ux_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, 
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  entity_type TEXT,
  entity_id TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add priority weight for deterministic sorting
ALTER TABLE public.ux_health_checks 
ADD COLUMN priority_weight INTEGER GENERATED ALWAYS AS (
  CASE severity
    WHEN 'critical' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END
) STORED;

-- Indexes for fast queries
CREATE INDEX idx_ux_health_checks_status_priority_detected 
  ON public.ux_health_checks(status, priority_weight DESC, detected_at DESC);
CREATE INDEX idx_ux_health_checks_entity 
  ON public.ux_health_checks(entity_type, entity_id);
CREATE INDEX idx_ux_health_checks_check_type 
  ON public.ux_health_checks(check_type, detected_at DESC);

-- Enable RLS
ALTER TABLE public.ux_health_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin-only access)
CREATE POLICY "Admins can view all UX health checks"
  ON public.ux_health_checks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert UX health checks"
  ON public.ux_health_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update UX health checks"
  ON public.ux_health_checks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_ux_health_checks_updated_at
  BEFORE UPDATE ON public.ux_health_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule UX health checks to run every 6 hours
SELECT cron.schedule(
  'ux-health-monitor-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kcncrtayycwdwrxcgler.supabase.co/functions/v1/ux-health-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbmNydGF5eWN3ZHdyeGNnbGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Mzg4ODMsImV4cCI6MjA3NDExNDg4M30.TiZdy-jY7Ai0-rZFKChH_0-OwdBmxsaUxygYMwW_dpA"}'::jsonb,
    body := '{"action": "run_checks"}'::jsonb
  ) AS request_id;
  $$
);

COMMENT ON TABLE public.ux_health_checks IS 'Automated UX health warnings and friction point detection';