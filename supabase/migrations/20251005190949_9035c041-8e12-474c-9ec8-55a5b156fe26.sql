-- Enhance invoices table with additional fields
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS invoice_template TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_address JSONB,
ADD COLUMN IF NOT EXISTS professional_name TEXT,
ADD COLUMN IF NOT EXISTS professional_email TEXT,
ADD COLUMN IF NOT EXISTS professional_address JSONB,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS terms TEXT,
ADD COLUMN IF NOT EXISTS footer_notes TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Create invoice_items table for line items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  item_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_items
CREATE POLICY "Users can view items for their invoices"
  ON public.invoice_items
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage items for their invoices"
  ON public.invoice_items
  FOR ALL
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE user_id = auth.uid()
    )
  );

-- Create invoice_payments table for tracking payments against invoices
CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_transaction_id UUID REFERENCES public.payment_transactions(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_payments
CREATE POLICY "Users can view payments for their invoices"
  ON public.invoice_payments
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create invoice payments"
  ON public.invoice_payments
  FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subtotal NUMERIC := 0;
  v_vat_amount NUMERIC := 0;
  v_total NUMERIC := 0;
  v_discount NUMERIC := 0;
BEGIN
  -- Calculate from line items if they exist
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(tax_amount), 0)
  INTO v_subtotal, v_vat_amount
  FROM invoice_items
  WHERE invoice_id = NEW.id;

  -- If no items, use the invoice's line_items JSONB (for backward compatibility)
  IF v_subtotal = 0 THEN
    v_subtotal := NEW.subtotal;
    v_vat_amount := NEW.vat_amount;
  END IF;

  -- Apply discount
  IF NEW.discount_percentage > 0 THEN
    v_discount := v_subtotal * (NEW.discount_percentage / 100);
  ELSIF NEW.discount_amount > 0 THEN
    v_discount := NEW.discount_amount;
  END IF;

  -- Calculate total
  v_total := v_subtotal - v_discount + v_vat_amount;

  -- Update invoice
  UPDATE invoices
  SET
    subtotal = v_subtotal,
    vat_amount = v_vat_amount,
    total_amount = v_total,
    updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Trigger for invoice calculations
DROP TRIGGER IF EXISTS calculate_invoice_totals_trigger ON public.invoice_items;
CREATE TRIGGER calculate_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_invoice_totals();

-- Function to auto-mark invoices as overdue
CREATE OR REPLACE FUNCTION public.mark_overdue_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < now()
    AND due_date IS NOT NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;