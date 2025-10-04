-- Phase 1: Add taxonomy columns to professional_service_items
ALTER TABLE professional_service_items
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS micro TEXT;

-- Create index for fast taxonomy filtering
CREATE INDEX IF NOT EXISTS idx_service_items_taxonomy 
ON professional_service_items(category, subcategory, micro);

-- Add helpful comment
COMMENT ON COLUMN professional_service_items.category IS 'Main service category from taxonomy (e.g., "Architects & Design")';
COMMENT ON COLUMN professional_service_items.subcategory IS 'Service subcategory from taxonomy (e.g., "Architects")';
COMMENT ON COLUMN professional_service_items.micro IS 'Micro service from taxonomy (e.g., "Building Permit Applications")';