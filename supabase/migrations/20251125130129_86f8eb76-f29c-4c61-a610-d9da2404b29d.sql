-- Phase 11: Professional Tools & Insights System
-- Clean slate: Drop existing objects if they exist

DROP TABLE IF EXISTS public.professional_metrics CASCADE;
DROP TABLE IF EXISTS public.professional_insights CASCADE;
DROP TABLE IF EXISTS public.revenue_forecasts CASCADE;
DROP TABLE IF EXISTS public.competitor_benchmarks CASCADE;
DROP FUNCTION IF EXISTS public.update_professional_metrics_timestamp() CASCADE;

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = _user_id
    AND role = 'admin'
  )
$$;

-- Professional performance metrics table
CREATE TABLE public.professional_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  jobs_received INTEGER DEFAULT 0,
  jobs_quoted INTEGER DEFAULT 0,
  jobs_won INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  jobs_cancelled INTEGER DEFAULT 0,
  
  revenue_earned DECIMAL(10,2) DEFAULT 0,
  avg_job_value DECIMAL(10,2) DEFAULT 0,
  pending_payments DECIMAL(10,2) DEFAULT 0,
  
  avg_response_time_hours DECIMAL(5,2) DEFAULT 0,
  quote_acceptance_rate DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  client_satisfaction DECIMAL(3,2) DEFAULT 0,
  
  profile_views INTEGER DEFAULT 0,
  quote_requests INTEGER DEFAULT 0,
  repeat_clients INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(professional_id, metric_date)
);

-- Professional insights table
CREATE TABLE public.professional_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_title TEXT NOT NULL,
  insight_description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact_score DECIMAL(3,2) DEFAULT 0,
  action_items JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Revenue forecasting table
CREATE TABLE public.revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  forecast_period TEXT NOT NULL CHECK (forecast_period IN ('week', 'month', 'quarter', 'year')),
  projected_revenue DECIMAL(10,2) NOT NULL,
  confidence_level DECIMAL(3,2) DEFAULT 0,
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, forecast_date, forecast_period)
);

-- Competitor benchmarking table
CREATE TABLE public.competitor_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  benchmark_date DATE NOT NULL,
  peer_avg_rating DECIMAL(3,2),
  peer_avg_response_time DECIMAL(5,2),
  peer_avg_job_value DECIMAL(10,2),
  peer_completion_rate DECIMAL(5,2),
  professional_rank INTEGER,
  total_professionals INTEGER,
  percentile DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, category_id, benchmark_date)
);

-- Enable RLS
ALTER TABLE public.professional_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "prof_view_own_metrics" ON public.professional_metrics FOR SELECT TO authenticated USING (professional_id = auth.uid());
CREATE POLICY "admin_view_all_metrics" ON public.professional_metrics FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "prof_view_own_insights" ON public.professional_insights FOR SELECT TO authenticated USING (professional_id = auth.uid());
CREATE POLICY "prof_update_own_insights" ON public.professional_insights FOR UPDATE TO authenticated USING (professional_id = auth.uid());
CREATE POLICY "admin_manage_insights" ON public.professional_insights FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "prof_view_own_forecasts" ON public.revenue_forecasts FOR SELECT TO authenticated USING (professional_id = auth.uid());
CREATE POLICY "admin_view_all_forecasts" ON public.revenue_forecasts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "prof_view_own_benchmarks" ON public.competitor_benchmarks FOR SELECT TO authenticated USING (professional_id = auth.uid());
CREATE POLICY "admin_view_all_benchmarks" ON public.competitor_benchmarks FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_prof_metrics_prof_date ON public.professional_metrics(professional_id, metric_date DESC);
CREATE INDEX idx_prof_insights_unread ON public.professional_insights(professional_id, is_read, created_at DESC);
CREATE INDEX idx_revenue_forecasts_prof ON public.revenue_forecasts(professional_id, forecast_date DESC);
CREATE INDEX idx_competitor_bench_prof ON public.competitor_benchmarks(professional_id, benchmark_date DESC);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_professional_metrics_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER trg_prof_metrics_updated_at BEFORE UPDATE ON public.professional_metrics FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_prof_insights_updated_at BEFORE UPDATE ON public.professional_insights FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();