-- Job presets for "same as last time" feature
CREATE TABLE public.job_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preset_type TEXT NOT NULL,
  preset_data JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_job_presets_user_id ON public.job_presets(user_id);
CREATE INDEX idx_job_presets_type ON public.job_presets(preset_type);
CREATE INDEX idx_job_presets_last_used ON public.job_presets(last_used_at DESC);

-- Enable RLS
ALTER TABLE public.job_presets ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own presets
CREATE POLICY "Users can manage their own presets"
  ON public.job_presets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_presets;