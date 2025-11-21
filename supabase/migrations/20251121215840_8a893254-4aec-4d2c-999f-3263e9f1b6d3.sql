-- Seed Demo Service Items for Professional Showcase
-- This script creates 15 realistic service items covering multiple trades

DO $$
DECLARE
  v_prof_id UUID := 'dcdbb8b5-0808-42ef-a466-163e4bb70a5e';
BEGIN
  -- Plumbing Services (4 items)
  
  -- 1. Emergency Leak Repair
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id, 
    (SELECT id FROM service_micro_categories WHERE slug = 'water-heater-installation' LIMIT 1),
    'Emergency Leak Repair',
    'Fast response for urgent plumbing leaks. Same-day service available. Includes leak detection, pipe repair, and water damage prevention.',
    'fixed',
    120.00,
    120,
    'Plumbing',
    'Repairs',
    'intermediate',
    true
  );

  -- 2. Water Heater Installation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    bulk_discount_threshold, bulk_discount_price,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'water-heater-installation' LIMIT 1),
    'Water Heater Installation',
    'Professional installation of electric or gas water heaters. Includes removal of old unit, installation, testing, and 1-year warranty.',
    'per_unit',
    450.00,
    240,
    2,
    405.00,
    'Plumbing',
    'Installation',
    'advanced',
    true
  );

  -- 3. Bathroom Fixture Installation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'dishwasher-installation' LIMIT 1),
    'Bathroom Fixture Installation',
    'Install sinks, faucets, toilets, showers, and bathtubs. Expert plumbing work with attention to detail and clean finish.',
    'hourly',
    65.00,
    180,
    'Plumbing',
    'Installation',
    'intermediate',
    true
  );

  -- 4. Drain Cleaning & Unclogging
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'washing-machine-installation' LIMIT 1),
    'Drain Cleaning & Unclogging',
    'Professional drain clearing using modern equipment. Kitchen sinks, bathroom drains, and outdoor drains. Same-day service.',
    'fixed',
    95.00,
    60,
    'Plumbing',
    'Maintenance',
    'beginner',
    true
  );

  -- Electrical Services (3 items)
  
  -- 5. Light Fixture Installation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, unit_type, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'outlet-installation' LIMIT 1),
    'Light Fixture Installation',
    'Install ceiling lights, pendant lights, chandeliers, and wall sconces. Includes wiring, mounting, and testing.',
    'per_unit',
    45.00,
    'fixture',
    30,
    'Electrical',
    'Installation',
    'intermediate',
    true
  );

  -- 6. Outlet & Switch Repair
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'switch-repair' LIMIT 1),
    'Outlet & Switch Repair',
    'Fix faulty outlets and switches. Safety inspection included. Replace damaged components and ensure proper grounding.',
    'fixed',
    75.00,
    60,
    'Electrical',
    'Repairs',
    'beginner',
    true
  );

  -- 7. Complete Home Rewiring
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'outlet-installation' LIMIT 1),
    'Complete Home Rewiring',
    'Full electrical system upgrade for older homes. New wiring, circuit breakers, outlets, and safety certification.',
    'hourly',
    85.00,
    2400,
    'Electrical',
    'Installation',
    'advanced',
    true
  );

  -- Carpentry Services (3 items)
  
  -- 8. Custom Cabinet Installation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, unit_type, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'cabinet-installation' LIMIT 1),
    'Custom Cabinet Installation',
    'Professional installation of kitchen and bathroom cabinets. Precise measurements, secure mounting, and perfect alignment guaranteed.',
    'per_unit',
    850.00,
    'set',
    360,
    'Carpentry',
    'Installation',
    'advanced',
    true
  );

  -- 9. Door Frame Repair
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'door-frame-replacement' LIMIT 1),
    'Door Frame Repair & Replacement',
    'Fix damaged door frames, replace rotten wood, and restore structural integrity. Includes painting and finishing.',
    'fixed',
    180.00,
    120,
    'Carpentry',
    'Repairs',
    'intermediate',
    true
  );

  -- 10. Deck Building & Repair
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, unit_type, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'deck-construction' LIMIT 1),
    'Deck Building & Repair',
    'Build new decks or repair existing ones. Quality materials, proper drainage, and weather-resistant finishes.',
    'per_square_meter',
    95.00,
    'sqm',
    960,
    'Carpentry',
    'Construction',
    'advanced',
    true
  );

  -- Renovation Services (3 items)
  
  -- 11. Kitchen Renovation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'custom-cabinetry' LIMIT 1),
    'Complete Kitchen Renovation',
    'Full kitchen transformation: new cabinets, countertops, appliances, plumbing, electrical, and flooring. Turnkey solution.',
    'project',
    8500.00,
    4800,
    'Renovation',
    'Kitchen',
    'advanced',
    true
  );

  -- 12. Bathroom Remodeling
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'custom-cabinetry' LIMIT 1),
    'Bathroom Remodeling',
    'Complete bathroom renovation including tiling, fixtures, plumbing, lighting, and ventilation. Modern designs with quality materials.',
    'project',
    5200.00,
    2400,
    'Renovation',
    'Bathroom',
    'advanced',
    true
  );

  -- 13. Interior Painting
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, unit_type, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'shelving-storage-units' LIMIT 1),
    'Professional Interior Painting',
    'Room painting with premium paints. Includes wall preparation, two coats, trim work, and furniture protection.',
    'per_room',
    280.00,
    'room',
    480,
    'Painting',
    'Interior',
    'intermediate',
    true
  );

  -- Masonry Services (2 items)
  
  -- 14. Brick Wall Repair
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'deck-repair' LIMIT 1),
    'Brick Wall Repair & Restoration',
    'Expert brickwork repair: repointing, crack repair, brick replacement, and waterproofing. Restore structural integrity.',
    'hourly',
    70.00,
    300,
    'Masonry',
    'Repairs',
    'advanced',
    true
  );

  -- 15. Concrete Driveway Installation
  INSERT INTO professional_service_items (
    professional_id, service_id, name, description, 
    pricing_type, base_price, unit_type, estimated_duration_minutes,
    category, subcategory, difficulty_level, is_active
  ) VALUES (
    v_prof_id,
    (SELECT id FROM service_micro_categories WHERE slug = 'deck-construction' LIMIT 1),
    'Concrete Driveway Installation',
    'Professional concrete driveway installation with proper base preparation, reinforcement, and finishing. Durable and long-lasting.',
    'per_square_meter',
    110.00,
    'sqm',
    1440,
    'Masonry',
    'Construction',
    'advanced',
    true
  );

  RAISE NOTICE '✅ Successfully seeded 15 demo service items for professional %', v_prof_id;
  
END $$;