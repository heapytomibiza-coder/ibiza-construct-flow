-- Create refund_requests table
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  stripe_refund_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  receipt_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  receipt_url TEXT,
  receipt_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transaction_notes table for internal notes
CREATE TABLE IF NOT EXISTS public.transaction_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_refund_requests_payment_id ON public.refund_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_by ON public.refund_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_id ON public.payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_user_id ON public.payment_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_receipt_number ON public.payment_receipts(receipt_number);

CREATE INDEX IF NOT EXISTS idx_transaction_notes_transaction_id ON public.transaction_notes(transaction_id);

-- Enable RLS
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refund_requests
CREATE POLICY "Users can view their refund requests"
  ON public.refund_requests FOR SELECT
  USING (auth.uid() = requested_by);

CREATE POLICY "Users can create refund requests"
  ON public.refund_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

-- RLS Policies for payment_receipts
CREATE POLICY "Users can view their receipts"
  ON public.payment_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create receipts"
  ON public.payment_receipts FOR INSERT
  WITH CHECK (true);

-- RLS Policies for transaction_notes
CREATE POLICY "Users can view their transaction notes"
  ON public.transaction_notes FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM payment_transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transaction notes"
  ON public.transaction_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    transaction_id IN (
      SELECT id FROM payment_transactions WHERE user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  receipt_num TEXT;
BEGIN
  receipt_num := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;