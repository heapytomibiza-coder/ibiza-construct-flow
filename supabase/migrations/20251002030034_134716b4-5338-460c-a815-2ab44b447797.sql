-- Add missing Ibiza-specific microservices
-- First, check if they already exist and only insert if not present

-- 1. Microcement Installation (Flooring Specialist)
INSERT INTO services_micro (category, subcategory, micro, priority_level, ibiza_specific)
SELECT 'Flooring Specialist', 'Modern Finishes', 'Microcement Installation', 'high', true
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro 
  WHERE category = 'Flooring Specialist' 
  AND subcategory = 'Modern Finishes'
  AND micro = 'Microcement Installation'
);

-- 2. Stone Wall Restoration (Builder - Masonry)
INSERT INTO services_micro (category, subcategory, micro, priority_level, ibiza_specific)
SELECT 'Builder', 'Masonry', 'Stone Wall Restoration', 'high', true
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro 
  WHERE category = 'Builder' 
  AND subcategory = 'Masonry'
  AND micro = 'Stone Wall Restoration'
);

-- 3. Glass Balustrades/Railings (Glazier)
INSERT INTO services_micro (category, subcategory, micro, priority_level, ibiza_specific)
SELECT 'Glazier', 'Safety Glass', 'Glass Balustrades', 'high', true
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro 
  WHERE category = 'Glazier' 
  AND subcategory = 'Safety Glass'
  AND micro = 'Glass Balustrades'
);

-- 4. Outdoor BBQ/Kitchen Build (Bricklayer/Mason)
INSERT INTO services_micro (category, subcategory, micro, priority_level, ibiza_specific)
SELECT 'Bricklayer/Mason', 'Outdoor Features', 'BBQ Kitchen Build', 'high', true
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro 
  WHERE category = 'Bricklayer/Mason' 
  AND subcategory = 'Outdoor Features'
  AND micro = 'BBQ Kitchen Build'
);

-- 5. Pool Equipment Installation (Plumber - Pool Services)
INSERT INTO services_micro (category, subcategory, micro, priority_level, ibiza_specific)
SELECT 'Plumber', 'Pool Services', 'Pool Equipment Installation', 'high', true
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro 
  WHERE category = 'Plumber' 
  AND subcategory = 'Pool Services'
  AND micro = 'Pool Equipment Installation'
);

-- Update existing high-priority microservices that should be marked as Ibiza-specific
UPDATE services_micro 
SET ibiza_specific = true, priority_level = 'high'
WHERE micro IN (
  'Pool Renovation',
  'Pool Maintenance', 
  'AC Unit Installation',
  'Outdoor Decking',
  'Terrace Waterproofing',
  'Salt Water System Installation'
) AND (ibiza_specific IS NOT true OR priority_level != 'high');