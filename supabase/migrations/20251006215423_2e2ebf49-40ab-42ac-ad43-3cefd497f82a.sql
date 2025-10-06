-- Phase 2: Automation Infrastructure
-- Create tables for automation workflows and executions

CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'job_created', 'job_completed', 'monthly_schedule', 
    'daily_schedule', 'hourly_schedule'
  )),
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  execution_count integer NOT NULL DEFAULT 0,
  success_rate numeric(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  last_executed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation workflows"
ON public.automation_workflows
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table for tracking automation executions
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  executed_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_message text,
  execution_data jsonb DEFAULT '{}'::jsonb,
  result_data jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automation executions"
ON public.automation_executions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert automation executions"
ON public.automation_executions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON public.automation_workflows(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger ON public.automation_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow ON public.automation_executions(workflow_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON public.automation_executions(status, executed_at DESC);

-- Create function to calculate real earnings from contracts and payments
CREATE OR REPLACE FUNCTION public.calculate_professional_earnings(
  p_professional_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  total_earnings numeric,
  completed_jobs integer,
  average_per_job numeric,
  currency text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pt.amount), 0) as total_earnings,
    COUNT(DISTINCT c.id)::integer as completed_jobs,
    CASE 
      WHEN COUNT(DISTINCT c.id) > 0 
      THEN COALESCE(SUM(pt.amount), 0) / COUNT(DISTINCT c.id)
      ELSE 0
    END as average_per_job,
    COALESCE(pt.currency, 'EUR') as currency
  FROM public.contracts c
  LEFT JOIN public.payment_transactions pt ON pt.user_id = p_professional_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  WHERE c.tasker_id = p_professional_id
    AND c.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  GROUP BY pt.currency;
END;
$$;

-- Create function to get top performing professionals
CREATE OR REPLACE FUNCTION public.get_top_performing_professionals(
  p_limit integer DEFAULT 10,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  professional_id uuid,
  professional_name text,
  total_earnings numeric,
  jobs_completed integer,
  average_rating numeric,
  success_rate numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id as professional_id,
    COALESCE(p.full_name, p.display_name, 'Unknown') as professional_name,
    COALESCE(SUM(pt.amount), 0) as total_earnings,
    COUNT(DISTINCT c.id)::integer as jobs_completed,
    COALESCE(AVG(r.rating), 0) as average_rating,
    CASE 
      WHEN COUNT(DISTINCT c.id) > 0 
      THEN (COUNT(DISTINCT c.id) FILTER (WHERE c.escrow_status = 'released'))::numeric / COUNT(DISTINCT c.id)::numeric * 100
      ELSE 0
    END as success_rate
  FROM public.professional_profiles pp
  LEFT JOIN public.profiles p ON p.id = pp.user_id
  LEFT JOIN public.contracts c ON c.tasker_id = pp.user_id
    AND c.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  LEFT JOIN public.payment_transactions pt ON pt.user_id = pp.user_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  LEFT JOIN public.reviews r ON r.professional_id = pp.user_id
    AND r.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  WHERE pp.verification_status = 'verified'
  GROUP BY pp.user_id, p.full_name, p.display_name
  ORDER BY total_earnings DESC, jobs_completed DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.calculate_professional_earnings IS 'Calculate real earnings for a professional from contracts and payments';
COMMENT ON FUNCTION public.get_top_performing_professionals IS 'Get top performing professionals based on earnings, completion rate, and ratings';