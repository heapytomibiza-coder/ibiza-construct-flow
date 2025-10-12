-- Create client logs table for error tracking
CREATE TABLE IF NOT EXISTS public.client_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  stack TEXT,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin alerts table
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_logs_level ON public.client_logs(level);
CREATE INDEX IF NOT EXISTS idx_client_logs_created_at ON public.client_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_client_logs_user_id ON public.client_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_is_resolved ON public.admin_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON public.admin_alerts(created_at);

-- Enable RLS
ALTER TABLE public.client_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_logs (service role can insert, authenticated users can view their own)
CREATE POLICY "Service role can manage client logs"
  ON public.client_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view their own logs"
  ON public.client_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for admin_alerts (service role can manage, authenticated users can view)
CREATE POLICY "Service role can manage alerts"
  ON public.admin_alerts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Authenticated users can view alerts"
  ON public.admin_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);