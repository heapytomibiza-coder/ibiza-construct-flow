-- Add missing Carpenter subcategories and micro services
DO $$
DECLARE
  v_carpenter_id uuid := '53170449-ad8d-44f1-8dd3-ae37da26155a';
  v_builder_id uuid := '18839158-5b86-440f-9f67-87ec22227554';
  v_demolition_id uuid := 'e9b598ac-d907-4900-8e71-82e017a497d7';
  v_structural_id uuid := 'e1085f0b-b798-48ea-9484-1f84a2ef24ad';
  
  v_carpentry_joinery_id uuid;
  v_bespoke_joinery_id uuid;
  v_outdoor_woodwork_id uuid;
  v_staircases_railings_id uuid;
  v_sanding_finishing_id uuid;
  v_foundation_groundworks_id uuid;
  v_concrete_masonry_id uuid;
  v_steelwork_id uuid;
  v_demo_clearance_id uuid;
  v_advanced_construction_id uuid;
BEGIN
  
  -- Carpentry & Joinery
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_carpenter_id, 'Carpentry & Joinery', 'carpentry-joinery', 'General carpentry and joinery work', 7, true)
  RETURNING id INTO v_carpentry_joinery_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_carpentry_joinery_id, 'Door Hanging & Fitting (Internal/External)', 'door-hanging-fitting', 10, true),
    (v_carpentry_joinery_id, 'Window Boards & Trims', 'window-boards-trims', 20, true),
    (v_carpentry_joinery_id, 'Wall Panelling & Feature Cladding', 'wall-panelling-feature-cladding', 30, true),
    (v_carpentry_joinery_id, 'Ceiling Beams & Details', 'ceiling-beams-details', 40, true),
    (v_carpentry_joinery_id, 'Skirting Boards & Architraves', 'skirting-boards-architraves', 50, true);

  -- Bespoke Joinery
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_carpenter_id, 'Bespoke Joinery', 'bespoke-joinery', 'Custom-built furniture and fitted joinery', 8, true)
  RETURNING id INTO v_bespoke_joinery_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_bespoke_joinery_id, 'Built-In Wardrobes & Storage', 'built-in-wardrobes-storage', 10, true),
    (v_bespoke_joinery_id, 'Bar, Counter & Reception Builds', 'bar-counter-reception-builds', 20, true),
    (v_bespoke_joinery_id, 'Media Walls & Entertainment Units', 'media-walls-entertainment-units', 30, true),
    (v_bespoke_joinery_id, 'Floating Shelves & Bookcases', 'floating-shelves-bookcases', 40, true);

  -- Outdoor Woodwork
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_carpenter_id, 'Outdoor Woodwork', 'outdoor-woodwork', 'External timber structures and garden woodwork', 9, true)
  RETURNING id INTO v_outdoor_woodwork_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_outdoor_woodwork_id, 'Garden Rooms & Sheds', 'garden-rooms-sheds', 10, true),
    (v_outdoor_woodwork_id, 'Timber Fencing & Gates', 'timber-fencing-gates', 20, true),
    (v_outdoor_woodwork_id, 'Outdoor Kitchens & Seating Areas', 'outdoor-kitchens-seating-areas', 30, true);

  -- Staircases & Railings
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_carpenter_id, 'Staircases & Railings', 'staircases-railings', 'Staircase design, fabrication and railing installation', 10, true)
  RETURNING id INTO v_staircases_railings_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_staircases_railings_id, 'Timber Stair Design & Fabrication', 'timber-stair-design-fabrication', 10, true),
    (v_staircases_railings_id, 'Handrails & Balustrades', 'handrails-balustrades', 20, true),
    (v_staircases_railings_id, 'Floating & Feature Stairs', 'floating-feature-stairs', 30, true),
    (v_staircases_railings_id, 'Stair Restoration & Refinishing', 'stair-restoration-refinishing', 40, true);

  -- Sanding, Finishing & Restoration
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_carpenter_id, 'Sanding, Finishing & Restoration', 'sanding-finishing-restoration', 'Floor sanding, wood finishing and restoration', 11, true)
  RETURNING id INTO v_sanding_finishing_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_sanding_finishing_id, 'Floor Sanding & Polishing', 'floor-sanding-polishing', 10, true),
    (v_sanding_finishing_id, 'Varnish, Oil & Lacquer Finishes', 'varnish-oil-lacquer-finishes', 20, true);

  -- Now add Builder subcategories
  -- Foundation & Groundworks
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_builder_id, 'Foundation & Groundworks', 'foundation-groundworks', 'Site preparation, excavation, drainage and groundwork services', 10, true)
  RETURNING id INTO v_foundation_groundworks_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_foundation_groundworks_id, 'Site Clearance & Vegetation Removal', 'site-clearance-vegetation-removal', 10, true),
    (v_foundation_groundworks_id, 'Excavation & Earthworks', 'excavation-earthworks', 20, true),
    (v_foundation_groundworks_id, 'Drainage Systems & Soakaways', 'drainage-systems-soakaways', 30, true),
    (v_foundation_groundworks_id, 'Retaining Walls & Terracing', 'retaining-walls-terracing', 40, true),
    (v_foundation_groundworks_id, 'Land Leveling & Grading', 'land-leveling-grading', 50, true),
    (v_foundation_groundworks_id, 'Utility Trenches & Ducting', 'utility-trenches-ducting', 60, true);

  -- Advanced Construction
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_builder_id, 'Advanced Construction', 'advanced-construction', 'Complex structural modifications and conversions', 20, true)
  RETURNING id INTO v_advanced_construction_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_advanced_construction_id, 'Load-Bearing Structural Modifications', 'load-bearing-structural-modifications', 10, true),
    (v_advanced_construction_id, 'Building Extensions & Annexes', 'building-extensions-annexes', 20, true),
    (v_advanced_construction_id, 'Loft Conversions', 'loft-conversions', 30, true),
    (v_advanced_construction_id, 'Basement Conversions & Tanking', 'basement-conversions-tanking', 40, true),
    (v_advanced_construction_id, 'Underpinning & Foundation Repairs', 'underpinning-foundation-repairs', 50, true),
    (v_advanced_construction_id, 'Structural Crack Repairs', 'structural-crack-repairs', 60, true),
    (v_advanced_construction_id, 'Building Envelope Upgrades', 'building-envelope-upgrades', 70, true);

  -- Structural Works subcategories
  -- Concrete & Masonry
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_structural_id, 'Concrete & Masonry', 'concrete-masonry', 'Concrete work, masonry and structural blockwork', 20, true)
  RETURNING id INTO v_concrete_masonry_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_concrete_masonry_id, 'Foundation Pouring & Casting', 'foundation-pouring-casting', 10, true),
    (v_concrete_masonry_id, 'Slab Construction (Ground-Bearing, Suspended)', 'slab-construction', 20, true),
    (v_concrete_masonry_id, 'Blockwork & Masonry Walls', 'blockwork-masonry-walls', 30, true),
    (v_concrete_masonry_id, 'Concrete Repairs & Reinforcement', 'concrete-repairs-reinforcement', 40, true),
    (v_concrete_masonry_id, 'Decorative Concrete & Polished Floors', 'decorative-concrete-polished-floors', 50, true);

  -- Steelwork & Reinforcements
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_structural_id, 'Steelwork & Reinforcements', 'steelwork-reinforcements', 'Structural steel, metalwork and reinforcement services', 30, true)
  RETURNING id INTO v_steelwork_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_steelwork_id, 'Structural Steel Frame Erection', 'structural-steel-frame-erection', 10, true),
    (v_steelwork_id, 'Steel Beam & Column Installation', 'steel-beam-column-installation', 20, true),
    (v_steelwork_id, 'Rebar Fixing & Mesh Installation', 'rebar-fixing-mesh-installation', 30, true),
    (v_steelwork_id, 'Steel Staircases & Platforms', 'steel-staircases-platforms', 40, true),
    (v_steelwork_id, 'Metal Fabrication & Welding', 'metal-fabrication-welding', 50, true),
    (v_steelwork_id, 'Balconies & Mezzanines', 'balconies-mezzanines', 60, true),
    (v_steelwork_id, 'Steel Reinforcement for Seismic Upgrades', 'steel-reinforcement-seismic-upgrades', 70, true);

  -- Demolition subcategory
  INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_demolition_id, 'Demolition & Site Clearance', 'demolition-site-clearance', 'Building demolition, strip-out and site clearance', 10, true)
  RETURNING id INTO v_demo_clearance_id;
  
  INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
    (v_demo_clearance_id, 'Controlled Building Demolition', 'controlled-building-demolition', 10, true),
    (v_demo_clearance_id, 'Interior Strip-Out & Removal', 'interior-strip-out-removal', 20, true),
    (v_demo_clearance_id, 'Concrete Breaking & Removal', 'concrete-breaking-removal', 30, true),
    (v_demo_clearance_id, 'Asbestos Surveys & Removal', 'asbestos-surveys-removal', 40, true),
    (v_demo_clearance_id, 'Site Waste Management', 'site-waste-management', 50, true),
    (v_demo_clearance_id, 'Recycling & Material Recovery', 'recycling-material-recovery', 60, true);

  RAISE NOTICE 'Successfully added 10 subcategories and 49 micro services';
END $$;