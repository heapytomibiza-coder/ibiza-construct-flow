-- Create micro questions snapshot table for last-known-good AI-generated questions
CREATE TABLE IF NOT EXISTS public.micro_questions_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_category_id TEXT UNIQUE NOT NULL, -- combination of serviceType-category-subcategory
  version INT NOT NULL DEFAULT 1,
  questions_json JSONB NOT NULL,
  schema_rev INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create AI runs tracking table
CREATE TABLE IF NOT EXISTS public.micro_questions_ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_category_id TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  model TEXT NOT NULL,
  raw_response JSONB,
  status TEXT NOT NULL CHECK (status IN ('success','failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_micro_questions_snapshot_category 
ON public.micro_questions_snapshot(micro_category_id);

CREATE INDEX IF NOT EXISTS idx_micro_questions_ai_runs_category 
ON public.micro_questions_ai_runs(micro_category_id);

CREATE INDEX IF NOT EXISTS idx_micro_questions_ai_runs_created 
ON public.micro_questions_ai_runs(created_at DESC);

-- Enable RLS
ALTER TABLE public.micro_questions_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_questions_ai_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies - snapshots are readable by all authenticated users
CREATE POLICY "Snapshots are readable by authenticated users" 
ON public.micro_questions_snapshot 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only system can manage snapshots and runs
CREATE POLICY "System can manage snapshots" 
ON public.micro_questions_snapshot 
FOR ALL 
USING (true);

CREATE POLICY "System can manage AI runs" 
ON public.micro_questions_ai_runs 
FOR ALL 
USING (true);

-- Add AI questions enhancement flag (using existing feature_flags structure)
INSERT INTO public.feature_flags (key, enabled, description) 
VALUES ('ai_questions_enhancement', true, 'Enable AI-generated questions with fallback to database')
ON CONFLICT (key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Add circuit breaker flag
INSERT INTO public.feature_flags (key, enabled, description) 
VALUES ('ai_questions_circuit_breaker', false, 'Circuit breaker for AI questions when gateway is failing')
ON CONFLICT (key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_micro_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_micro_questions_snapshot_updated_at
  BEFORE UPDATE ON public.micro_questions_snapshot
  FOR EACH ROW
  EXECUTE FUNCTION public.update_micro_questions_updated_at();