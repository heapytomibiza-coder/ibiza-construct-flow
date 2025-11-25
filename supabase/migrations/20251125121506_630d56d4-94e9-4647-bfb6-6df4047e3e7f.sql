-- Drop tables if they exist from previous attempt
DROP TABLE IF EXISTS public.job_timeline_events CASCADE;
DROP TABLE IF EXISTS public.spam_keywords CASCADE;

-- Create spam keywords table for off-platform detection
CREATE TABLE public.spam_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'block')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed spam keywords
INSERT INTO public.spam_keywords (keyword, severity, category) VALUES
  ('whatsapp', 'warning', 'off_platform'),
  ('telegram', 'warning', 'off_platform'),
  ('pay cash', 'warning', 'payment'),
  ('cash payment', 'warning', 'payment'),
  ('off platform', 'warning', 'off_platform'),
  ('direct payment', 'warning', 'payment'),
  ('paypal', 'warning', 'payment'),
  ('venmo', 'warning', 'payment'),
  ('zelle', 'warning', 'payment'),
  ('bank transfer', 'warning', 'payment'),
  ('meet outside', 'warning', 'off_platform'),
  ('call me at', 'warning', 'contact'),
  ('text me at', 'warning', 'contact'),
  ('email me at', 'warning', 'contact');

-- Create job timeline events table for mini CRM
CREATE TABLE public.job_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.spam_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_timeline_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for spam_keywords (read-only for all authenticated users)
CREATE POLICY "Anyone can view spam keywords"
  ON public.spam_keywords FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for job_timeline_events (allow all authenticated for now)
CREATE POLICY "Authenticated users can view timeline events"
  ON public.job_timeline_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create timeline events"
  ON public.job_timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_job_timeline_events_job_id ON public.job_timeline_events(job_id);
CREATE INDEX idx_job_timeline_events_created_at ON public.job_timeline_events(created_at DESC);
CREATE INDEX idx_spam_keywords_category ON public.spam_keywords(category);