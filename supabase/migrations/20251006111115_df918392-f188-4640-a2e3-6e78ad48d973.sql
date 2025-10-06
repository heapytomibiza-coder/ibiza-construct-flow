-- Create analytics_snapshots table for storing periodic metrics
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('revenue', 'payments', 'invoices', 'disputes', 'users')),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(snapshot_date, metric_type, metric_name)
);

-- Create payment_analytics_summary table
CREATE TABLE IF NOT EXISTS public.payment_analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_payments INTEGER NOT NULL DEFAULT 0,
  successful_payments INTEGER NOT NULL DEFAULT 0,
  failed_payments INTEGER NOT NULL DEFAULT 0,
  average_transaction_value NUMERIC NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  refund_rate NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_analytics_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_snapshots
CREATE POLICY "Admins can view all analytics snapshots"
  ON public.analytics_snapshots FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert analytics snapshots"
  ON public.analytics_snapshots FOR INSERT
  WITH CHECK (true);

-- RLS Policies for payment_analytics_summary
CREATE POLICY "Users can view their own analytics"
  ON public.payment_analytics_summary FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage analytics summaries"
  ON public.payment_analytics_summary FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON public.analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_type ON public.analytics_snapshots(metric_type);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_summary_user_id ON public.payment_analytics_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_summary_period ON public.payment_analytics_summary(period_start, period_end);

-- Function to calculate user payment analytics
CREATE OR REPLACE FUNCTION calculate_user_payment_analytics(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(
  total_revenue NUMERIC,
  total_payments BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  average_transaction_value NUMERIC,
  conversion_rate NUMERIC,
  refund_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_total_payments BIGINT;
  v_successful_payments BIGINT;
  v_failed_payments BIGINT;
  v_total_refunds BIGINT;
BEGIN
  -- Calculate metrics
  SELECT 
    COALESCE(SUM(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE 0 END), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded')),
    COUNT(*) FILTER (WHERE status IN ('failed', 'cancelled')),
    COUNT(*) FILTER (WHERE transaction_type = 'refund' AND status = 'completed')
  INTO v_total_revenue, v_total_payments, v_successful_payments, v_failed_payments, v_total_refunds
  FROM payment_transactions
  WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date;

  RETURN QUERY SELECT
    v_total_revenue,
    v_total_payments,
    v_successful_payments,
    v_failed_payments,
    CASE WHEN v_successful_payments > 0 THEN v_total_revenue / v_successful_payments ELSE 0 END,
    CASE WHEN v_total_payments > 0 THEN (v_successful_payments::NUMERIC / v_total_payments) * 100 ELSE 0 END,
    CASE WHEN v_successful_payments > 0 THEN (v_total_refunds::NUMERIC / v_successful_payments) * 100 ELSE 0 END;
END;
$$;

-- Function to get revenue trend data
CREATE OR REPLACE FUNCTION get_revenue_trend(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  revenue NUMERIC,
  payment_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pt.created_at) as date,
    COALESCE(SUM(pt.amount), 0) as revenue,
    COUNT(*) as payment_count
  FROM payment_transactions pt
  WHERE pt.user_id = p_user_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(pt.created_at)
  ORDER BY date DESC;
END;
$$;

-- Function to get payment method distribution
CREATE OR REPLACE FUNCTION get_payment_method_distribution(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(
  payment_method TEXT,
  count BIGINT,
  total_amount NUMERIC,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM payment_transactions
  WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date
    AND status IN ('completed', 'succeeded');

  RETURN QUERY
  SELECT 
    COALESCE(pt.payment_method, 'Unknown') as payment_method,
    COUNT(*) as count,
    SUM(pt.amount) as total_amount,
    CASE WHEN v_total_count > 0 THEN (COUNT(*)::NUMERIC / v_total_count) * 100 ELSE 0 END as percentage
  FROM payment_transactions pt
  WHERE pt.user_id = p_user_id
    AND pt.created_at BETWEEN p_start_date AND p_end_date
    AND pt.status IN ('completed', 'succeeded')
  GROUP BY pt.payment_method
  ORDER BY count DESC;
END;
$$;

-- Function to get top revenue sources (jobs)
CREATE OR REPLACE FUNCTION get_top_revenue_sources(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  job_id UUID,
  job_title TEXT,
  total_revenue NUMERIC,
  payment_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.job_id,
    j.title as job_title,
    SUM(pt.amount) as total_revenue,
    COUNT(*) as payment_count
  FROM payment_transactions pt
  LEFT JOIN jobs j ON j.id = pt.job_id
  WHERE pt.user_id = p_user_id
    AND pt.created_at BETWEEN p_start_date AND p_end_date
    AND pt.status IN ('completed', 'succeeded')
    AND pt.job_id IS NOT NULL
  GROUP BY pt.job_id, j.title
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$;

-- Function to update payment analytics summary
CREATE OR REPLACE FUNCTION update_payment_analytics_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_analytics_summary_updated_at
  BEFORE UPDATE ON public.payment_analytics_summary
  FOR EACH ROW EXECUTE FUNCTION update_payment_analytics_summary_updated_at();