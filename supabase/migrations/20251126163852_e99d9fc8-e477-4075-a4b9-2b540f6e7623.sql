-- Phase 2: Merge Split Micros into Correct Subcategories
-- This consolidates micro-categories that were split across duplicate subcategories

-- Step 1: Move "Lawn care & turfing" micros to "Lawn Care"
UPDATE service_micro_categories
SET subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Lawn Care' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'gardening-landscaping')
  LIMIT 1
)
WHERE subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Lawn care & turfing'
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'gardening-landscaping')
  LIMIT 1
);

-- Step 2: Move "Tree Services" micros to "Tree & hedge care"
UPDATE service_micro_categories
SET subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Tree & hedge care'
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'gardening-landscaping')
  LIMIT 1
)
WHERE subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Tree Services'
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'gardening-landscaping')
  LIMIT 1
);

-- Step 3: Move "Pool Maintenance" micros to "Pool maintenance & cleaning"
UPDATE service_micro_categories
SET subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Pool maintenance & cleaning'
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-spa')
  LIMIT 1
)
WHERE subcategory_id = (
  SELECT id FROM service_subcategories 
  WHERE name = 'Pool Maintenance'
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-spa')
  LIMIT 1
);

-- Step 4: Deactivate the now-empty source subcategories
UPDATE service_subcategories
SET is_active = false
WHERE name IN ('Lawn care & turfing', 'Tree Services', 'Pool Maintenance')
AND NOT EXISTS (
  SELECT 1 FROM service_micro_categories 
  WHERE subcategory_id = service_subcategories.id 
  AND is_active = true
);