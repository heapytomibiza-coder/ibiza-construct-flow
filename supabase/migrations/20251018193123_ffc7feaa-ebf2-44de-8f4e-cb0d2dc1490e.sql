-- Add complete subcategories and micro-categories for Roofer

UPDATE service_subcategories SET is_active = false 
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'roofer');

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'roofer')
);

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'roofer'), 'Roof Installation & Re-Roofing', 'roofer-roof-installation-reroofing', 1, true),
((SELECT id FROM service_categories WHERE slug = 'roofer'), 'Roof Repairs & Maintenance', 'roofer-roof-repairs-maintenance', 2, true),
((SELECT id FROM service_categories WHERE slug = 'roofer'), 'Roof Waterproofing & Insulation', 'roofer-roof-waterproofing-insulation', 3, true),
((SELECT id FROM service_categories WHERE slug = 'roofer'), 'Flat Roof Specialist', 'roofer-flat-roof-specialist', 4, true),
((SELECT id FROM service_categories WHERE slug = 'roofer'), 'Roof Features & Accessories', 'roofer-roof-features-accessories', 5, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Pitched roof construction', 'roofer-pitched-roof-construction', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Clay & concrete tile roofing', 'roofer-clay-concrete-tile-roofing', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Slate roof installation', 'roofer-slate-roof-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Metal roof systems (steel, aluminium)', 'roofer-metal-roof-systems', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Green & eco roof installation', 'roofer-green-eco-roof-installation', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-installation-reroofing'), 'Complete roof replacement', 'roofer-complete-roof-replacement', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Leak detection & repair', 'roofer-leak-detection-repair', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Tile or slate replacement', 'roofer-tile-slate-replacement', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Chimney flashing & repair', 'roofer-chimney-flashing-repair', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Ridge & hip tile repair', 'roofer-ridge-hip-tile-repair', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Storm & wind damage repair', 'roofer-storm-wind-damage-repair', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-repairs-maintenance'), 'Annual roof inspection & maintenance', 'roofer-annual-roof-inspection-maintenance', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-waterproofing-insulation'), 'Waterproof membrane installation', 'roofer-waterproof-membrane-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-waterproofing-insulation'), 'Thermal insulation upgrade', 'roofer-thermal-insulation-upgrade', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-waterproofing-insulation'), 'Breathable underlayment', 'roofer-breathable-underlayment', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-waterproofing-insulation'), 'Vapour barrier installation', 'roofer-vapour-barrier-installation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-flat-roof-specialist'), 'EPDM rubber flat roof', 'roofer-epdm-rubber-flat-roof', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-flat-roof-specialist'), 'GRP fibreglass flat roof', 'roofer-grp-fibreglass-flat-roof', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-flat-roof-specialist'), 'Bitumen & felt flat roofing', 'roofer-bitumen-felt-flat-roofing', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-flat-roof-specialist'), 'Flat roof drainage systems', 'roofer-flat-roof-drainage-systems', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-features-accessories'), 'Skylight & rooflight installation', 'roofer-skylight-rooflight-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-features-accessories'), 'Gutter installation & repair', 'roofer-gutter-installation-repair', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-features-accessories'), 'Fascia & soffit installation', 'roofer-fascia-soffit-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-features-accessories'), 'Roof ventilation systems', 'roofer-roof-ventilation-systems', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'roofer-roof-features-accessories'), 'Solar panel roof integration', 'roofer-solar-panel-roof-integration', 5, true);