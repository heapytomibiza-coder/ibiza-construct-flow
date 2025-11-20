
-- Create Carpentry as a main category
INSERT INTO service_categories (name, slug, description, icon_name, icon_emoji, category_group, display_order, is_active)
VALUES (
  'Carpentry',
  'carpentry',
  'Custom woodwork, furniture, doors, decking, and joinery',
  'Hammer',
  '🔨',
  'STRUCTURAL',
  2, -- Place after Construction
  true
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  icon_emoji = EXCLUDED.icon_emoji,
  category_group = EXCLUDED.category_group,
  display_order = EXCLUDED.display_order;

-- Get the new Carpentry category ID
DO $$
DECLARE
  v_carpentry_category_id uuid;
  v_old_carpentry_subcategory_id uuid;
BEGIN
  -- Get the new main category ID
  SELECT id INTO v_carpentry_category_id
  FROM service_categories
  WHERE slug = 'carpentry';

  -- Get the old subcategory ID
  SELECT id INTO v_old_carpentry_subcategory_id
  FROM service_subcategories
  WHERE slug = 'carpentry';

  -- Create subcategories under the new Carpentry main category
  INSERT INTO service_subcategories (category_id, name, slug, description, icon_name, icon_emoji, display_order, is_active)
  VALUES 
    (v_carpentry_category_id, 'Custom Furniture', 'custom-furniture', 'Built-in wardrobes, shelving, custom tables and chairs', NULL, '🪑', 1, true),
    (v_carpentry_category_id, 'Doors & Windows', 'doors-windows', 'Door hanging, window frames, door frames', NULL, '🚪', 2, true),
    (v_carpentry_category_id, 'Decking & Outdoor', 'decking-outdoor', 'Timber decking, pergolas, outdoor structures', NULL, '🏡', 3, true),
    (v_carpentry_category_id, 'General Joinery', 'general-joinery', 'Skirting, architraves, trim work, repairs', NULL, '🔨', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Move micro-categories from old carpentry subcategory to new General Joinery subcategory
  UPDATE service_micro_categories
  SET subcategory_id = (
    SELECT id FROM service_subcategories 
    WHERE category_id = v_carpentry_category_id 
    AND slug = 'general-joinery'
  )
  WHERE subcategory_id = v_old_carpentry_subcategory_id;

  -- Delete the old carpentry subcategory from Construction
  DELETE FROM service_subcategories WHERE id = v_old_carpentry_subcategory_id;
END $$;

-- Adjust display orders for other categories to make room
UPDATE service_categories 
SET display_order = display_order + 1
WHERE display_order >= 2 
  AND slug != 'carpentry'
  AND slug != 'construction';
