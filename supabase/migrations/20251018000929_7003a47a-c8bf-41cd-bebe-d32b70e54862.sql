-- Deactivate all existing Pool Builder subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now()
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder');

UPDATE service_micro_categories 
SET is_active = false, updated_at = now()
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
);

-- Insert 6 new Pool Builder subcategories
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Pool Construction & Installation',
  'pool-construction-installation',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'pool-construction-installation' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Pool Refurbishment & Lining',
  'pool-refurbishment-lining',
  2,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'pool-refurbishment-lining' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Heating, Filtration & Technical Systems',
  'heating-filtration-technical',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'heating-filtration-technical' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Maintenance & Cleaning',
  'maintenance-cleaning',
  4,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'maintenance-cleaning' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Repairs & Leak Detection',
  'repairs-leak-detection',
  5,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'repairs-leak-detection' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'pool-builder'),
  'Pool Surrounds & Accessories',
  'pool-surrounds-accessories',
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'pool-surrounds-accessories' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'pool-builder')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

-- Insert micro-categories for Pool Construction & Installation
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'New Concrete Pool Construction',
  'new-concrete-pool-construction',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Infinity Edge / Overflow Pool Builds',
  'infinity-edge-overflow-pools',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Skimmer Pool Construction',
  'skimmer-pool-construction',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Fibreglass Pool Installation',
  'fibreglass-pool-installation',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Prefabricated Pool Systems',
  'prefabricated-pool-systems',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Above-ground Pool Builds',
  'above-ground-pool-builds',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Plunge Pools & Mini-pools',
  'plunge-pools-mini-pools',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Lap Pools & Fitness Pools',
  'lap-pools-fitness-pools',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Kids & Shallow Pools',
  'kids-shallow-pools',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Reinforced Concrete Shells',
  'reinforced-concrete-shells',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Pool Formwork & Rebar Installation',
  'pool-formwork-rebar',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Structural Waterproofing',
  'structural-waterproofing',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Pool Tile Installation',
  'pool-tile-installation',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Pool Coping & Edging',
  'pool-coping-edging',
  14,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 14, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-construction-installation'),
  'Pool Deck Integration',
  'pool-deck-integration',
  15,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 15, updated_at = now();

-- Insert micro-categories for Pool Refurbishment & Lining
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Pool Retiling',
  'pool-retiling',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Liner Replacement',
  'liner-replacement',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Fibreglass Resurfacing',
  'fibreglass-resurfacing',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Microcement Pool Resurfacing',
  'microcement-pool-resurfacing',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Waterproofing Membrane Application',
  'waterproofing-membrane',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Crack Repair & Structural Sealing',
  'crack-repair-structural-sealing',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Pool Repainting',
  'pool-repainting',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Tile Repair & Grout Renewal',
  'tile-repair-grout-renewal',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Coping Stone Replacement',
  'coping-stone-replacement',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Expansion Joint Resealing',
  'expansion-joint-resealing',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Structural Renovation of Old Pools',
  'structural-renovation-old-pools',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Step & Bench Construction Inside Pools',
  'step-bench-construction',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-refurbishment-lining'),
  'Drain & Skimmer Repair',
  'drain-skimmer-repair',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();

-- Insert micro-categories for Heating, Filtration & Technical Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Filtration System Installation',
  'filtration-system-installation',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Filter Media Replacement',
  'filter-media-replacement',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Pump Installation & Replacement',
  'pump-installation-replacement',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Pool Heating System',
  'pool-heating-system',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Automatic Chemical Dosing Systems',
  'automatic-chemical-dosing',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Chlorine, Salt & UV Systems',
  'chlorine-salt-uv-systems',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Skimmer & Return Installation',
  'skimmer-return-installation',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Backwash Systems & Pipework',
  'backwash-systems-pipework',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Pool Automation Systems',
  'pool-automation-systems',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Flow & Pressure Testing',
  'flow-pressure-testing',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Water Feature & Jet Systems',
  'water-feature-jet-systems',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Pipe Leak Testing & Repair',
  'pipe-leak-testing-repair',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'heating-filtration-technical'),
  'Filtration Housing & Control Box',
  'filtration-housing-control-box',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();

-- Insert micro-categories for Maintenance & Cleaning
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Regular Pool Cleaning',
  'regular-pool-cleaning',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Chemical Balancing & Water Treatment',
  'chemical-balancing-water-treatment',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Vacuuming & Debris Removal',
  'vacuuming-debris-removal',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Filter & Basket Cleaning',
  'filter-basket-cleaning',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Seasonal Opening & Closing',
  'seasonal-opening-closing',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Shock Treatment & Algae Removal',
  'shock-treatment-algae-removal',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'pH & Chlorine Level Monitoring',
  'ph-chlorine-monitoring',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Salt Cell Cleaning & Descaling',
  'salt-cell-cleaning-descaling',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Pool Surface Brushing',
  'pool-surface-brushing',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Pump & Filter Inspection',
  'pump-filter-inspection',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Skimmer & Overflow Cleaning',
  'skimmer-overflow-cleaning',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'maintenance-cleaning'),
  'Emergency Cleaning & Restoration',
  'emergency-cleaning-restoration',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Repairs & Leak Detection
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Structural Leak Detection',
  'structural-leak-detection',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Tile Crack Repair',
  'tile-crack-repair',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Pipe & Fitting Leak Detection',
  'pipe-fitting-leak-detection',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Skimmer Box Leak Testing',
  'skimmer-box-leak-testing',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Pump & Filter Leaks',
  'pump-filter-leaks',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Return Jet & Suction Leak Repair',
  'return-jet-suction-leak-repair',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Hydrostatic Valve Repair',
  'hydrostatic-valve-repair',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Underground Plumbing Leak Detection',
  'underground-plumbing-leak',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Suction Line Vacuum Testing',
  'suction-line-vacuum-testing',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Patch Liner Repairs',
  'patch-liner-repairs',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Waterproof Coating Reapplication',
  'waterproof-coating-reapplication',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'repairs-leak-detection'),
  'Light Niche Sealing',
  'light-niche-sealing',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Pool Surrounds & Accessories
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Pool Lighting',
  'pool-lighting',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Safety Cover Installation',
  'safety-cover-installation',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Automatic Cover Systems',
  'automatic-cover-systems',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Pool Fencing & Safety Gates',
  'pool-fencing-safety-gates',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Waterfalls & Decorative Features',
  'waterfalls-decorative-features',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Outdoor Shower Installation',
  'outdoor-shower-installation',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Pool Signage & Depth Markers',
  'pool-signage-depth-markers',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Pool Furniture Installation',
  'pool-furniture-installation',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Poolside Tiling & Paving',
  'poolside-tiling-paving',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'pool-surrounds-accessories'),
  'Sound & Lighting Integration',
  'sound-lighting-integration',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();