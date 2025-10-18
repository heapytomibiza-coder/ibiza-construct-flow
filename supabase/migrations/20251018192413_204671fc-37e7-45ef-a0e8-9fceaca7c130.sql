-- Phase 1: Clean up duplications and deactivate old categories
UPDATE service_categories SET is_active = false WHERE slug IN (
  'architect',
  'glazier', 
  'locksmith',
  'legal-regulatory',
  'transport',
  'demolition'
);

-- Add Demolition as subcategory under Builder
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'builder'),
  'Demolition & Deconstruction',
  'builder-demolition-deconstruction',
  99,
  true
);

-- Add micro-categories for Demolition under Builder
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Full building demolition', 'builder-full-building-demolition', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Partial demolition & structural removal', 'builder-partial-demolition-structural-removal', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Interior strip-out & gutting', 'builder-interior-strip-out-gutting', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Concrete breaking & removal', 'builder-concrete-breaking-removal', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Soft strip & deconstruction', 'builder-soft-strip-deconstruction', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Asbestos survey & removal coordination', 'builder-asbestos-survey-removal-coordination', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Waste removal & site clearance', 'builder-waste-removal-site-clearance', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'builder-demolition-deconstruction'), 'Salvage & material recovery', 'builder-salvage-material-recovery', 8, true);

-- Phase 2: Fix icon conflicts - update categories with better, unique icons
UPDATE service_categories SET icon_name = 'Grid3x3' WHERE slug = 'tiler';
UPDATE service_categories SET icon_name = 'Layers' WHERE slug = 'plasterer';
UPDATE service_categories SET icon_name = 'Sheet' WHERE slug = 'glazing-glassworks';
UPDATE service_categories SET icon_name = 'Ruler' WHERE slug = 'architecture-design-services';
UPDATE service_categories SET icon_name = 'Palette' WHERE slug = 'interior-designer';

-- Phase 3: Add category_group column for better UI organization
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS category_group TEXT;

-- Assign groups to categories
UPDATE service_categories SET category_group = 'core_construction' WHERE slug IN (
  'builder', 'carpenter', 'electrician', 'plumber', 'painter', 'tiler', 'plasterer', 'roofer'
);

UPDATE service_categories SET category_group = 'specialist_construction' WHERE slug IN (
  'structural-works', 'pool-builder', 'hvac', 'glazing-glassworks', 'floors-doors-windows'
);

UPDATE service_categories SET category_group = 'security_systems' WHERE slug IN (
  'locksmith-security-services'
);

UPDATE service_categories SET category_group = 'design_planning' WHERE slug IN (
  'architecture-design-services', 'interior-designer', 'landscaper'
);

UPDATE service_categories SET category_group = 'project_services' WHERE slug IN (
  'project-management-consultation', 'legal-regulatory-compliance-services'
);

UPDATE service_categories SET category_group = 'property_services' WHERE slug IN (
  'transportation-moving-delivery', 'handyman', 'kitchen-bathroom'
);

UPDATE service_categories SET category_group = 'commercial' WHERE slug IN (
  'commercial-projects'
);