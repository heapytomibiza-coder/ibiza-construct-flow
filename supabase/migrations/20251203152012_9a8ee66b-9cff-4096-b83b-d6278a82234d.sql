-- Phase 1: Reactivate Transport & Logistics category
UPDATE service_categories
SET is_active = true
WHERE slug = 'transport-logistics';

-- Phase 2: Create 3 Subcategories
INSERT INTO service_subcategories (category_id, name, slug, is_active, display_order)
SELECT 
  c.id,
  'Small Moves & Deliveries',
  'small-moves-deliveries',
  true,
  1
FROM service_categories c
WHERE c.slug = 'transport-logistics';

INSERT INTO service_subcategories (category_id, name, slug, is_active, display_order)
SELECT 
  c.id,
  'Heavy Lifting & Equipment',
  'heavy-lifting-equipment',
  true,
  2
FROM service_categories c
WHERE c.slug = 'transport-logistics';

INSERT INTO service_subcategories (category_id, name, slug, is_active, display_order)
SELECT 
  c.id,
  'Waste & Materials',
  'waste-materials',
  true,
  3
FROM service_categories c
WHERE c.slug = 'transport-logistics';

-- Phase 3: Create 6 Micro Services
-- Man with a Van
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Man with a Van',
  'man-with-van',
  true,
  1
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'small-moves-deliveries';

-- Furniture & Appliance Delivery
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Furniture & Appliance Delivery',
  'furniture-appliance-delivery',
  true,
  2
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'small-moves-deliveries';

-- Crane Hire
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Crane Hire',
  'crane-hire',
  true,
  1
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'heavy-lifting-equipment';

-- Heavy Equipment Transport
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Heavy Equipment Transport',
  'heavy-equipment-transport',
  true,
  2
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'heavy-lifting-equipment';

-- Skip Hire & Delivery
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Skip Hire & Delivery',
  'skip-hire-delivery',
  true,
  1
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'waste-materials';

-- Material Delivery
INSERT INTO service_micro_categories (subcategory_id, name, slug, is_active, display_order)
SELECT 
  sc.id,
  'Material Delivery',
  'material-delivery',
  true,
  2
FROM service_subcategories sc
JOIN service_categories c ON sc.category_id = c.id
WHERE c.slug = 'transport-logistics' AND sc.slug = 'waste-materials';