-- Construction Consolidation: Restore Clean Friday Format

-- Step 1: Update existing Roofing subcategory to be the clean version
UPDATE service_subcategories
SET is_active = true, slug = 'roofing', display_order = 5
WHERE id = 'b10417a0-4978-463f-b0ec-b5017278a246';

-- Step 2: Create 5 clean roofing micro-services (deduplicating)
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active)
VALUES 
  ('b10417a0-4978-463f-b0ec-b5017278a246', 'Roof repairs', 'roof-repairs', 1, true),
  ('b10417a0-4978-463f-b0ec-b5017278a246', 'New roof installation', 'new-roof-installation', 2, true),
  ('b10417a0-4978-463f-b0ec-b5017278a246', 'Flat roofs', 'flat-roofs', 3, true),
  ('b10417a0-4978-463f-b0ec-b5017278a246', 'Waterproofing', 'roof-waterproofing', 4, true),
  ('b10417a0-4978-463f-b0ec-b5017278a246', 'Guttering & drainage', 'guttering-drainage', 5, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE 
SET is_active = true, display_order = EXCLUDED.display_order;

-- Step 3: Migrate 2 General Construction micros to Structural Repairs
UPDATE service_micro_categories 
SET subcategory_id = '718f5af4-7c1c-4911-ae10-91035a907a0a'
WHERE id IN (
  '1e2d1237-c5db-4a76-af6f-028b89ed9072',
  '21f06d0d-f618-4b97-ac4f-24b6e32f7953'
);

-- Step 4: Deactivate 5 old messy subcategories (keeping Roofing active)
UPDATE service_subcategories
SET is_active = false
WHERE id IN (
  '6c48d37c-0b6a-493f-ae95-ecc7e799c508',
  '73c9ce52-52eb-4890-b3b5-4212b2889dff',
  'fa07f0b0-798d-4ea7-82c2-48595ae62d82',
  '31bbe9f1-1c06-47d7-bfbf-9047847f213e',
  '1163ef66-f071-4d02-8d67-21e4d7d13094'
);