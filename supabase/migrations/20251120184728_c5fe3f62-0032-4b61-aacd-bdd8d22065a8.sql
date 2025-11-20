-- ============================================
-- HYBRID TAXONOMY MIGRATION: 12-14 CATEGORIES
-- ============================================

-- Step 1: Rename existing categories for clarity
UPDATE service_categories 
SET 
  name = 'Painting & Decorating', 
  description = 'Interior and exterior painting, decorating, and specialty finishes',
  examples = ARRAY['Interior painting', 'Exterior painting', 'Decorating', 'Wallpapering']
WHERE slug = 'painting';

UPDATE service_categories 
SET 
  name = 'Gardening & Landscaping', 
  description = 'Lawn care, landscaping, tree services, and garden design',
  examples = ARRAY['Garden design', 'Lawn care', 'Tree services', 'Landscaping']
WHERE slug = 'gardening';

-- Step 2: Add 6 new specialist categories
INSERT INTO service_categories (name, slug, description, display_order, icon_name, icon_emoji, category_group, examples)
VALUES 
  ('Architects & Design', 'architects-design', 'Professional design, architectural services, and structural engineering', 9, 'Ruler', '📐', 'specialist', ARRAY['Building plans', 'Interior design', '3D renders', 'Structural calculations']),
  ('Kitchen & Bathroom', 'kitchen-bathroom', 'Specialized kitchen and bathroom installation and renovation', 10, 'Bath', '🚿', 'specialist', ARRAY['Kitchen fitting', 'Bathroom design', 'Wetrooms', 'Cabinet installation']),
  ('Floors, Doors & Windows', 'floors-doors-windows', 'Flooring, door, and window installation services', 11, 'DoorOpen', '🚪', 'specialist', ARRAY['Flooring', 'Window installation', 'Door fitting', 'Double glazing']),
  ('Handyman & General Services', 'handyman-general', 'General repairs, assembly, and multi-trade services', 12, 'Wrench', '🔧', 'core', ARRAY['General repairs', 'Furniture assembly', 'Odd jobs', 'Maintenance']),
  ('Commercial & Industrial', 'commercial-industrial', 'Commercial projects, office fit-outs, and industrial services', 13, 'Building', '🏢', 'specialist', ARRAY['Office fit-outs', 'Retail spaces', 'Commercial projects', 'Industrial work']),
  ('Legal & Regulatory', 'legal-regulatory', 'Building permits, planning applications, and compliance', 14, 'FileText', '📋', 'specialist', ARRAY['Building permits', 'Planning applications', 'Compliance', 'Legal support'])
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  icon_name = EXCLUDED.icon_name,
  icon_emoji = EXCLUDED.icon_emoji,
  category_group = EXCLUDED.category_group,
  examples = EXCLUDED.examples;

-- Step 3: Expand Construction subcategories (add trade roles)
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Carpentry',
  'carpentry',
  'Custom furniture, door fitting, decking, and woodwork',
  2
FROM service_categories sc
WHERE sc.slug = 'construction'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Tiling',
  'tiling',
  'Floor tiling, wall tiling, bathroom tiles',
  5
FROM service_categories sc
WHERE sc.slug = 'construction'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Plastering',
  'plastering',
  'Wall plastering, ceiling repair, rendering',
  6
FROM service_categories sc
WHERE sc.slug = 'construction'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Bricklaying',
  'bricklaying',
  'Brick walls, garden walls, structural brickwork',
  7
FROM service_categories sc
WHERE sc.slug = 'construction'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- Step 4: Add subcategories for Architects & Design
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Residential Architects',
  'residential-architects',
  'Home design, extensions, planning drawings',
  1
FROM service_categories sc
WHERE sc.slug = 'architects-design'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Interior Design',
  'interior-design',
  'Interior layouts, 3D renders, furniture selection',
  2
FROM service_categories sc
WHERE sc.slug = 'architects-design'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Structural Engineers',
  'structural-engineers',
  'Structural calculations, load assessments, beam design',
  3
FROM service_categories sc
WHERE sc.slug = 'architects-design'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Step 5: Add subcategories for Kitchen & Bathroom
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Kitchen Installation',
  'kitchen-installation',
  'Full kitchen fitting, cabinet installation, worktops',
  1
FROM service_categories sc
WHERE sc.slug = 'kitchen-bathroom'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Bathroom Fitting',
  'bathroom-fitting',
  'Complete bathroom installation, wetrooms, fixtures',
  2
FROM service_categories sc
WHERE sc.slug = 'kitchen-bathroom'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Cabinet Making',
  'cabinet-making',
  'Custom cabinets, worktop fabrication, storage solutions',
  3
FROM service_categories sc
WHERE sc.slug = 'kitchen-bathroom'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Step 6: Add subcategories for Floors, Doors & Windows
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Flooring',
  'flooring',
  'Wood, tile, vinyl, carpet installation',
  1
FROM service_categories sc
WHERE sc.slug = 'floors-doors-windows'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Door Installation',
  'door-installation',
  'Interior, exterior, sliding, bi-fold doors',
  2
FROM service_categories sc
WHERE sc.slug = 'floors-doors-windows'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Window Fitting',
  'window-fitting',
  'Double glazing, UPVC, sash windows',
  3
FROM service_categories sc
WHERE sc.slug = 'floors-doors-windows'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Step 7: Add subcategories for Handyman & General Services
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'General Repairs',
  'general-repairs',
  'Small fixes, maintenance, odd jobs',
  1
FROM service_categories sc
WHERE sc.slug = 'handyman-general'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Furniture Assembly',
  'furniture-assembly',
  'Flat-pack assembly, furniture installation',
  2
FROM service_categories sc
WHERE sc.slug = 'handyman-general'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Multi-Trade',
  'multi-trade',
  'Multiple trades, complex projects, full service',
  3
FROM service_categories sc
WHERE sc.slug = 'handyman-general'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Step 8: Add subcategories for Commercial & Industrial
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Office Fit-outs',
  'office-fitouts',
  'Commercial renovations, office partitions, fixtures',
  1
FROM service_categories sc
WHERE sc.slug = 'commercial-industrial'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Retail Spaces',
  'retail-spaces',
  'Shop fitting, retail design, display systems',
  2
FROM service_categories sc
WHERE sc.slug = 'commercial-industrial'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Industrial Projects',
  'industrial-projects',
  'Warehouse, factory, industrial installations',
  3
FROM service_categories sc
WHERE sc.slug = 'commercial-industrial'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Step 9: Add subcategories for Legal & Regulatory
INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Building Permits',
  'building-permits',
  'Town hall permits, building control applications',
  1
FROM service_categories sc
WHERE sc.slug = 'legal-regulatory'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Planning Applications',
  'planning-applications',
  'Planning permission, change of use, appeals',
  2
FROM service_categories sc
WHERE sc.slug = 'legal-regulatory'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

INSERT INTO service_subcategories (category_id, name, slug, description, display_order)
SELECT 
  sc.id,
  'Compliance & Inspections',
  'compliance-inspections',
  'Building regulations, compliance checks, certifications',
  3
FROM service_categories sc
WHERE sc.slug = 'legal-regulatory'
ON CONFLICT (category_id, slug) DO UPDATE SET
  description = EXCLUDED.description;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_category_group ON service_categories(category_group);
CREATE INDEX IF NOT EXISTS idx_service_subcategories_slug ON service_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_service_subcategories_category_id ON service_subcategories(category_id);