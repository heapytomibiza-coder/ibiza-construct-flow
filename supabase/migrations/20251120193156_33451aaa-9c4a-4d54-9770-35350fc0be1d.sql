-- Fix icon names to use PascalCase for proper Lucide icon mapping
UPDATE service_categories 
SET icon_name = 'Droplet' 
WHERE slug = 'plumbing';

UPDATE service_categories 
SET icon_name = 'Zap' 
WHERE slug = 'electrical';

UPDATE service_categories 
SET icon_name = 'Waves' 
WHERE slug = 'pool-spa';

UPDATE service_categories 
SET icon_name = 'Sparkles' 
WHERE slug = 'cleaning';

UPDATE service_categories 
SET icon_name = 'Leaf' 
WHERE slug = 'gardening';

UPDATE service_categories 
SET icon_name = 'Wind' 
WHERE slug = 'hvac';

UPDATE service_categories 
SET icon_name = 'Paintbrush' 
WHERE slug = 'painting';