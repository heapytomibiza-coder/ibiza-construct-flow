-- 1) Create service name mapping table
CREATE TABLE IF NOT EXISTS service_name_map (
  source TEXT CHECK (source IN ('services','services_micro')) NOT NULL,
  raw_category TEXT NOT NULL,
  norm_category TEXT NOT NULL,
  PRIMARY KEY (source, raw_category)
);

-- 2) Insert mappings to normalize services_micro categories to original construction categories
INSERT INTO service_name_map (source, raw_category, norm_category) VALUES
('services_micro','Building Design','Construction'),
('services_micro','Cleaning Services','Cleaning'),
('services_micro','Home Maintenance','Handyman'),
('services_micro','Home Services','Handyman'),
('services_micro','Transport & Deliveries','Moving'),
('services_micro','Electrical Services','Electrical'),
('services_micro','Plumbing Services','Plumbing'),
('services_micro','HVAC Services','HVAC'),
('services_micro','Painting Services','Painting'),
('services_micro','Personal Services','Personal'),
('services_micro','Delivery Services','Delivery')
ON CONFLICT DO NOTHING;

-- 3) Create unified view that combines both tables with normalized categories
CREATE OR REPLACE VIEW services_unified_v1 AS
WITH base AS (
  SELECT 
    'services'::TEXT as source,
    id, category, subcategory, micro, 
    created_at, is_featured, 
    NULL::jsonb as questions_micro,
    NULL::jsonb as questions_logistics
  FROM services
  UNION ALL
  SELECT 
    'services_micro'::TEXT as source,
    id, category, subcategory, micro,
    created_at, 
    NULL::boolean as is_featured,
    questions_micro,
    questions_logistics
  FROM services_micro
),
normalized AS (
  SELECT
    b.source, b.id,
    COALESCE(m.norm_category, b.category) as category,
    b.subcategory, b.micro, b.created_at,
    b.is_featured, b.questions_micro, b.questions_logistics
  FROM base b
  LEFT JOIN service_name_map m
    ON m.source = b.source AND m.raw_category = b.category
)
SELECT * FROM normalized;