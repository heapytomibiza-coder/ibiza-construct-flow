
-- Fix main category uniformity: add examples and standardize icons
UPDATE service_categories SET 
  examples = ARRAY['Foundation work', 'Structural repairs', 'Extensions', 'Renovations'],
  icon_name = 'Building2'
WHERE slug = 'construction';

UPDATE service_categories SET 
  examples = ARRAY['Custom furniture', 'Fitted wardrobes', 'Bespoke joinery', 'Door fitting'],
  icon_name = 'Hammer'
WHERE slug = 'carpentry';

UPDATE service_categories SET 
  examples = ARRAY['Leak repairs', 'Boiler installation', 'Bathroom fitting', 'Emergency plumbing']
WHERE slug = 'plumbing';

UPDATE service_categories SET 
  examples = ARRAY['Rewiring', 'Fuse box upgrades', 'Lighting installation', 'PAT testing']
WHERE slug = 'electrical';

UPDATE service_categories SET 
  examples = ARRAY['Pool installation', 'Water treatment', 'Pool heating', 'Maintenance']
WHERE slug = 'pool-spa';

UPDATE service_categories SET 
  examples = ARRAY['House cleaning', 'Office cleaning', 'Deep cleaning', 'End of tenancy']
WHERE slug = 'cleaning';

UPDATE service_categories SET 
  examples = ARRAY['Air conditioning', 'Central heating', 'Boiler servicing', 'Ventilation systems']
WHERE slug = 'hvac';

-- Add icons to all subcategories that are missing them

-- Construction subcategories
UPDATE service_subcategories SET icon_name = 'Home', icon_emoji = '🏠' WHERE slug = 'tiling';
UPDATE service_subcategories SET icon_name = 'Layers', icon_emoji = '🧱' WHERE slug = 'plastering';

-- Carpentry subcategories
UPDATE service_subcategories SET icon_name = 'Wrench' WHERE slug = 'custom-furniture';
UPDATE service_subcategories SET icon_name = 'DoorOpen' WHERE slug = 'doors-windows';
UPDATE service_subcategories SET icon_name = 'Square' WHERE slug = 'decking-outdoor';
UPDATE service_subcategories SET icon_name = 'Hammer' WHERE slug = 'general-joinery';

-- Plumbing subcategories
UPDATE service_subcategories SET icon_name = 'Droplet', icon_emoji = '💧' WHERE slug = 'general-plumbing';
UPDATE service_subcategories SET icon_name = 'Zap', icon_emoji = '⚡' WHERE slug = 'emergency-repairs';
UPDATE service_subcategories SET icon_name = 'Wrench', icon_emoji = '🔧' WHERE slug = 'installation' AND category_id IN (SELECT id FROM service_categories WHERE slug = 'plumbing');

-- Electrical subcategories
UPDATE service_subcategories SET icon_name = 'Zap', icon_emoji = '⚡' WHERE slug = 'general-electrical';
UPDATE service_subcategories SET icon_name = 'Zap', icon_emoji = '💡' WHERE slug = 'lighting';
UPDATE service_subcategories SET icon_name = 'Zap', icon_emoji = '🏠' WHERE slug = 'smart-home';

-- Pool & Spa subcategories
UPDATE service_subcategories SET icon_name = 'Waves', icon_emoji = '🌊' WHERE slug = 'pool-maintenance';
UPDATE service_subcategories SET icon_name = 'Wrench', icon_emoji = '🔧' WHERE slug = 'pool-equipment';
UPDATE service_subcategories SET icon_name = 'Droplet', icon_emoji = '💧' WHERE slug = 'spa-services';

-- Cleaning subcategories
UPDATE service_subcategories SET icon_name = 'Sparkles', icon_emoji = '✨' WHERE slug = 'house-cleaning';
UPDATE service_subcategories SET icon_name = 'Building', icon_emoji = '🏢' WHERE slug = 'commercial-cleaning';
UPDATE service_subcategories SET icon_name = 'Sparkles', icon_emoji = '🧹' WHERE slug = 'deep-cleaning';

-- Gardening subcategories
UPDATE service_subcategories SET icon_name = 'Leaf', icon_emoji = '🌿' WHERE slug = 'lawn-care';
UPDATE service_subcategories SET icon_name = 'Leaf', icon_emoji = '🌳' WHERE slug = 'landscaping';
UPDATE service_subcategories SET icon_name = 'Leaf', icon_emoji = '🌲' WHERE slug = 'tree-services';

-- HVAC subcategories
UPDATE service_subcategories SET icon_name = 'Wind', icon_emoji = '❄️' WHERE slug = 'ac-repair';
UPDATE service_subcategories SET icon_name = 'Wind', icon_emoji = '🔥' WHERE slug = 'heating';
UPDATE service_subcategories SET icon_name = 'Wind', icon_emoji = '🌬️' WHERE slug = 'ventilation';

-- Painting subcategories
UPDATE service_subcategories SET icon_name = 'Paintbrush', icon_emoji = '🎨' WHERE slug = 'interior-painting';
UPDATE service_subcategories SET icon_name = 'Paintbrush', icon_emoji = '🏠' WHERE slug = 'exterior-painting';
UPDATE service_subcategories SET icon_name = 'Paintbrush', icon_emoji = '✨' WHERE slug = 'decorating';

-- Other categories subcategories
UPDATE service_subcategories SET icon_name = 'Ruler', icon_emoji = '📐' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'architects-design');

UPDATE service_subcategories SET icon_name = 'Bath', icon_emoji = '🚿' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom');

UPDATE service_subcategories SET icon_name = 'DoorOpen', icon_emoji = '🚪' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'floors-doors-windows');

UPDATE service_subcategories SET icon_name = 'Wrench', icon_emoji = '🔧' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'handyman-general');

UPDATE service_subcategories SET icon_name = 'Building', icon_emoji = '🏢' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'commercial-industrial');

UPDATE service_subcategories SET icon_name = 'FileText', icon_emoji = '📋' 
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'legal-regulatory');
