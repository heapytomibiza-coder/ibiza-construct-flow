-- Add Glazing & Glassworks Service Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('glazing-glassworks', 'glazing-and-glassworks');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('glazing-glassworks', 'glazing-and-glassworks')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('glazing-glassworks', 'glazing-and-glassworks')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Glazing & Glassworks',
  'glazing-glassworks',
  'Building2',
  'Professional glazing, glass installation, and custom glasswork services',
  'specialized',
  17,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  description = EXCLUDED.description,
  is_active = true;

-- Insert subcategories
INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.display_order,
  true
FROM service_categories c
CROSS JOIN (VALUES
  ('Window Installation & Replacement', 'window-installation-replacement', 'All types of window glazing and replacement services', 1),
  ('Glass Doors & Partitions', 'glass-doors-partitions', 'Interior and exterior glass door and partition systems', 2),
  ('Balustrades, Railings & Barriers', 'balustrades-railings-barriers', 'Glass safety barriers and decorative balustrades', 3),
  ('Mirrors, Splashbacks & Interior Features', 'mirrors-splashbacks-interior', 'Decorative and functional glass interior features', 4),
  ('Glass Repairs & Maintenance', 'glass-repairs-maintenance', 'Repair and maintenance of all glass installations', 5),
  ('Specialty & Custom Glass Fabrication', 'specialty-custom-glass', 'Bespoke glass fabrication and specialty products', 6)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'glazing-glassworks'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Window Installation & Replacement
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Single / double / triple glazed unit installation', 'glazed-unit-installation', 'Installation of single, double, or triple glazed units', 1),
  ('Replacement of existing window panes', 'window-pane-replacement', 'Replace broken or old window panes', 2),
  ('Aluminium, UPVC, or timber frame fitting', 'frame-fitting', 'Fitting of various frame materials', 3),
  ('Skylight and rooflight installation', 'skylight-rooflight-installation', 'Install skylights and rooflights', 4),
  ('French windows and sliding doors', 'french-windows-sliding-doors', 'Install French windows and sliding door systems', 5),
  ('Bi-fold and panoramic glass systems', 'bifold-panoramic-systems', 'Large opening glass door systems', 6),
  ('Acoustic / thermal performance glass fitting', 'acoustic-thermal-glass', 'Specialized performance glazing', 7),
  ('Heritage and listed building glazing', 'heritage-building-glazing', 'Traditional glazing for historic buildings', 8),
  ('Frameless structural glazing', 'frameless-structural-glazing', 'Modern frameless glass systems', 9),
  ('Bay and bow window installation', 'bay-bow-window-installation', 'Curved and projecting window systems', 10),
  ('Glass sealing and insulation upgrades', 'glass-sealing-insulation', 'Improve sealing and thermal performance', 11)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'window-installation-replacement'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Glass Doors & Partitions
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Interior glass doors (hinged or sliding)', 'interior-glass-doors', 'Install hinged or sliding interior glass doors', 1),
  ('Frameless glass partitions for offices or homes', 'frameless-glass-partitions', 'Modern office and home glass dividers', 2),
  ('Shower enclosures and cubicles', 'shower-enclosures', 'Bathroom glass shower installations', 3),
  ('Sliding glass door systems (manual or automatic)', 'sliding-glass-systems', 'Manual and automatic sliding doors', 4),
  ('Fire-rated and safety glass partitions', 'fire-rated-partitions', 'Safety-compliant glass partitions', 5),
  ('Privacy and tinted glass options', 'privacy-tinted-glass', 'Tinted or privacy glass installations', 6),
  ('Frosted, etched, or patterned glass panels', 'decorative-glass-panels', 'Decorative glass treatments', 7),
  ('Acoustic glass partitioning for offices', 'acoustic-glass-partitioning', 'Sound-reducing glass partitions', 8),
  ('Pivot or swing glass door systems', 'pivot-swing-doors', 'Pivot and swing door mechanisms', 9),
  ('Bespoke glass entranceways', 'bespoke-glass-entrances', 'Custom designed glass entrance systems', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'glass-doors-partitions'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Balustrades, Railings & Barriers
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Frameless glass balustrades (clamp or channel-fixed)', 'frameless-glass-balustrades', 'Modern frameless balustrade systems', 1),
  ('Juliet balconies', 'juliet-balconies', 'Small decorative balcony systems', 2),
  ('Staircase glass balustrades', 'staircase-balustrades', 'Glass barriers for staircases', 3),
  ('Terrace and balcony glass railings', 'terrace-balcony-railings', 'Outdoor glass railing systems', 4),
  ('Poolside safety barriers', 'poolside-barriers', 'Pool safety glass barriers', 5),
  ('Toughened laminated safety glass systems', 'toughened-safety-glass', 'High-strength safety glass', 6),
  ('Stainless steel handrail integration', 'handrail-integration', 'Integrated handrail systems', 7),
  ('Balustrade design, measurement & installation', 'balustrade-full-service', 'Complete balustrade service', 8),
  ('Glass-to-glass corner joints and brackets', 'glass-corner-systems', 'Corner joint and bracket solutions', 9)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'balustrades-railings-barriers'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Mirrors, Splashbacks & Interior Features
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Made-to-measure mirror installation', 'custom-mirror-installation', 'Bespoke mirror cutting and fitting', 1),
  ('Bathroom mirrors with integrated lighting', 'bathroom-mirrors-lighting', 'Illuminated bathroom mirrors', 2),
  ('Kitchen glass splashbacks', 'kitchen-splashbacks', 'Colored glass kitchen backsplashes', 3),
  ('Coloured / back-painted glass panels', 'colored-glass-panels', 'Custom colored glass installations', 4),
  ('Decorative wall cladding in glass', 'glass-wall-cladding', 'Glass wall covering systems', 5),
  ('Mirrored wardrobe doors', 'mirrored-wardrobe-doors', 'Sliding mirrored wardrobe systems', 6),
  ('Gym and dance studio mirrors', 'gym-studio-mirrors', 'Large format wall mirrors', 7),
  ('Antique or bevelled mirrors', 'antique-bevelled-mirrors', 'Traditional decorative mirrors', 8),
  ('Smart mirrors (with lighting or touch display)', 'smart-mirrors', 'High-tech interactive mirrors', 9)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'mirrors-splashbacks-interior'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Glass Repairs & Maintenance
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Cracked or broken glass replacement', 'broken-glass-replacement', 'Replace damaged glass panes', 1),
  ('Seal failure repair (fogged or misted glass)', 'seal-failure-repair', 'Fix failed double glazing seals', 2),
  ('Scratch removal and polishing', 'glass-scratch-removal', 'Polish and restore glass surfaces', 3),
  ('Frame and beading resealing', 'frame-beading-reseal', 'Reseal window frames and beading', 4),
  ('Leak detection & waterproofing', 'leak-detection-waterproofing', 'Find and fix water leaks', 5),
  ('Window mechanism and hinge repair', 'mechanism-hinge-repair', 'Fix opening mechanisms', 6),
  ('Emergency boarding-up services', 'emergency-boarding', 'Emergency glass damage response', 7),
  ('Safety film application', 'safety-film-application', 'Apply protective safety films', 8),
  ('Regular glass cleaning and inspection', 'glass-cleaning-inspection', 'Maintenance cleaning services', 9)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'glass-repairs-maintenance'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Specialty & Custom Glass Fabrication
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Curved or bent glass manufacturing', 'curved-bent-glass', 'Custom curved glass fabrication', 1),
  ('Laminated safety glass production', 'laminated-safety-glass', 'Multi-layer safety glass', 2),
  ('Tempered or toughened glass creation', 'tempered-toughened-glass', 'Heat-treated safety glass', 3),
  ('Coloured or tinted glass cutting', 'colored-tinted-glass', 'Custom tinted glass products', 4),
  ('Patterned or sandblasted design work', 'patterned-sandblasted-glass', 'Decorative glass treatments', 5),
  ('Low-iron (ultra-clear) glass', 'low-iron-glass', 'Crystal clear glass products', 6),
  ('One-way and reflective glass', 'one-way-reflective-glass', 'Privacy and reflective glass', 7),
  ('Solar control & UV protection glass', 'solar-control-glass', 'Energy-efficient glazing', 8),
  ('Custom CNC cut-outs for fixings and fittings', 'cnc-glass-cutting', 'Precision glass cutting services', 9)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'specialty-custom-glass'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'glazing-glassworks')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;