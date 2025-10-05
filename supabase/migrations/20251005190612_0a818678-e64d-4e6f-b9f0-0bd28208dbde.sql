-- Add missing columns and improve escrow system
ALTER TABLE public.escrow_milestones
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update escrow_payments to link with milestones properly
ALTER TABLE public.escrow_payments
ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id),
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'held',
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS released_by uuid REFERENCES auth.users(id);

-- Create escrow_transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.escrow_milestones(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.escrow_payments(id),
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for escrow_transactions
CREATE POLICY "Users can view transactions for their contracts"
  ON public.escrow_transactions
  FOR SELECT
  USING (
    milestone_id IN (
      SELECT em.id
      FROM escrow_milestones em
      JOIN contracts c ON c.id = em.contract_id
      WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
    )
  );

CREATE POLICY "Contract parties can create transactions"
  ON public.escrow_transactions
  FOR INSERT
  WITH CHECK (
    milestone_id IN (
      SELECT em.id
      FROM escrow_milestones em
      JOIN contracts c ON c.id = em.contract_id
      WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
    )
  );

-- Update RLS for escrow_milestones to allow updates
CREATE POLICY "Contract parties can update milestones"
  ON public.escrow_milestones
  FOR UPDATE
  USING (
    contract_id IN (
      SELECT id FROM contracts
      WHERE client_id = auth.uid() OR tasker_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_milestone ON public.escrow_transactions(milestone_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_payment ON public.escrow_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_contract ON public.escrow_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_contract ON public.escrow_payments(contract_id);

-- Function to automatically release milestone payment
CREATE OR REPLACE FUNCTION public.auto_release_milestone_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If milestone is marked as completed, create a release transaction
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.escrow_transactions (
      milestone_id,
      transaction_type,
      amount,
      status,
      initiated_by,
      metadata
    ) VALUES (
      NEW.id,
      'release',
      NEW.amount,
      'pending',
      COALESCE(NEW.approved_by, auth.uid()),
      jsonb_build_object(
        'auto_release', true,
        'completion_date', NEW.completed_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for auto-release
DROP TRIGGER IF EXISTS auto_release_milestone_trigger ON public.escrow_milestones;
CREATE TRIGGER auto_release_milestone_trigger
  AFTER UPDATE ON public.escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_release_milestone_payment();