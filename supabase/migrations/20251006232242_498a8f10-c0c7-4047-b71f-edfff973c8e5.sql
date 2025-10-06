-- Phase 20: Advanced Analytics & Reporting Dashboard

-- Create analytics events table for custom event tracking
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_properties JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user activity metrics table
CREATE TABLE user_activity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  bookings_made INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  searches_performed INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Create platform metrics table
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_hour INTEGER,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_booking_value NUMERIC DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  disputes_opened INTEGER DEFAULT 0,
  disputes_resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(metric_date, metric_hour)
);

-- Create cohort analysis table
CREATE TABLE user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_date DATE NOT NULL,
  cohort_size INTEGER DEFAULT 0,
  retention_day_1 INTEGER DEFAULT 0,
  retention_day_7 INTEGER DEFAULT 0,
  retention_day_30 INTEGER DEFAULT 0,
  retention_day_60 INTEGER DEFAULT 0,
  retention_day_90 INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cohort_date)
);

-- Create funnel analytics table
CREATE TABLE funnel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name TEXT NOT NULL,
  analysis_date DATE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  users_entered INTEGER DEFAULT 0,
  users_completed INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  average_time_seconds INTEGER DEFAULT 0,
  drop_off_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(funnel_name, analysis_date, step_number)
);

-- Create revenue analytics table
CREATE TABLE revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date DATE NOT NULL,
  revenue_type TEXT NOT NULL, -- booking, subscription, service_fee, etc.
  total_amount NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction NUMERIC DEFAULT 0,
  refund_amount NUMERIC DEFAULT 0,
  net_revenue NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(analysis_date, revenue_type, currency)
);

-- Create report schedules table
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- daily_summary, weekly_digest, monthly_report, custom
  report_config JSONB DEFAULT '{}'::jsonb,
  schedule_frequency TEXT NOT NULL, -- daily, weekly, monthly
  schedule_day INTEGER, -- day of week (0-6) or day of month (1-31)
  schedule_time TIME NOT NULL,
  recipients TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create saved reports table
CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_config JSONB NOT NULL,
  report_data JSONB,
  is_public BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create data exports table
CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- users, bookings, revenue, analytics, etc.
  export_format TEXT NOT NULL, -- csv, json, xlsx, pdf
  filters JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  file_url TEXT,
  file_size_bytes BIGINT,
  row_count INTEGER,
  error_message TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events"
  ON analytics_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_activity_metrics
CREATE POLICY "Users can view their own metrics"
  ON user_activity_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
  ON user_activity_metrics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage metrics"
  ON user_activity_metrics FOR ALL
  USING (true);

-- RLS Policies for platform_metrics
CREATE POLICY "Admins can view platform metrics"
  ON platform_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage platform metrics"
  ON platform_metrics FOR ALL
  USING (true);

-- RLS Policies for user_cohorts
CREATE POLICY "Admins can view cohorts"
  ON user_cohorts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage cohorts"
  ON user_cohorts FOR ALL
  USING (true);

-- RLS Policies for funnel_analytics
CREATE POLICY "Admins can view funnels"
  ON funnel_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage funnels"
  ON funnel_analytics FOR ALL
  USING (true);

-- RLS Policies for revenue_analytics
CREATE POLICY "Admins can view revenue analytics"
  ON revenue_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage revenue analytics"
  ON revenue_analytics FOR ALL
  USING (true);

-- RLS Policies for report_schedules
CREATE POLICY "Users can manage their schedules"
  ON report_schedules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all schedules"
  ON report_schedules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for saved_reports
CREATE POLICY "Users can manage their reports"
  ON saved_reports FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public reports"
  ON saved_reports FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can view all reports"
  ON saved_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for data_exports
CREATE POLICY "Users can manage their exports"
  ON data_exports FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all exports"
  ON data_exports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_user_activity_metrics_user_date ON user_activity_metrics(user_id, metric_date DESC);
CREATE INDEX idx_user_activity_metrics_date ON user_activity_metrics(metric_date DESC);
CREATE INDEX idx_platform_metrics_date_hour ON platform_metrics(metric_date DESC, metric_hour DESC);
CREATE INDEX idx_revenue_analytics_date_type ON revenue_analytics(analysis_date DESC, revenue_type);
CREATE INDEX idx_data_exports_user_status ON data_exports(user_id, status);

-- Function to track analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_event_name TEXT DEFAULT NULL,
  p_event_category TEXT DEFAULT NULL,
  p_event_properties JSONB DEFAULT '{}'::jsonb,
  p_page_url TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (
    user_id,
    session_id,
    event_name,
    event_category,
    event_properties,
    page_url,
    referrer
  ) VALUES (
    p_user_id,
    COALESCE(p_session_id, gen_random_uuid()::text),
    p_event_name,
    p_event_category,
    p_event_properties,
    p_page_url,
    p_referrer
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_users', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_activity_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'new_users', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE created_at::date BETWEEN v_start AND p_end_date
    ),
    'total_bookings', (
      SELECT SUM(total_bookings) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'completed_bookings', (
      SELECT SUM(completed_bookings) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'total_revenue', (
      SELECT SUM(net_revenue) 
      FROM revenue_analytics 
      WHERE analysis_date BETWEEN v_start AND p_end_date
    ),
    'average_rating', (
      SELECT AVG(average_rating) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'active_disputes', (
      SELECT COUNT(*) 
      FROM disputes 
      WHERE status IN ('open', 'in_progress')
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to calculate user retention
CREATE OR REPLACE FUNCTION calculate_user_retention(p_cohort_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cohort_size INTEGER;
  v_retention_1 INTEGER;
  v_retention_7 INTEGER;
  v_retention_30 INTEGER;
  v_retention_60 INTEGER;
  v_retention_90 INTEGER;
BEGIN
  -- Get cohort size (users who signed up on this date)
  SELECT COUNT(*) INTO v_cohort_size
  FROM profiles
  WHERE created_at::date = p_cohort_date;

  IF v_cohort_size = 0 THEN
    RETURN;
  END IF;

  -- Calculate retention for day 1
  SELECT COUNT(DISTINCT p.id) INTO v_retention_1
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '1 day';

  -- Calculate retention for day 7
  SELECT COUNT(DISTINCT p.id) INTO v_retention_7
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '7 days';

  -- Calculate retention for day 30
  SELECT COUNT(DISTINCT p.id) INTO v_retention_30
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '30 days';

  -- Calculate retention for day 60
  SELECT COUNT(DISTINCT p.id) INTO v_retention_60
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '60 days';

  -- Calculate retention for day 90
  SELECT COUNT(DISTINCT p.id) INTO v_retention_90
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '90 days';

  -- Insert or update cohort data
  INSERT INTO user_cohorts (
    cohort_date,
    cohort_size,
    retention_day_1,
    retention_day_7,
    retention_day_30,
    retention_day_60,
    retention_day_90
  ) VALUES (
    p_cohort_date,
    v_cohort_size,
    v_retention_1,
    v_retention_7,
    v_retention_30,
    v_retention_60,
    v_retention_90
  )
  ON CONFLICT (cohort_date) DO UPDATE SET
    retention_day_1 = EXCLUDED.retention_day_1,
    retention_day_7 = EXCLUDED.retention_day_7,
    retention_day_30 = EXCLUDED.retention_day_30,
    retention_day_60 = EXCLUDED.retention_day_60,
    retention_day_90 = EXCLUDED.retention_day_90,
    updated_at = now();
END;
$$;

-- Function to aggregate daily platform metrics
CREATE OR REPLACE FUNCTION aggregate_platform_metrics(p_metric_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users INTEGER;
  v_active_users INTEGER;
  v_new_users INTEGER;
  v_total_bookings INTEGER;
  v_completed_bookings INTEGER;
  v_cancelled_bookings INTEGER;
BEGIN
  -- Calculate metrics
  SELECT COUNT(*) INTO v_total_users FROM profiles WHERE created_at::date <= p_metric_date;
  SELECT COUNT(DISTINCT user_id) INTO v_active_users FROM user_activity_metrics WHERE metric_date = p_metric_date;
  SELECT COUNT(*) INTO v_new_users FROM profiles WHERE created_at::date = p_metric_date;
  SELECT COUNT(*) INTO v_total_bookings FROM bookings WHERE created_at::date = p_metric_date;
  SELECT COUNT(*) INTO v_completed_bookings FROM bookings WHERE created_at::date = p_metric_date AND status = 'completed';
  SELECT COUNT(*) INTO v_cancelled_bookings FROM bookings WHERE created_at::date = p_metric_date AND status = 'cancelled';

  -- Insert or update platform metrics
  INSERT INTO platform_metrics (
    metric_date,
    total_users,
    active_users,
    new_users,
    total_bookings,
    completed_bookings,
    cancelled_bookings
  ) VALUES (
    p_metric_date,
    v_total_users,
    v_active_users,
    v_new_users,
    v_total_bookings,
    v_completed_bookings,
    v_cancelled_bookings
  )
  ON CONFLICT (metric_date, metric_hour) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_users = EXCLUDED.new_users,
    total_bookings = EXCLUDED.total_bookings,
    completed_bookings = EXCLUDED.completed_bookings,
    cancelled_bookings = EXCLUDED.cancelled_bookings,
    updated_at = now();
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_activity_metrics_updated_at
  BEFORE UPDATE ON user_activity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER platform_metrics_updated_at
  BEFORE UPDATE ON platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER revenue_analytics_updated_at
  BEFORE UPDATE ON revenue_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER report_schedules_updated_at
  BEFORE UPDATE ON report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER saved_reports_updated_at
  BEFORE UPDATE ON saved_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

COMMENT ON TABLE analytics_events IS 'Custom event tracking for user actions';
COMMENT ON TABLE user_activity_metrics IS 'Daily user activity aggregations';
COMMENT ON TABLE platform_metrics IS 'Platform-wide metrics aggregated by date/hour';
COMMENT ON TABLE user_cohorts IS 'User cohort analysis and retention tracking';
COMMENT ON TABLE funnel_analytics IS 'Conversion funnel analysis data';
COMMENT ON TABLE revenue_analytics IS 'Revenue metrics by type and date';
COMMENT ON TABLE report_schedules IS 'Scheduled report configurations';
COMMENT ON TABLE saved_reports IS 'Generated and saved reports';
COMMENT ON TABLE data_exports IS 'Data export requests and files';