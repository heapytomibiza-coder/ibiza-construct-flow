-- 1) Prevent duplicate releases per escrow payment
CREATE UNIQUE INDEX IF NOT EXISTS escrow_one_release_per_payment
ON public.escrow_releases(payment_id)
WHERE status IN ('pending', 'completed');

-- 2) Prevent duplicate release transactions per milestone
CREATE UNIQUE INDEX IF NOT EXISTS escrow_one_release_transaction_per_milestone
ON public.escrow_transactions(milestone_id)
WHERE transaction_type = 'release' AND status IN ('pending', 'completed');

-- 3) Ensure unique stripe payment intent on escrow payments
CREATE UNIQUE INDEX IF NOT EXISTS escrow_unique_payment_intent
ON public.escrow_payments(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

-- 4) Add refund tracking columns if not exists
ALTER TABLE public.escrow_payments
ADD COLUMN IF NOT EXISTS total_refunded_amount NUMERIC DEFAULT 0;

-- 5) Create a function to calculate remaining refundable amount
CREATE OR REPLACE FUNCTION public.get_refundable_amount(p_escrow_payment_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_original_amount NUMERIC;
  v_total_refunded NUMERIC;
BEGIN
  SELECT amount, COALESCE(total_refunded_amount, 0)
  INTO v_original_amount, v_total_refunded
  FROM public.escrow_payments
  WHERE id = p_escrow_payment_id;
  
  RETURN GREATEST(0, v_original_amount - v_total_refunded);
END;
$$;

-- 6) Create trigger to update total_refunded_amount after refund transactions
CREATE OR REPLACE FUNCTION public.update_refund_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.transaction_type = 'refund' AND NEW.status = 'completed' THEN
    UPDATE public.escrow_payments
    SET total_refunded_amount = COALESCE(total_refunded_amount, 0) + NEW.amount
    WHERE id = NEW.escrow_payment_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_update_refund_total ON public.escrow_transactions;
CREATE TRIGGER trg_update_refund_total
AFTER INSERT ON public.escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_refund_total();