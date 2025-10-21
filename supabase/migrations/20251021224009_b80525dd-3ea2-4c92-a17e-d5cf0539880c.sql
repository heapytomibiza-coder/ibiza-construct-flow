
-- Fix functions missing search_path

-- Fix generate_receipt_number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receipt_num TEXT;
BEGIN
  receipt_num := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  RETURN receipt_num;
END;
$$;

-- Fix prevent_approved_mutation
CREATE OR REPLACE FUNCTION public.prevent_approved_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.status = 'approved' AND (
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.source IS DISTINCT FROM NEW.source OR
    OLD.prompt_hash IS DISTINCT FROM NEW.prompt_hash
  )) THEN
    RAISE EXCEPTION 'Approved packs are immutable. Create a new version instead.';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_webhook_subscriptions_updated_at
CREATE OR REPLACE FUNCTION public.update_webhook_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
