-- Deactivate empty duplicate subcategories to clean up the UI
-- Phase 1: Remove duplicates that have zero micro-categories linked

-- Floors, Doors & Windows - Deactivate 9 empty duplicates
UPDATE service_subcategories
SET is_active = false
WHERE name IN (
  'Flooring',
  'Flooring Installation', 
  'Floor Sanding',
  'Hardwood Flooring',
  'Laminate Flooring',
  'Window Fitting',
  'Window Installation',
  'Double Glazing',
  'Garage Doors'
)
AND category_id = (
  SELECT id FROM service_categories WHERE slug = 'floors-doors-windows'
)
AND NOT EXISTS (
  SELECT 1 FROM service_micro_categories 
  WHERE subcategory_id = service_subcategories.id 
  AND is_active = true
);

-- Pool & Spa - Deactivate 5 empty duplicates
UPDATE service_subcategories
SET is_active = false
WHERE name IN (
  'Pool Installation',
  'Pool Heating',
  'Pool Repair',
  'Spa Services',
  'Pool Maintenance'
)
AND category_id = (
  SELECT id FROM service_categories WHERE slug = 'pool-spa'
)
AND NOT EXISTS (
  SELECT 1 FROM service_micro_categories 
  WHERE subcategory_id = service_subcategories.id 
  AND is_active = true
);

-- Gardening & Landscaping - Deactivate 4 empty duplicates
UPDATE service_subcategories
SET is_active = false
WHERE name IN (
  'Garden Design',
  'Hedge Trimming',
  'Artificial Grass',
  'Garden Clearance'
)
AND category_id = (
  SELECT id FROM service_categories WHERE slug = 'gardening-landscaping'
)
AND NOT EXISTS (
  SELECT 1 FROM service_micro_categories 
  WHERE subcategory_id = service_subcategories.id 
  AND is_active = true
);