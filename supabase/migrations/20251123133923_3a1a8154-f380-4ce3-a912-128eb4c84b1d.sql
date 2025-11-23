-- Step 1: Delete duplicate category entries
DELETE FROM service_categories WHERE slug IN ('gardening', 'painting', 'handyman-general-services');

-- Step 2: Add Transport & Logistics category
INSERT INTO service_categories (
  name, 
  slug, 
  description, 
  icon_name, 
  display_order, 
  category_group, 
  examples, 
  is_active
) VALUES (
  'Transport & Logistics',
  'transport-logistics',
  'Moving, removals, and transportation services',
  'Truck',
  10,
  'SPECIALIST',
  ARRAY['Removals & moving', 'Waste removal', 'Heavy equipment transport', 'Delivery services'],
  true
);

-- Step 3: Update display order for clean 4x4 grid (16 categories)
-- Row 1: Core Building Trades
UPDATE service_categories SET display_order = 1 WHERE slug = 'building';
UPDATE service_categories SET display_order = 2 WHERE slug = 'carpentry';
UPDATE service_categories SET display_order = 3 WHERE slug = 'plumbing';
UPDATE service_categories SET display_order = 4 WHERE slug = 'electrical';

-- Row 2: MEP & Finishes
UPDATE service_categories SET display_order = 5 WHERE slug = 'air-conditioning';
UPDATE service_categories SET display_order = 6 WHERE slug = 'painting-decorating';
UPDATE service_categories SET display_order = 7 WHERE slug = 'cleaning';
UPDATE service_categories SET display_order = 8 WHERE slug = 'gardening-landscaping';

-- Row 3: Specialist Services
UPDATE service_categories SET display_order = 9 WHERE slug = 'pool-maintenance';
UPDATE service_categories SET display_order = 10 WHERE slug = 'transport-logistics';
UPDATE service_categories SET display_order = 11 WHERE slug = 'architecture';
UPDATE service_categories SET display_order = 12 WHERE slug = 'kitchen-bathroom-questions';

-- Row 4: General & Professional
UPDATE service_categories SET display_order = 13 WHERE slug = 'floors-doors-windows-questions';
UPDATE service_categories SET display_order = 14 WHERE slug = 'handyman-general';
UPDATE service_categories SET display_order = 15 WHERE slug = 'commercial-industrial-questions';
UPDATE service_categories SET display_order = 16 WHERE slug = 'legal-regulatory-questions';