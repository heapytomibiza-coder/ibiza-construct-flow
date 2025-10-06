-- Phase 21: Enhanced Escrow Flow Integration - Database Enhancements

-- Add new columns to escrow_milestones
ALTER TABLE public.escrow_milestones
ADD COLUMN IF NOT EXISTS auto_release_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS partial_release_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS released_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS submission_notes text,
ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Add escrow_hold_period to contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS escrow_hold_period integer DEFAULT 7;

-- Create milestone_approvals table for tracking approval workflow
CREATE TABLE IF NOT EXISTS public.milestone_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.escrow_milestones(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create professional_stripe_accounts table
CREATE TABLE IF NOT EXISTS public.professional_stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'restricted', 'disabled')),
  charges_enabled boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  details_submitted boolean DEFAULT false,
  country text,
  currency text DEFAULT 'USD',
  balance_available numeric DEFAULT 0,
  balance_pending numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create escrow_transfer_logs table
CREATE TABLE IF NOT EXISTS public.escrow_transfer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.escrow_milestones(id),
  stripe_transfer_id text,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'reversed')),
  failure_reason text,
  professional_account_id uuid REFERENCES public.professional_stripe_accounts(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.milestone_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transfer_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milestone_approvals
CREATE POLICY "Users can view approvals for their milestones"
ON public.milestone_approvals FOR SELECT
USING (
  milestone_id IN (
    SELECT em.id FROM escrow_milestones em
    JOIN contracts c ON c.id = em.contract_id
    WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
  )
);

CREATE POLICY "Contract parties can create approvals"
ON public.milestone_approvals FOR INSERT
WITH CHECK (
  milestone_id IN (
    SELECT em.id FROM escrow_milestones em
    JOIN contracts c ON c.id = em.contract_id
    WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
  )
);

-- RLS Policies for professional_stripe_accounts
CREATE POLICY "Professionals can view their own account"
ON public.professional_stripe_accounts FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own account"
ON public.professional_stripe_accounts FOR UPDATE
USING (auth.uid() = professional_id);

-- RLS Policies for escrow_transfer_logs
CREATE POLICY "Users can view transfer logs for their contracts"
ON public.escrow_transfer_logs FOR SELECT
USING (
  milestone_id IN (
    SELECT em.id FROM escrow_milestones em
    JOIN contracts c ON c.id = em.contract_id
    WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_milestone_approvals_milestone ON public.milestone_approvals(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_approvals_approver ON public.milestone_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_professional_stripe_accounts_professional ON public.professional_stripe_accounts(professional_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transfer_logs_milestone ON public.escrow_transfer_logs(milestone_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_status ON public.escrow_milestones(status);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_auto_release ON public.escrow_milestones(auto_release_date) WHERE auto_release_date IS NOT NULL;

-- Function to check auto-release eligibility
CREATE OR REPLACE FUNCTION public.check_milestone_auto_release()
RETURNS TABLE(milestone_id uuid, contract_id uuid, amount numeric, auto_release_date timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    em.id,
    em.contract_id,
    em.amount,
    em.auto_release_date
  FROM escrow_milestones em
  WHERE em.status = 'completed'
    AND em.auto_release_date IS NOT NULL
    AND em.auto_release_date <= now()
    AND NOT EXISTS (
      SELECT 1 FROM escrow_releases er
      WHERE er.milestone_id = em.id
        AND er.status IN ('pending', 'completed')
    );
END;
$$;

-- Function to calculate milestone progress
CREATE OR REPLACE FUNCTION public.get_milestone_progress(p_contract_id uuid)
RETURNS TABLE(
  total_milestones integer,
  completed_milestones integer,
  pending_milestones integer,
  total_amount numeric,
  released_amount numeric,
  pending_amount numeric,
  progress_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_milestones integer;
  v_completed_milestones integer;
  v_pending_milestones integer;
  v_total_amount numeric;
  v_released_amount numeric;
  v_pending_amount numeric;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN status = 'released' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status IN ('pending', 'in_progress', 'completed') THEN amount ELSE 0 END), 0)
  INTO 
    v_total_milestones,
    v_completed_milestones,
    v_pending_milestones,
    v_total_amount,
    v_released_amount,
    v_pending_amount
  FROM escrow_milestones
  WHERE contract_id = p_contract_id;

  RETURN QUERY SELECT
    v_total_milestones,
    v_completed_milestones,
    v_pending_milestones,
    v_total_amount,
    v_released_amount,
    v_pending_amount,
    CASE WHEN v_total_milestones > 0 
      THEN (v_completed_milestones::numeric / v_total_milestones) * 100 
      ELSE 0 
    END;
END;
$$;

-- Trigger to update auto_release_date when milestone is completed
CREATE OR REPLACE FUNCTION public.set_auto_release_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_hold_period integer;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get hold period from contract
    SELECT escrow_hold_period INTO v_hold_period
    FROM contracts
    WHERE id = NEW.contract_id;
    
    -- Set auto release date
    NEW.auto_release_date := now() + (COALESCE(v_hold_period, 7) || ' days')::interval;
    
    -- Set approval deadline (e.g., 3 days before auto-release)
    NEW.approval_deadline := NEW.auto_release_date - interval '3 days';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_milestone_auto_release_date
  BEFORE UPDATE ON public.escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auto_release_date();

-- Trigger to log approval actions
CREATE OR REPLACE FUNCTION public.log_milestone_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.approved_by IS NOT NULL THEN
    INSERT INTO milestone_approvals (milestone_id, approver_id, action, notes)
    VALUES (NEW.id, NEW.approved_by, 'approved', 'Milestone approved');
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' AND NEW.rejected_by IS NOT NULL THEN
    INSERT INTO milestone_approvals (milestone_id, approver_id, action, notes)
    VALUES (NEW.id, NEW.rejected_by, 'rejected', NEW.rejection_reason);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_approval_actions
  AFTER UPDATE ON public.escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.log_milestone_approval();