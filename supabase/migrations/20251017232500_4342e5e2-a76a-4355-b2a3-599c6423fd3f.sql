-- ============================================================================
-- Builder Taxonomy Fix - Alternative Approach
-- Deactivate duplicates instead of deleting, ensure clean state
-- ============================================================================

-- Step 1: Move the 6 existing micro-categories explicitly
UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = '02d180d7-ebb9-4f19-b789-9794ab20b4b3'; -- Kitchen Extension

UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = 'f1627014-48f3-42bd-8935-498e3d3fc4e2'; -- Rear Extension

UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = 'abe3f8b6-4cfe-46ff-ac0c-de5a036b4a78'; -- Side Return Extension

UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = '14484939-49b8-4daa-85a5-6e3e656a2eb6'; -- Kitchen Renovation

UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = '069765ed-b636-4764-9482-27e2a12209f7'; -- Bathroom Renovation

UPDATE public.service_micro_categories
SET subcategory_id = '430cf215-6ddd-4b48-b21f-27c4badef5b7'
WHERE id = '0acfb71a-cd9f-497b-88af-02c9da05bc6c'; -- Full House Renovation

-- Step 2: Deactivate duplicate/old subcategories
UPDATE public.service_subcategories
SET is_active = false
WHERE id IN (
  '07f8bf79-539e-4c96-8067-84148ae99286', -- Renovation
  'f5c29e99-af66-4ebb-85a3-76a807ae020d', -- Extensions
  '684eae56-0d9c-4de8-9d42-53f9f6ca80e5', -- Restoration
  '055460e4-ab3f-40da-9c4a-e978ece614f1'  -- Conversions
);

-- Step 3: Update existing subcategories names and display orders
UPDATE public.service_subcategories
SET name = 'New Builds', slug = 'new-builds', display_order = 2
WHERE id = 'b13f46f8-5513-4142-a8f0-bb0429d3280c';

UPDATE public.service_subcategories
SET 
  name = 'Structural Reinforcement & Load-Bearing Works',
  slug = 'structural-reinforcement-load-bearing-works',
  display_order = 4
WHERE id = 'dab9917e-37af-4636-b3c9-e0a144850ed3';

UPDATE public.service_subcategories
SET display_order = 1
WHERE id = '430cf215-6ddd-4b48-b21f-27c4badef5b7';

UPDATE public.service_subcategories
SET display_order = 3
WHERE id = '0472b539-9597-43ec-8ee7-8170b5f6578d';

-- Step 4: Insert missing subcategories
INSERT INTO public.service_subcategories (category_id, name, slug, display_order, is_active)
VALUES
  ('18839158-5b86-440f-9f67-87ec22227554', 'Demolition & Site Clearance', 'demolition-site-clearance', 5, true),
  ('18839158-5b86-440f-9f67-87ec22227554', 'Masonry & Concrete Works', 'masonry-concrete-works', 6, true),
  ('18839158-5b86-440f-9f67-87ec22227554', 'Conversions & Restorations', 'conversions-restorations', 7, true)
ON CONFLICT DO NOTHING;

-- Step 5: Deactivate all existing Builder micro-categories except the 6 we migrated
UPDATE public.service_micro_categories
SET is_active = false
WHERE subcategory_id IN (
  SELECT id FROM public.service_subcategories
  WHERE category_id = '18839158-5b86-440f-9f67-87ec22227554'
  AND is_active = true
)
AND id NOT IN (
  '02d180d7-ebb9-4f19-b789-9794ab20b4b3',
  'f1627014-48f3-42bd-8935-498e3d3fc4e2',
  'abe3f8b6-4cfe-46ff-ac0c-de5a036b4a78',
  '14484939-49b8-4daa-85a5-6e3e656a2eb6',
  '069765ed-b636-4764-9482-27e2a12209f7',
  '0acfb71a-cd9f-497b-88af-02c9da05bc6c'
);

-- Step 6: Insert all 71 micro-categories
-- Extensions & Renovations (19)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
VALUES
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Single-storey extensions', 'single-storey-extensions', 1, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Double-storey extensions', 'double-storey-extensions', 2, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Kitchen extensions', 'kitchen-extensions', 3, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Bathroom extensions', 'bathroom-extensions', 4, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Loft conversions', 'loft-conversions', 5, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Garage conversions', 'garage-conversions', 6, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Basement conversions', 'basement-conversions', 7, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Full home renovations', 'full-home-renovations', 8, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Apartment refurbishments', 'apartment-refurbishments', 9, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Commercial refurbishments', 'commercial-refurbishments', 10, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Structural wall removal', 'structural-wall-removal', 11, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Open-plan conversions', 'open-plan-conversions', 12, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Annex construction', 'annex-construction', 13, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Rear / side extensions', 'rear-side-extensions', 14, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Internal remodeling', 'internal-remodeling', 15, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Structural steel installation (RSJs)', 'structural-steel-installation-rsjs', 16, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Roof structure alteration', 'roof-structure-alteration', 17, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Masonry openings (doors/windows)', 'masonry-openings-doors-windows', 18, true),
  ('430cf215-6ddd-4b48-b21f-27c4badef5b7', 'Building regulation upgrades', 'building-regulation-upgrades', 19, true);

-- New Builds (13)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
VALUES
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Residential new build homes', 'residential-new-build-homes', 1, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Villas & luxury homes', 'villas-luxury-homes', 2, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Modular / prefab homes', 'modular-prefab-homes', 3, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Guest houses & casitas', 'guest-houses-casitas', 4, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Outbuildings & annexes', 'outbuildings-annexes', 5, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Commercial buildings', 'commercial-buildings', 6, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Multi-unit developments', 'multi-unit-developments', 7, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Foundations & slab works', 'foundations-slab-works', 8, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Shell & core construction', 'shell-core-construction', 9, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Turnkey new builds', 'turnkey-new-builds', 10, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Framing & structural works', 'framing-structural-works', 11, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Site setup & coordination', 'site-setup-coordination', 12, true),
  ('b13f46f8-5513-4142-a8f0-bb0429d3280c', 'Building envelope completion', 'building-envelope-completion', 13, true);

-- Foundations & Groundworks (12)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
VALUES
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Site preparation & clearance', 'site-preparation-clearance', 1, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Excavation & earthworks', 'excavation-earthworks', 2, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Footings & foundations', 'footings-foundations', 3, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Reinforced concrete slabs', 'reinforced-concrete-slabs', 4, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Ground beams', 'ground-beams', 5, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Drainage & soakaway systems', 'drainage-soakaway-systems', 6, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Retaining walls (concrete, stone, gabion)', 'retaining-walls-concrete-stone-gabion', 7, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Service trenches', 'service-trenches', 8, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Septic tanks & soakaway installations', 'septic-tanks-soakaway-installations', 9, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Piling & underpinning', 'piling-underpinning', 10, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Concrete driveways & hardstanding', 'concrete-driveways-hardstanding', 11, true),
  ('0472b539-9597-43ec-8ee7-8170b5f6578d', 'Structural drainage installation', 'structural-drainage-installation', 12, true);

-- Structural Reinforcement (12)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
VALUES
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'RSJ / steel beam installation', 'rsj-steel-beam-installation', 1, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Structural wall removal', 'structural-wall-removal-structural', 2, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Concrete & steel reinforcement', 'concrete-steel-reinforcement', 3, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Underpinning foundations', 'underpinning-foundations', 4, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Structural floor replacement', 'structural-floor-replacement', 5, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Roof truss replacement', 'roof-truss-replacement', 6, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Structural column & beam design', 'structural-column-beam-design', 7, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Structural surveys & assessments', 'structural-surveys-assessments', 8, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Crack repair & stabilisation', 'crack-repair-stabilisation', 9, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Retaining structure reinforcement', 'retaining-structure-reinforcement', 10, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Lintel replacement', 'lintel-replacement', 11, true),
  ('dab9917e-37af-4636-b3c9-e0a144850ed3', 'Foundation stabilisation', 'foundation-stabilisation', 12, true);

-- Demolition & Site Clearance (12) - uses dynamic lookup
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  ssc.id,
  t.name,
  t.slug,
  t.display_order,
  true
FROM public.service_subcategories ssc,
(VALUES
  ('Internal strip-out', 'internal-strip-out', 1),
  ('Full demolition', 'full-demolition', 2),
  ('Garage / outbuilding removal', 'garage-outbuilding-removal', 3),
  ('Concrete cutting & removal', 'concrete-cutting-removal', 4),
  ('Wall and partition removal', 'wall-partition-removal', 5),
  ('Structural dismantling', 'structural-dismantling', 6),
  ('Site clearance', 'site-clearance', 7),
  ('Waste removal & disposal', 'waste-removal-disposal', 8),
  ('Ground remediation', 'ground-remediation', 9),
  ('Asbestos testing & removal coordination', 'asbestos-testing-removal-coordination', 10),
  ('Debris sorting & recycling', 'debris-sorting-recycling', 11),
  ('Excavation after demolition', 'excavation-after-demolition', 12)
) AS t(name, slug, display_order)
WHERE ssc.slug = 'demolition-site-clearance'
  AND ssc.category_id = '18839158-5b86-440f-9f67-87ec22227554';

-- Masonry & Concrete Works (12)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  ssc.id,
  t.name,
  t.slug,
  t.display_order,
  true
FROM public.service_subcategories ssc,
(VALUES
  ('Concrete blockwork', 'concrete-blockwork', 1),
  ('Brickwork construction', 'brickwork-construction', 2),
  ('Stone masonry & facades', 'stone-masonry-facades', 3),
  ('Concrete pouring & formwork', 'concrete-pouring-formwork', 4),
  ('Retaining wall building', 'retaining-wall-building', 5),
  ('Decorative block or stonework', 'decorative-block-stonework', 6),
  ('Reinforced concrete structures', 'reinforced-concrete-structures', 7),
  ('Trowel & render finishing', 'trowel-render-finishing', 8),
  ('Cement-based repairs', 'cement-based-repairs', 9),
  ('Structural patching', 'structural-patching', 10),
  ('Architectural concrete detailing', 'architectural-concrete-detailing', 11),
  ('Floor slab casting', 'floor-slab-casting', 12)
) AS t(name, slug, display_order)
WHERE ssc.slug = 'masonry-concrete-works'
  AND ssc.category_id = '18839158-5b86-440f-9f67-87ec22227554';

-- Conversions & Restorations (12)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active)
SELECT 
  ssc.id,
  t.name,
  t.slug,
  t.display_order,
  true
FROM public.service_subcategories ssc,
(VALUES
  ('Historical restoration', 'historical-restoration', 1),
  ('Traditional finca renovation', 'traditional-finca-renovation', 2),
  ('Heritage facade repair', 'heritage-facade-repair', 3),
  ('Structural rebuilds', 'structural-rebuilds', 4),
  ('Roof restoration', 'roof-restoration', 5),
  ('Damp proofing & waterproofing', 'damp-proofing-waterproofing', 6),
  ('Fire damage rebuilds', 'fire-damage-rebuilds', 7),
  ('Flood damage rebuilds', 'flood-damage-rebuilds', 8),
  ('Repointing stonework', 'repointing-stonework', 9),
  ('Salvage material integration', 'salvage-material-integration', 10),
  ('Modernization while preserving character', 'modernization-preserving-character', 11),
  ('Internal reconfigurations', 'internal-reconfigurations', 12)
) AS t(name, slug, display_order)
WHERE ssc.slug = 'conversions-restorations'
  AND ssc.category_id = '18839158-5b86-440f-9f67-87ec22227554';