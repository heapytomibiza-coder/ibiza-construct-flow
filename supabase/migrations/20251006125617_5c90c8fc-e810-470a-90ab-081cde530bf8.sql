-- Phase I: Advanced Search & Filtering System

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL, -- 'professional', 'job', 'service'
  filters JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_query TEXT,
  search_type TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  notification_enabled BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  search_term TEXT NOT NULL,
  search_type TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  zero_results_count INTEGER DEFAULT 0,
  avg_results INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, search_term, search_type)
);

-- Popular searches view
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term TEXT NOT NULL,
  search_type TEXT NOT NULL,
  popularity_score INTEGER DEFAULT 1,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(search_term, search_type, period, period_start)
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_history
CREATE POLICY "Users can view their search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their search history"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their saved searches"
  ON saved_searches FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for search_analytics
CREATE POLICY "Admins can view search analytics"
  ON search_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert search analytics"
  ON search_analytics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for popular_searches
CREATE POLICY "Anyone can view popular searches"
  ON popular_searches FOR SELECT
  USING (true);

CREATE POLICY "System can manage popular searches"
  ON popular_searches FOR ALL
  USING (true);

-- Indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX idx_search_history_search_type ON search_history(search_type);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_search_analytics_date ON search_analytics(date DESC);
CREATE INDEX idx_popular_searches_period ON popular_searches(period, period_start DESC);

-- Function to update saved_searches updated_at
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_searches_updated_at();

-- Function to track search analytics
CREATE OR REPLACE FUNCTION track_search_analytics(
  p_search_term TEXT,
  p_search_type TEXT,
  p_results_count INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO search_analytics (
    date,
    search_term,
    search_type,
    search_count,
    zero_results_count,
    avg_results
  ) VALUES (
    CURRENT_DATE,
    p_search_term,
    p_search_type,
    1,
    CASE WHEN p_results_count = 0 THEN 1 ELSE 0 END,
    p_results_count
  )
  ON CONFLICT (date, search_term, search_type) DO UPDATE SET
    search_count = search_analytics.search_count + 1,
    zero_results_count = search_analytics.zero_results_count + CASE WHEN p_results_count = 0 THEN 1 ELSE 0 END,
    avg_results = ((search_analytics.avg_results * search_analytics.search_count) + p_results_count) / (search_analytics.search_count + 1);
END;
$$;

-- Function to get popular searches
CREATE OR REPLACE FUNCTION get_popular_searches(
  p_search_type TEXT DEFAULT NULL,
  p_period TEXT DEFAULT 'weekly',
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  search_term TEXT,
  search_type TEXT,
  popularity_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.search_term,
    ps.search_type,
    ps.popularity_score
  FROM popular_searches ps
  WHERE 
    ps.period = p_period
    AND ps.period_start = CASE 
      WHEN p_period = 'daily' THEN CURRENT_DATE
      WHEN p_period = 'weekly' THEN date_trunc('week', CURRENT_DATE)::DATE
      WHEN p_period = 'monthly' THEN date_trunc('month', CURRENT_DATE)::DATE
    END
    AND (p_search_type IS NULL OR ps.search_type = p_search_type)
  ORDER BY ps.popularity_score DESC
  LIMIT p_limit;
END;
$$;