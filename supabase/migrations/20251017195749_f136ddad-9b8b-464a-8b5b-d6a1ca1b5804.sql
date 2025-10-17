-- Clean up service_categories table

-- Delete duplicate categories (keeping the simpler named versions)
DELETE FROM service_categories WHERE slug IN ('painter-decorator', 'hvac-specialist', 'architects-design');

-- Update Glazier with icon and examples
UPDATE service_categories 
SET icon_name = 'Square',
    examples = ARRAY['Window Installation', 'Glass Replacement', 'Mirror Fitting']
WHERE slug = 'glazier';

-- Fix display orders to be sequential
UPDATE service_categories SET display_order = 1 WHERE slug = 'builder';
UPDATE service_categories SET display_order = 2 WHERE slug = 'plumber';
UPDATE service_categories SET display_order = 3 WHERE slug = 'electrician';
UPDATE service_categories SET display_order = 4 WHERE slug = 'carpenter';
UPDATE service_categories SET display_order = 5 WHERE slug = 'painter';
UPDATE service_categories SET display_order = 6 WHERE slug = 'pool-builder';
UPDATE service_categories SET display_order = 7 WHERE slug = 'plasterer';
UPDATE service_categories SET display_order = 8 WHERE slug = 'landscaper';
UPDATE service_categories SET display_order = 9 WHERE slug = 'tiler';
UPDATE service_categories SET display_order = 10 WHERE slug = 'roofer';
UPDATE service_categories SET display_order = 11 WHERE slug = 'architect';
UPDATE service_categories SET display_order = 12 WHERE slug = 'hvac';
UPDATE service_categories SET display_order = 13 WHERE slug = 'interior-designer';
UPDATE service_categories SET display_order = 14 WHERE slug = 'demolition';
UPDATE service_categories SET display_order = 15 WHERE slug = 'structural-works';
UPDATE service_categories SET display_order = 16 WHERE slug = 'locksmith';
UPDATE service_categories SET display_order = 17 WHERE slug = 'glazier';
UPDATE service_categories SET display_order = 18 WHERE slug = 'floors-doors-windows';
UPDATE service_categories SET display_order = 19 WHERE slug = 'kitchen-bathroom';
UPDATE service_categories SET display_order = 20 WHERE slug = 'commercial-projects';
UPDATE service_categories SET display_order = 21 WHERE slug = 'handyman';
UPDATE service_categories SET display_order = 22 WHERE slug = 'legal-regulatory';
UPDATE service_categories SET display_order = 23 WHERE slug = 'transport';