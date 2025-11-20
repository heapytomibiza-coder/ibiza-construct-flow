
-- Add icon columns to service_subcategories table
ALTER TABLE service_subcategories 
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS icon_emoji TEXT;

-- Add Hammer icon to Carpentry subcategory
UPDATE service_subcategories 
SET icon_name = 'Hammer',
    icon_emoji = '🔨'
WHERE slug = 'carpentry';

-- Add some other relevant icons for visual distinction
UPDATE service_subcategories 
SET icon_name = 'Home',
    icon_emoji = '🏗️'
WHERE slug = 'general-construction';

UPDATE service_subcategories 
SET icon_name = 'Building2',
    icon_emoji = '🧱'
WHERE slug IN ('masonry', 'bricklaying');

UPDATE service_subcategories 
SET icon_name = 'Home',
    icon_emoji = '🏠'
WHERE slug = 'roofing';

COMMENT ON COLUMN service_subcategories.icon_name IS 'Lucide icon component name for display';
COMMENT ON COLUMN service_subcategories.icon_emoji IS 'Emoji fallback for icon display';
