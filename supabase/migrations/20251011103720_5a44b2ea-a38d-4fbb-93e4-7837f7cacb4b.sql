-- Create table for tracking actual project costs and variance
CREATE TABLE IF NOT EXISTS public.project_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  project_type TEXT NOT NULL,
  estimated_cost DECIMAL(10,2) NOT NULL,
  actual_cost DECIMAL(10,2),
  variance_percentage DECIMAL(5,2),
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_completions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage project completions"
  ON public.project_completions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Users can view their own
CREATE POLICY "Users can view their own completions"
  ON public.project_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_project_completions_session_id ON public.project_completions(session_id);
CREATE INDEX idx_project_completions_project_type ON public.project_completions(project_type);
CREATE INDEX idx_project_completions_completion_date ON public.project_completions(completion_date);

-- Create updated_at trigger
CREATE TRIGGER update_project_completions_updated_at
  BEFORE UPDATE ON public.project_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for pricing insights
CREATE OR REPLACE VIEW public.pricing_variance_summary AS
SELECT 
  project_type,
  COUNT(*) as total_projects,
  AVG(variance_percentage) as avg_variance,
  AVG(estimated_cost) as avg_estimated,
  AVG(actual_cost) as avg_actual,
  MIN(completion_date) as earliest_completion,
  MAX(completion_date) as latest_completion
FROM public.project_completions
WHERE actual_cost IS NOT NULL
GROUP BY project_type;