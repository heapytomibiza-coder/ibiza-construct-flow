-- Quote basket support: itemized quote requests and richer service items

-- 1) Itemized quote lines
CREATE TABLE IF NOT EXISTS quote_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  service_item_id UUID NOT NULL REFERENCES professional_service_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_request_items_quote_id
  ON quote_request_items(quote_request_id);

CREATE INDEX IF NOT EXISTS idx_quote_request_items_service_id
  ON quote_request_items(service_item_id);

-- 2) Extra fields for menu-style services
ALTER TABLE professional_service_items 
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS group_name TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whats_included JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- 3) Add notes column to quote_requests
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4) Enable RLS on quote_request_items
ALTER TABLE quote_request_items ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies for quote_request_items
CREATE POLICY "Clients can view their quote request items"
  ON quote_request_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quote_requests qr
      JOIN jobs j ON j.id = qr.job_id
      WHERE qr.id = quote_request_items.quote_request_id
      AND j.client_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view quote items for their services"
  ON quote_request_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quote_requests qr
      WHERE qr.id = quote_request_items.quote_request_id
      AND qr.professional_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create quote items"
  ON quote_request_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6) Basic default ordering and data population for existing rows
UPDATE professional_service_items
SET sort_order = EXTRACT(EPOCH FROM created_at)::INTEGER
WHERE sort_order = 0;

UPDATE professional_service_items
SET group_name = CASE
  WHEN name ILIKE '%install%' THEN 'Installation Services'
  WHEN name ILIKE '%repair%' THEN 'Repair Services'
  WHEN name ILIKE '%custom%' THEN 'Custom Work'
  WHEN name ILIKE '%emergency%' THEN 'Emergency Services'
  ELSE 'General Services'
END
WHERE group_name IS NULL;

UPDATE professional_service_items
SET long_description = CASE 
  WHEN description IS NOT NULL THEN 
    description || E'\n\nOur professional service includes expert craftsmanship, quality materials, and satisfaction guaranteed.'
  ELSE 
    'Professional service performed by experienced specialists. Contact us for more details.'
END
WHERE long_description IS NULL;

-- 7) Index for performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at
  ON quote_requests(created_at DESC);