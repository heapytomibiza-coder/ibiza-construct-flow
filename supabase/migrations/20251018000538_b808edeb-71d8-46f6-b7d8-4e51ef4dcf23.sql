-- Deactivate all existing Painter subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now()
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'painter');

UPDATE service_micro_categories 
SET is_active = false, updated_at = now()
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
);

-- Insert 6 new Painter subcategories
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Interior Painting',
  'interior-painting',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'interior-painting' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Exterior Painting',
  'exterior-painting',
  2,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'exterior-painting' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Decorative Finishes & Effects',
  'decorative-finishes-effects',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'decorative-finishes-effects' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Wallpapering & Wall Coverings',
  'wallpapering-wall-coverings',
  4,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'wallpapering-wall-coverings' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Commercial & Large-Scale Projects',
  'commercial-large-scale',
  5,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'commercial-large-scale' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_categories WHERE slug = 'painter'),
  'Preparation & Finishing',
  'preparation-finishing',
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_subcategories 
  WHERE slug = 'preparation-finishing' 
  AND category_id = (SELECT id FROM service_categories WHERE slug = 'painter')
  AND is_active = true
)
ON CONFLICT (category_id, slug) 
DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

-- Insert micro-categories for Interior Painting
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Full House or Apartment Repainting',
  'full-house-apartment-repainting',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Room Repainting',
  'room-repainting',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Ceiling & Wall Painting',
  'ceiling-wall-painting',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Feature Walls & Accent Colours',
  'feature-walls-accent-colours',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Woodwork Painting',
  'woodwork-painting',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Furniture Repainting or Refinishing',
  'furniture-repainting-refinishing',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Staircase & Balustrade Painting',
  'staircase-balustrade-painting',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Colour Matching & Consultation',
  'colour-matching-consultation',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Radiator & Metalwork Painting',
  'radiator-metalwork-painting',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Paint Correction & Touch-ups',
  'paint-correction-touch-ups',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Spray Painting (Interior)',
  'spray-painting-interior',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Primer & Base Coat Preparation',
  'primer-base-coat-prep',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'interior-painting'),
  'Surface Sanding & Repair Before Painting',
  'surface-sanding-repair',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();

-- Insert micro-categories for Exterior Painting
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Full Building Exterior Repaint',
  'full-building-exterior-repaint',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Villa Façade Painting',
  'villa-facade-painting',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Fence & Gate Painting',
  'fence-gate-painting',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Exterior Woodwork',
  'exterior-woodwork',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Metal Railing & Gate Painting',
  'metal-railing-gate-painting',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Render & Masonry Painting',
  'render-masonry-painting',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Waterproof & UV-protective Coatings',
  'waterproof-uv-coatings',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Roof Tile Painting & Coating',
  'roof-tile-painting-coating',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Balustrade & Terrace Railing Painting',
  'balustrade-terrace-railing',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Weatherproof Primer & Base Coating',
  'weatherproof-primer-base',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Anti-rust Metal Primers',
  'anti-rust-metal-primers',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'Spray Painting (Exterior)',
  'spray-painting-exterior',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'exterior-painting'),
  'External Preparation',
  'external-preparation',
  13,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 13, updated_at = now();

-- Insert micro-categories for Decorative Finishes & Effects
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Venetian Plaster / Stucco',
  'venetian-plaster-stucco',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Microcement & Decorative Concrete',
  'microcement-decorative-concrete',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Limewash & Natural Mineral Paints',
  'limewash-natural-mineral-paints',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Textured Wall Finishes',
  'textured-wall-finishes',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Metallic & Pearlescent Effects',
  'metallic-pearlescent-effects',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Stencils & Mural Painting',
  'stencils-mural-painting',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Faux Marble & Faux Wood Effects',
  'faux-marble-wood-effects',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Concrete-look Coatings',
  'concrete-look-coatings',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Polished Plaster Walls',
  'polished-plaster-walls',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Distressed or Vintage Paint Effects',
  'distressed-vintage-effects',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Feature Wall Design & Application',
  'feature-wall-design-application',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'decorative-finishes-effects'),
  'Chalk Paint & Soft-touch Finishes',
  'chalk-paint-soft-touch',
  12,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 12, updated_at = now();

-- Insert micro-categories for Wallpapering & Wall Coverings
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Wallpaper Installation',
  'wallpaper-installation',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Removal of Old Wallpaper',
  'removal-old-wallpaper',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Lining Paper Installation',
  'lining-paper-installation',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Wall Mural Installation',
  'wall-mural-installation',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Digital Print Wall Coverings',
  'digital-print-wall-coverings',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Grasscloth & Textured Wallpaper',
  'grasscloth-textured-wallpaper',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Feature Wall Wallpapering',
  'feature-wall-wallpapering',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Seam Repair & Re-glue',
  'seam-repair-reglue',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Protective Wall Coatings Over Wallpaper',
  'protective-wall-coatings',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'wallpapering-wall-coverings'),
  'Surface Prep & Priming Before Wallpaper',
  'surface-prep-priming-wallpaper',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

-- Insert micro-categories for Commercial & Large-Scale Projects
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Hotel & Restaurant Repainting',
  'hotel-restaurant-repainting',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Retail & Office Painting',
  'retail-office-painting',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Industrial Unit Painting',
  'industrial-unit-painting',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Public Building Refurbishment',
  'public-building-refurbishment',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'High-access / Scaffolding Paintwork',
  'high-access-scaffolding',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Fire-resistant Coatings',
  'fire-resistant-coatings',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Anti-mould & Antibacterial Coatings',
  'anti-mould-antibacterial',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Floor Painting & Line Marking',
  'floor-painting-line-marking',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Ceiling Grid & Acoustic Tile Painting',
  'ceiling-grid-acoustic-tile',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Multi-room Scheduling & Coordination',
  'multi-room-scheduling',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'commercial-large-scale'),
  'Out-of-hours or Phased Painting Work',
  'out-of-hours-phased-work',
  11,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 11, updated_at = now();

-- Insert micro-categories for Preparation & Finishing
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Filling & Sanding Walls',
  'filling-sanding-walls',
  1,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 1, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Crack Repair & Plaster Touch-ups',
  'crack-repair-plaster-touchups',
  2,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 2, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Stain Blocking & Damp Sealing',
  'stain-blocking-damp-sealing',
  3,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 3, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Masking & Surface Protection',
  'masking-surface-protection',
  4,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 4, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Primer & Undercoat Application',
  'primer-undercoat-application',
  5,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 5, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Cleaning & Surface Degreasing',
  'cleaning-surface-degreasing',
  6,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 6, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Paint Stripping & Removal',
  'paint-stripping-removal',
  7,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 7, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Silicone & Caulking Finishing',
  'silicone-caulking-finishing',
  8,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 8, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Paint Blending for Touch-up Areas',
  'paint-blending-touchup',
  9,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 9, updated_at = now();

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  (SELECT id FROM service_subcategories WHERE slug = 'preparation-finishing'),
  'Cleaning After Completion',
  'cleaning-after-completion',
  10,
  true
ON CONFLICT (subcategory_id, slug) DO UPDATE SET is_active = true, display_order = 10, updated_at = now();