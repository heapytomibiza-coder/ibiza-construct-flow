-- Create business_insights table for AI-generated business intelligence
CREATE TABLE IF NOT EXISTS public.business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  insight_title TEXT NOT NULL,
  insight_description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  action_items JSONB DEFAULT '[]'::jsonb,
  impact_score NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add priority_weight for deterministic ordering
ALTER TABLE public.business_insights
  ADD COLUMN priority_weight SMALLINT
  GENERATED ALWAYS AS (
    CASE priority
      WHEN 'high' THEN 3
      WHEN 'medium' THEN 2
      ELSE 1
    END
  ) STORED;

-- Create composite index for optimal query performance
CREATE INDEX idx_business_insights_user_read_priority_created
  ON public.business_insights(user_id, is_read, priority_weight DESC, created_at DESC);

-- Enable RLS
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
  ON public.business_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON public.business_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own insights"
  ON public.business_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_business_insights_updated_at
  BEFORE UPDATE ON public.business_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.business_insights IS 'AI-generated business insights and recommendations for users';
COMMENT ON COLUMN public.business_insights.priority_weight IS 'Numeric weight for deterministic priority sorting: high=3, medium=2, low=1';