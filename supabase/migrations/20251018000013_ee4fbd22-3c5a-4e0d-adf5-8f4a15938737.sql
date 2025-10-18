-- Deactivate all existing Carpenter subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now()
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter');

UPDATE service_micro_categories 
SET is_active = false, updated_at = now()
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
);

-- Insert 6 new Carpenter subcategories
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Custom Furniture & Cabinetry',
  'custom-furniture-cabinetry',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'custom-furniture-cabinetry' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Doors, Frames & Fittings',
  'doors-frames-fittings',
  2,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'doors-frames-fittings' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Timber Structures & Roofs',
  'timber-structures-roofs',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'timber-structures-roofs' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Decking & Outdoor Joinery',
  'decking-outdoor-joinery',
  4,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'decking-outdoor-joinery' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Skirting, Architraves & Interior Detailing',
  'skirting-architraves-interior',
  5,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'skirting-architraves-interior' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'carpenter'),
  'Restoration & Repairs',
  'restoration-repairs',
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'restoration-repairs' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'carpenter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

-- Insert micro-categories for Custom Furniture & Cabinetry
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Built-in Wardrobes & Dressing Rooms',
  'built-in-wardrobes-dressing-rooms',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Alcove & Media Units',
  'alcove-media-units',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Kitchen Cabinets & Shelving',
  'kitchen-cabinets-shelving',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Bathroom Vanities & Storage Units',
  'bathroom-vanities-storage',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Floating Shelves & Wall Units',
  'floating-shelves-wall-units',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Home Office Desks & Fitted Furniture',
  'home-office-desks-fitted',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Bespoke Bookcases & Display Cabinets',
  'bespoke-bookcases-display',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Shop Counters, Bars & Reception Desks',
  'shop-counters-bars-reception',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Banquette Seating & Benches',
  'banquette-seating-benches',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Custom Storage Solutions Under Stairs',
  'custom-storage-under-stairs',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Furniture Restoration & Refinishing',
  'furniture-restoration-refinishing',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'custom-furniture-cabinetry'),
  'Timber Shelving & Display Systems',
  'timber-shelving-display-systems',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Doors, Frames & Fittings
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Internal Door Hanging & Fitting',
  'internal-door-hanging-fitting',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'External Door Installation',
  'external-door-installation',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Sliding & Pocket Doors',
  'sliding-pocket-doors',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Bi-folding & French Doors',
  'bi-folding-french-doors',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Fire-rated Doors & Frames',
  'fire-rated-doors-frames',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Door Frame Repair & Adjustment',
  'door-frame-repair-adjustment',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Lock & Hinge Fitting',
  'lock-hinge-fitting',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Door Trimming & Rehanging',
  'door-trimming-rehanging',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Custom-made Timber Doors',
  'custom-made-timber-doors',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Door Architrave & Casing Installation',
  'door-architrave-casing',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Soundproof or Insulated Doors',
  'soundproof-insulated-doors',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'doors-frames-fittings'),
  'Restoration of Antique Doors',
  'restoration-antique-doors',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Timber Structures & Roofs
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Timber Roof Framing',
  'timber-roof-framing',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Joists & Floor Structures',
  'joists-floor-structures',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Pergolas, Gazebos & Porches',
  'pergolas-gazebos-porches',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Timber-framed Buildings',
  'timber-framed-buildings',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Carports & Shelters',
  'carports-shelters',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Mezzanine Floors & Platforms',
  'mezzanine-floors-platforms',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Wooden Staircases',
  'wooden-staircases',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Balustrades & Handrails',
  'balustrades-handrails',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Loft Flooring & Access Structures',
  'loft-flooring-access',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Garden Buildings & Sheds',
  'garden-buildings-sheds',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Timber Canopy or Shade Structures',
  'timber-canopy-shade-structures',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'timber-structures-roofs'),
  'Outdoor Bar or Kitchen Framing',
  'outdoor-bar-kitchen-framing',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Decking & Outdoor Joinery
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Timber Decking Installation',
  'timber-decking-installation',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Composite Decking Installation',
  'composite-decking-installation',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Deck Repairs & Refinishing',
  'deck-repairs-refinishing',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Garden Seating & Bench Builds',
  'garden-seating-bench-builds',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Pergola & Trellis Construction',
  'pergola-trellis-construction',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Pool Surround Decking',
  'pool-surround-decking',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Outdoor Kitchens & Bars',
  'outdoor-kitchens-bars',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Timber Planters & Dividers',
  'timber-planters-dividers',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Balcony & Terrace Balustrades',
  'balcony-terrace-balustrades',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Stairs & Steps for Decks',
  'stairs-steps-decks',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'External Cladding & Soffits',
  'external-cladding-soffits',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decking-outdoor-joinery'),
  'Deck Lighting Integration',
  'deck-lighting-integration',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Skirting, Architraves & Interior Detailing
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Skirting Board Installation',
  'skirting-board-installation',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Architrave Fitting',
  'architrave-fitting',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Picture Rails & Dado Rails',
  'picture-rails-dado-rails',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Ceiling Coving & Timber Trims',
  'ceiling-coving-timber-trims',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Decorative Wall Panelling',
  'decorative-wall-panelling',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Wainscoting & Feature Walls',
  'wainscoting-feature-walls',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Acoustic Wall Cladding',
  'acoustic-wall-cladding',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Staircase Detailing & Trims',
  'staircase-detailing-trims',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Finishing Carpentry (Final Fix)',
  'finishing-carpentry-final-fix',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Timber Mouldings & Beading',
  'timber-mouldings-beading',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'skirting-architraves-interior'),
  'Restoration of Decorative Joinery',
  'restoration-decorative-joinery',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

-- Insert micro-categories for Restoration & Repairs
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Structural Timber Repair',
  'structural-timber-repair',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Replacing Damaged Beams or Joists',
  'replacing-damaged-beams-joists',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Refinishing & Revarnishing Timber Surfaces',
  'refinishing-revarnishing-timber',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Antique Furniture Repair',
  'antique-furniture-repair',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Sash Window & Frame Restoration',
  'sash-window-frame-restoration',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Staircase Repair & Reinforcement',
  'staircase-repair-reinforcement',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Timber Door & Window Restoration',
  'timber-door-window-restoration',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Exterior Joinery Restoration',
  'exterior-joinery-restoration',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Moisture or Sun-damage Repair',
  'moisture-sun-damage-repair',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Wood Filler & Surface Refinishing',
  'wood-filler-surface-refinishing',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Paint Stripping & Refinishing Prep',
  'paint-stripping-refinishing-prep',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'General Carpentry Repairs',
  'general-carpentry-repairs',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'restoration-repairs'),
  'Emergency Timber Repairs',
  'emergency-timber-repairs',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();