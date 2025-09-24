-- Create performance analytics tables
CREATE TABLE public.pro_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pro_id UUID NOT NULL,
  key TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meta JSONB DEFAULT '{}'
);

CREATE TABLE public.pro_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pro_id UUID NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  revenue_target DECIMAL(10,2),
  jobs_target INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_risk_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  suggested_action TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own badges" ON public.pro_badges
FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Users can manage their own targets" ON public.pro_targets
FOR ALL USING (auth.uid() = pro_id);

CREATE POLICY "Anyone can view risk flags" ON public.ai_risk_flags
FOR SELECT USING (true);