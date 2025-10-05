-- Create enum for onboarding steps
CREATE TYPE public.app_onboarding_step AS ENUM (
  'profile_basic',
  'verification',
  'services',
  'availability',
  'portfolio',
  'payment_setup'
);

-- Create onboarding_checklist table
CREATE TABLE public.onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step app_onboarding_step NOT NULL,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, step)
);

-- Create onboarding_events table for tracking
CREATE TABLE public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  step app_onboarding_step,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_checklist
CREATE POLICY "Users can view their own checklist"
  ON public.onboarding_checklist
  FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can update their own checklist"
  ON public.onboarding_checklist
  FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert their own checklist"
  ON public.onboarding_checklist
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- RLS Policies for onboarding_events
CREATE POLICY "Users can view their own events"
  ON public.onboarding_events
  FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert their own events"
  ON public.onboarding_events
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- Create indexes for performance
CREATE INDEX idx_onboarding_checklist_professional ON public.onboarding_checklist(professional_id);
CREATE INDEX idx_onboarding_checklist_step ON public.onboarding_checklist(step);
CREATE INDEX idx_onboarding_events_professional ON public.onboarding_events(professional_id);
CREATE INDEX idx_onboarding_events_created ON public.onboarding_events(created_at DESC);