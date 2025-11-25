-- Enhanced contracts table for clearer workflow
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS work_submitted_at TIMESTAMPTZ;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS work_approved_at TIMESTAMPTZ;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMPTZ;

-- Work submissions table for clear tracking
CREATE TABLE IF NOT EXISTS public.work_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  submission_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simpler milestone payments
CREATE TABLE IF NOT EXISTS public.milestone_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple escrow releases tracking
CREATE TABLE IF NOT EXISTS public.simple_escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  released_to UUID NOT NULL REFERENCES auth.users(id),
  released_by UUID NOT NULL REFERENCES auth.users(id),
  release_reason TEXT NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_work_submissions_contract_id ON public.work_submissions(contract_id);
CREATE INDEX IF NOT EXISTS idx_work_submissions_status ON public.work_submissions(status);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_contract_id ON public.milestone_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_status ON public.milestone_payments(status);
CREATE INDEX IF NOT EXISTS idx_simple_escrow_releases_contract_id ON public.simple_escrow_releases(contract_id);
CREATE INDEX IF NOT EXISTS idx_simple_escrow_releases_status ON public.simple_escrow_releases(status);

-- Enable RLS
ALTER TABLE public.work_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simple_escrow_releases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_submissions
CREATE POLICY "Users can view work submissions for their contracts"
  ON public.work_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = work_submissions.contract_id
      AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
    )
  );

CREATE POLICY "Professionals can submit work"
  ON public.work_submissions FOR INSERT
  WITH CHECK (submitted_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_id AND c.tasker_id = auth.uid()
  ));

CREATE POLICY "Clients can review submissions"
  ON public.work_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = work_submissions.contract_id
      AND c.client_id = auth.uid()
    )
  );

-- RLS Policies for milestone_payments
CREATE POLICY "Users can view milestones for their contracts"
  ON public.milestone_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = milestone_payments.contract_id
      AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
    )
  );

CREATE POLICY "Contract parties can create milestones"
  ON public.milestone_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_id
      AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
    )
  );

CREATE POLICY "Contract parties can update milestones"
  ON public.milestone_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = milestone_payments.contract_id
      AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
    )
  );

-- RLS Policies for simple_escrow_releases
CREATE POLICY "Users can view releases for their contracts"
  ON public.simple_escrow_releases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = simple_escrow_releases.contract_id
      AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
    )
  );

-- Update triggers
CREATE OR REPLACE FUNCTION update_work_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_work_submissions_updated_at_trigger
  BEFORE UPDATE ON public.work_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_work_submissions_updated_at();

CREATE OR REPLACE FUNCTION update_milestone_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_milestone_payments_updated_at_trigger
  BEFORE UPDATE ON public.milestone_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_payments_updated_at();