-- Add missing micro-services for new question packs
DO $$ 
BEGIN
  -- Restaurant and Bar Fit-Outs (retail-hospitality-leisure)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'restaurant-bar-fitouts'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      '6d0b564e-df4b-4dc9-bf7a-0e3baba94404',
      'Restaurant and Bar Fit-Outs',
      'restaurant-bar-fitouts',
      '2e46e360-29a0-4947-b9a3-c797e52812b3',
      NOW()
    );
  END IF;

  -- Retail Spaces (retail-hospitality-leisure)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'retail-spaces'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      '9f7d2e54-1e1d-497e-8f60-33c8c1705505',
      'Retail Spaces',
      'retail-spaces',
      '2e46e360-29a0-4947-b9a3-c797e52812b3',
      NOW()
    );
  END IF;

  -- Clean Rooms and Specialist Areas (industrial-warehouse-storage)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'clean-rooms-specialist-areas'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'b9dbe3f5-1f52-4bdc-a1ce-4e8c686a5901',
      'Clean Rooms and Specialist Areas',
      'clean-rooms-specialist-areas',
      '708fc9eb-a7df-4b9e-82ca-310fd88cb821',
      NOW()
    );
  END IF;

  -- Industrial Unit Refurbishments (industrial-warehouse-storage)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'industrial-unit-refurbishments'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'c0c8640b-20a1-4bca-8f5e-052b940b1802',
      'Industrial Unit Refurbishments',
      'industrial-unit-refurbishments',
      '708fc9eb-a7df-4b9e-82ca-310fd88cb821',
      NOW()
    );
  END IF;

  -- Racking and Storage Systems (industrial-warehouse-storage)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'racking-and-storage-systems'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      '1c4c8a8b-1e0b-4e09-8a98-4d2d0f2b7101',
      'Racking and Storage Systems',
      'racking-and-storage-systems',
      '708fc9eb-a7df-4b9e-82ca-310fd88cb821',
      NOW()
    );
  END IF;

  -- Warehouse Fit-Outs (industrial-warehouse-storage)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'warehouse-fit-outs'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'af6b11b5-3b2a-4c4d-8ce9-08b4b7519202',
      'Warehouse Fit-Outs',
      'warehouse-fit-outs',
      '708fc9eb-a7df-4b9e-82ca-310fd88cb821',
      NOW()
    );
  END IF;
END $$;

-- Insert question packs (same as before, already has correct structure)
DO $$ 
BEGIN
  -- 1. Restaurant and Bar Fit-Outs
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'restaurant-bar-fitouts' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'restaurant-bar-fitouts',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "6d0b564e-df4b-4dc9-bf7a-0e3baba94404",
        "category": "commercial-industrial",
        "subcategory": "retail-hospitality-leisure",
        "name": "Restaurant and Bar Fit-Outs",
        "slug": "restaurant-bar-fitouts",
        "i18nPrefix": "restaurant.bar",
        "questions": [
          {
            "key": "operation_style",
            "type": "single",
            "required": true,
            "i18nKey": "questions.operation_style.title",
            "aiHint": "Defines the core operating model of the venue.",
            "options": [
              {"value": "restaurant_led", "i18nKey": "questions.operation_style.options.restaurant_led", "order": 0},
              {"value": "bar_led_with_food", "i18nKey": "questions.operation_style.options.bar_led_with_food", "order": 1},
              {"value": "cocktail_bar_snacks_only", "i18nKey": "questions.operation_style.options.cocktail_bar_snacks_only", "order": 2}
            ]
          },
          {
            "key": "kitchen_requirement",
            "type": "single",
            "required": true,
            "i18nKey": "questions.kitchen_requirement.title",
            "aiHint": "Clarifies the level of kitchen fit-out required.",
            "options": [
              {"value": "light_prep_finish_kitchen", "i18nKey": "questions.kitchen_requirement.options.light_prep_finish_kitchen", "order": 0},
              {"value": "full_extraction_hot_kitchen", "i18nKey": "questions.kitchen_requirement.options.full_extraction_hot_kitchen", "order": 1},
              {"value": "bar_only_back_of_house", "i18nKey": "questions.kitchen_requirement.options.bar_only_back_of_house", "order": 2}
            ]
          },
          {
            "key": "bar_configuration",
            "type": "single",
            "required": true,
            "i18nKey": "questions.bar_configuration.title",
            "aiHint": "Defines layout and complexity of the bar area.",
            "options": [
              {"value": "single_straight_bar", "i18nKey": "questions.bar_configuration.options.single_straight_bar", "order": 0},
              {"value": "island_or_wrap_bar", "i18nKey": "questions.bar_configuration.options.island_or_wrap_bar", "order": 1},
              {"value": "multiple_service_points", "i18nKey": "questions.bar_configuration.options.multiple_service_points", "order": 2}
            ]
          },
          {
            "key": "seating_density",
            "type": "single",
            "required": false,
            "i18nKey": "questions.seating_density.title",
            "aiHint": "Shows whether the venue aims for turnover or spacious dining.",
            "options": [
              {"value": "high_density_max_covers", "i18nKey": "questions.seating_density.options.high_density_max_covers", "order": 0},
              {"value": "balanced_covers_and_space", "i18nKey": "questions.seating_density.options.balanced_covers_and_space", "order": 1},
              {"value": "spacious_premium_layout", "i18nKey": "questions.seating_density.options.spacious_premium_layout", "order": 2}
            ]
          },
          {
            "key": "design_tone",
            "type": "single",
            "required": false,
            "i18nKey": "questions.design_tone.title",
            "aiHint": "Gives a broad feel for the desired interior style.",
            "options": [
              {"value": "casual_everyday", "i18nKey": "questions.design_tone.options.casual_everyday", "order": 0},
              {"value": "contemporary_brasserie", "i18nKey": "questions.design_tone.options.contemporary_brasserie", "order": 1},
              {"value": "fine_dining_high_end", "i18nKey": "questions.design_tone.options.fine_dining_high_end", "order": 2}
            ]
          },
          {
            "key": "outdoor_areas",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.outdoor_areas.title",
            "aiHint": "Clarifies if external areas are part of the fit-out scope.",
            "options": [
              {"value": "terrace_seating", "i18nKey": "questions.outdoor_areas.options.terrace_seating", "order": 0},
              {"value": "roof_or_balcony", "i18nKey": "questions.outdoor_areas.options.roof_or_balcony", "order": 1},
              {"value": "street_frontage_only", "i18nKey": "questions.outdoor_areas.options.street_frontage_only", "order": 2},
              {"value": "no_outdoor_scope", "i18nKey": "questions.outdoor_areas.options.no_outdoor_scope", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 2. Retail Spaces
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'retail-spaces' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'retail-spaces',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "9f7d2e54-1e1d-497e-8f60-33c8c1705505",
        "category": "commercial-industrial",
        "subcategory": "retail-hospitality-leisure",
        "name": "Retail Spaces",
        "slug": "retail-spaces",
        "i18nPrefix": "retail.spaces",
        "questions": [
          {
            "key": "retail_category",
            "type": "single",
            "required": true,
            "i18nKey": "questions.retail_category.title",
            "aiHint": "Defines the type of retail operation.",
            "options": [
              {"value": "fashion", "i18nKey": "questions.retail_category.options.fashion", "order": 0},
              {"value": "technology_electronics", "i18nKey": "questions.retail_category.options.technology_electronics", "order": 1},
              {"value": "convenience_or_grocery", "i18nKey": "questions.retail_category.options.convenience_or_grocery", "order": 2},
              {"value": "home_lifestyle", "i18nKey": "questions.retail_category.options.home_lifestyle", "order": 3}
            ]
          },
          {
            "key": "fitout_focus",
            "type": "single",
            "required": true,
            "i18nKey": "questions.fitout_focus.title",
            "aiHint": "Shows if this is a full fit-out or partial refresh.",
            "options": [
              {"value": "full_new_fitout", "i18nKey": "questions.fitout_focus.options.full_new_fitout", "order": 0},
              {"value": "layout_change_and_refresh", "i18nKey": "questions.fitout_focus.options.layout_change_and_refresh", "order": 1},
              {"value": "fixtures_only_update", "i18nKey": "questions.fitout_focus.options.fixtures_only_update", "order": 2}
            ]
          },
          {
            "key": "merchandising_style",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.merchandising_style.title",
            "aiHint": "Identifies how products should be presented.",
            "options": [
              {"value": "wall_bays_shelving", "i18nKey": "questions.merchandising_style.options.wall_bays_shelving", "order": 0},
              {"value": "freestanding_gondolas", "i18nKey": "questions.merchandising_style.options.freestanding_gondolas", "order": 1},
              {"value": "central_feature_display", "i18nKey": "questions.merchandising_style.options.central_feature_display", "order": 2},
              {"value": "hanging_rails_or_systems", "i18nKey": "questions.merchandising_style.options.hanging_rails_or_systems", "order": 3}
            ]
          },
          {
            "key": "stock_storage_need",
            "type": "single",
            "required": false,
            "i18nKey": "questions.stock_storage_need.title",
            "aiHint": "Clarifies back-of-house vs on-floor storage priorities.",
            "options": [
              {"value": "minimal_storage_needed", "i18nKey": "questions.stock_storage_need.options.minimal_storage_needed", "order": 0},
              {"value": "back_of_house_stock_room", "i18nKey": "questions.stock_storage_need.options.back_of_house_stock_room", "order": 1},
              {"value": "on_floor_hidden_storage", "i18nKey": "questions.stock_storage_need.options.on_floor_hidden_storage", "order": 2}
            ]
          },
          {
            "key": "security_requirements",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.security_requirements.title",
            "aiHint": "Lists security features that may affect the fit-out.",
            "options": [
              {"value": "cctv_points", "i18nKey": "questions.security_requirements.options.cctv_points", "order": 0},
              {"value": "security_gates_or_rfid", "i18nKey": "questions.security_requirements.options.security_gates_or_rfid", "order": 1},
              {"value": "shutters_or_grilles", "i18nKey": "questions.security_requirements.options.shutters_or_grilles", "order": 2},
              {"value": "secure_display_cabinets", "i18nKey": "questions.security_requirements.options.secure_display_cabinets", "order": 3}
            ]
          },
          {
            "key": "overall_finish_target",
            "type": "single",
            "required": false,
            "i18nKey": "questions.overall_finish_target.title",
            "aiHint": "Sets expectations on finish standard.",
            "options": [
              {"value": "robust_value_retail", "i18nKey": "questions.overall_finish_target.options.robust_value_retail", "order": 0},
              {"value": "mid_market_high_street", "i18nKey": "questions.overall_finish_target.options.mid_market_high_street", "order": 1},
              {"value": "premium_flagship", "i18nKey": "questions.overall_finish_target.options.premium_flagship", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 3. Clean Rooms and Specialist Areas
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'clean-rooms-specialist-areas' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'clean-rooms-specialist-areas',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "b9dbe3f5-1f52-4bdc-a1ce-4e8c686a5901",
        "category": "commercial-industrial",
        "subcategory": "industrial-warehouse-storage",
        "name": "Clean Rooms and Specialist Areas",
        "slug": "clean-rooms-specialist-areas",
        "i18nPrefix": "cleanrooms.specialist",
        "questions": [
          {
            "key": "cleanroom_class",
            "type": "single",
            "required": true,
            "i18nKey": "questions.cleanroom_class.title",
            "aiHint": "Identifies required cleanroom grade to influence materials, HVAC and sealing requirements.",
            "options": [
              {"value": "iso_8_basic", "i18nKey": "questions.cleanroom_class.options.iso_8_basic", "order": 0},
              {"value": "iso_7_standard", "i18nKey": "questions.cleanroom_class.options.iso_7_standard", "order": 1},
              {"value": "iso_6_advanced", "i18nKey": "questions.cleanroom_class.options.iso_6_advanced", "order": 2},
              {"value": "iso_5_high_spec", "i18nKey": "questions.cleanroom_class.options.iso_5_high_spec", "order": 3},
              {"value": "not_sure_consult_required", "i18nKey": "questions.cleanroom_class.options.not_sure", "order": 4}
            ]
          },
          {
            "key": "industry_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.industry_type.title",
            "aiHint": "Defines the industry sector for compliance standards.",
            "options": [
              {"value": "pharmaceutical", "i18nKey": "questions.industry_type.options.pharmaceutical", "order": 0},
              {"value": "medical_device", "i18nKey": "questions.industry_type.options.medical_device", "order": 1},
              {"value": "food_processing", "i18nKey": "questions.industry_type.options.food_processing", "order": 2},
              {"value": "electronics_precision", "i18nKey": "questions.industry_type.options.electronics_precision", "order": 3},
              {"value": "research_laboratory", "i18nKey": "questions.industry_type.options.research_laboratory", "order": 4}
            ]
          },
          {
            "key": "hvac_requirements",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.hvac_requirements.title",
            "aiHint": "Describes specialised airflow and pressure control needs.",
            "options": [
              {"value": "hepa_filtration", "i18nKey": "questions.hvac_requirements.options.hepa_filtration", "order": 0},
              {"value": "positive_pressure", "i18nKey": "questions.hvac_requirements.options.positive_pressure", "order": 1},
              {"value": "negative_pressure", "i18nKey": "questions.hvac_requirements.options.negative_pressure", "order": 2},
              {"value": "humidity_control", "i18nKey": "questions.hvac_requirements.options.humidity_control", "order": 3}
            ]
          },
          {
            "key": "wall_ceiling_system",
            "type": "single",
            "required": true,
            "i18nKey": "questions.wall_ceiling_system.title",
            "aiHint": "Determines the construction system needed.",
            "options": [
              {"value": "insulated_panels", "i18nKey": "questions.wall_ceiling_system.options.insulated_panels", "order": 0},
              {"value": "cleanroom_grade_panels", "i18nKey": "questions.wall_ceiling_system.options.cleanroom_grade_panels", "order": 1},
              {"value": "flush_sealed_systems", "i18nKey": "questions.wall_ceiling_system.options.flush_sealed_systems", "order": 2}
            ]
          },
          {
            "key": "flooring_requirement",
            "type": "single",
            "required": true,
            "i18nKey": "questions.flooring_requirement.title",
            "aiHint": "Flooring type impacts contamination control and static management.",
            "options": [
              {"value": "epoxy_seamless", "i18nKey": "questions.flooring_requirement.options.epoxy_seamless", "order": 0},
              {"value": "vinyl_welded", "i18nKey": "questions.flooring_requirement.options.vinyl_welded", "order": 1},
              {"value": "anti_static_esd", "i18nKey": "questions.flooring_requirement.options.anti_static_esd", "order": 2}
            ]
          },
          {
            "key": "specialist_features",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.specialist_features.title",
            "aiHint": "Identifies additional specialist installations.",
            "options": [
              {"value": "airlocks_change_rooms", "i18nKey": "questions.specialist_features.options.airlocks_change_rooms", "order": 0},
              {"value": "pass_through_hatches", "i18nKey": "questions.specialist_features.options.pass_through_hatches", "order": 1},
              {"value": "uv_sterilisation", "i18nKey": "questions.specialist_features.options.uv_sterilisation", "order": 2},
              {"value": "cleanroom_furniture", "i18nKey": "questions.specialist_features.options.cleanroom_furniture", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 4. Industrial Unit Refurbishments
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'industrial-unit-refurbishments' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'industrial-unit-refurbishments',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "c0c8640b-20a1-4bca-8f5e-052b940b1802",
        "category": "commercial-industrial",
        "subcategory": "industrial-warehouse-storage",
        "name": "Industrial Unit Refurbishments",
        "slug": "industrial-unit-refurbishments",
        "i18nPrefix": "industrial.refurbishments",
        "questions": [
          {
            "key": "unit_usage",
            "type": "single",
            "required": true,
            "i18nKey": "questions.unit_usage.title",
            "aiHint": "Clarifies the type of industrial operation.",
            "options": [
              {"value": "storage_warehouse", "i18nKey": "questions.unit_usage.options.storage_warehouse", "order": 0},
              {"value": "manufacturing_workshop", "i18nKey": "questions.unit_usage.options.manufacturing_workshop", "order": 1},
              {"value": "distribution_logistics", "i18nKey": "questions.unit_usage.options.distribution_logistics", "order": 2},
              {"value": "mixed_use_industrial", "i18nKey": "questions.unit_usage.options.mixed_use_industrial", "order": 3}
            ]
          },
          {
            "key": "flooring_needs",
            "type": "single",
            "required": true,
            "i18nKey": "questions.flooring_needs.title",
            "aiHint": "Industrial flooring is critical for durability and load requirements.",
            "options": [
              {"value": "polished_concrete", "i18nKey": "questions.flooring_needs.options.polished_concrete", "order": 0},
              {"value": "epoxy_coating", "i18nKey": "questions.flooring_needs.options.epoxy_coating", "order": 1},
              {"value": "heavy_duty_resin", "i18nKey": "questions.flooring_needs.options.heavy_duty_resin", "order": 2}
            ]
          },
          {
            "key": "mezzanine_or_structural",
            "type": "single",
            "required": false,
            "i18nKey": "questions.mezzanine_or_structural.title",
            "aiHint": "Identifies any structural work such as mezzanines or load-bearing changes.",
            "options": [
              {"value": "mezzanine_installation", "i18nKey": "questions.mezzanine_or_structural.options.mezzanine_installation", "order": 0},
              {"value": "remove_or_modify_partitions", "i18nKey": "questions.mezzanine_or_structural.options.remove_or_modify_partitions", "order": 1},
              {"value": "no_structural_changes", "i18nKey": "questions.mezzanine_or_structural.options.no_structural_changes", "order": 2}
            ]
          },
          {
            "key": "industrial_systems",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.industrial_systems.title",
            "aiHint": "Identifies mechanical systems required for the unit.",
            "options": [
              {"value": "ventilation_extraction", "i18nKey": "questions.industrial_systems.options.ventilation_extraction", "order": 0},
              {"value": "three_phase_power", "i18nKey": "questions.industrial_systems.options.three_phase_power", "order": 1},
              {"value": "compressed_air_system", "i18nKey": "questions.industrial_systems.options.compressed_air_system", "order": 2},
              {"value": "dust_or_fume_control", "i18nKey": "questions.industrial_systems.options.dust_or_fume_control", "order": 3}
            ]
          },
          {
            "key": "loading_and_access",
            "type": "single",
            "required": true,
            "i18nKey": "questions.loading_and_access.title",
            "aiHint": "Describes operational flow for goods movement inside the unit.",
            "options": [
              {"value": "roller_shutter_loading", "i18nKey": "questions.loading_and_access.options.roller_shutter_loading", "order": 0},
              {"value": "loading_bay_dock", "i18nKey": "questions.loading_and_access.options.loading_bay_dock", "order": 1},
              {"value": "forklift_or_machinery_access", "i18nKey": "questions.loading_and_access.options.forklift_or_machinery_access", "order": 2}
            ]
          },
          {
            "key": "office_and_welfare",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.office_and_welfare.title",
            "aiHint": "Describes non-industrial spaces required in the unit.",
            "options": [
              {"value": "office_partitioning", "i18nKey": "questions.office_and_welfare.options.office_partitioning", "order": 0},
              {"value": "staff_kitchenette", "i18nKey": "questions.office_and_welfare.options.staff_kitchenette", "order": 1},
              {"value": "changing_shower_area", "i18nKey": "questions.office_and_welfare.options.changing_shower_area", "order": 2},
              {"value": "toilets_refurbishment", "i18nKey": "questions.office_and_welfare.options.toilets_refurbishment", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 5. Racking and Storage Systems
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'racking-and-storage-systems' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'racking-and-storage-systems',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "1c4c8a8b-1e0b-4e09-8a98-4d2d0f2b7101",
        "category": "commercial-industrial",
        "subcategory": "industrial-warehouse-storage",
        "name": "Racking and Storage Systems",
        "slug": "racking-and-storage-systems",
        "i18nPrefix": "racking.storage",
        "questions": [
          {
            "key": "operation_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.operation_type.title",
            "aiHint": "Defines the main warehouse operation which drives racking design.",
            "options": [
              {"value": "bulk_storage", "i18nKey": "questions.operation_type.options.bulk_storage", "order": 0},
              {"value": "palletised_storage", "i18nKey": "questions.operation_type.options.palletised_storage", "order": 1},
              {"value": "small_parts_picking", "i18nKey": "questions.operation_type.options.small_parts_picking", "order": 2},
              {"value": "mixed_use", "i18nKey": "questions.operation_type.options.mixed_use", "order": 3}
            ]
          },
          {
            "key": "racking_system_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.racking_system_type.title",
            "aiHint": "Identifies the preferred or required racking system.",
            "options": [
              {"value": "selective_pallet_racking", "i18nKey": "questions.racking_system_type.options.selective_pallet_racking", "order": 0},
              {"value": "drive_in_or_drive_through", "i18nKey": "questions.racking_system_type.options.drive_in_or_drive_through", "order": 1},
              {"value": "push_back_or_dynamic", "i18nKey": "questions.racking_system_type.options.push_back_or_dynamic", "order": 2},
              {"value": "longspan_shelving", "i18nKey": "questions.racking_system_type.options.longspan_shelving", "order": 3},
              {"value": "small_parts_shelving", "i18nKey": "questions.racking_system_type.options.small_parts_shelving", "order": 4}
            ]
          },
          {
            "key": "load_characteristics",
            "type": "single",
            "required": true,
            "i18nKey": "questions.load_characteristics.title",
            "aiHint": "Captures typical loads to help calculate duty rating.",
            "options": [
              {"value": "standard_euro_pallets", "i18nKey": "questions.load_characteristics.options.standard_euro_pallets", "order": 0},
              {"value": "heavy_pallets_or_machinery", "i18nKey": "questions.load_characteristics.options.heavy_pallets_or_machinery", "order": 1},
              {"value": "mixed_small_and_large_items", "i18nKey": "questions.load_characteristics.options.mixed_small_and_large_items", "order": 2}
            ]
          },
          {
            "key": "picking_method",
            "type": "single",
            "required": false,
            "i18nKey": "questions.picking_method.title",
            "aiHint": "Shows how stock will be accessed and picked.",
            "options": [
              {"value": "forklift_only", "i18nKey": "questions.picking_method.options.forklift_only", "order": 0},
              {"value": "manual_ground_level", "i18nKey": "questions.picking_method.options.manual_ground_level", "order": 1},
              {"value": "combination_truck_and_manual", "i18nKey": "questions.picking_method.options.combination_truck_and_manual", "order": 2}
            ]
          },
          {
            "key": "adjustability_priority",
            "type": "single",
            "required": false,
            "i18nKey": "questions.adjustability_priority.title",
            "aiHint": "Clarifies how important future reconfiguration is.",
            "options": [
              {"value": "highly_adjustable_reconfigurable", "i18nKey": "questions.adjustability_priority.options.highly_adjustable_reconfigurable", "order": 0},
              {"value": "semi_fixed_with_some_adjustment", "i18nKey": "questions.adjustability_priority.options.semi_fixed_with_some_adjustment", "order": 1},
              {"value": "fixed_long_term_layout", "i18nKey": "questions.adjustability_priority.options.fixed_long_term_layout", "order": 2}
            ]
          },
          {
            "key": "safety_and_compliance",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.safety_and_compliance.title",
            "aiHint": "Highlights safety features that need to be included.",
            "options": [
              {"value": "rack_protection_and_barriers", "i18nKey": "questions.safety_and_compliance.options.rack_protection_and_barriers", "order": 0},
              {"value": "load_signage_and_labelling", "i18nKey": "questions.safety_and_compliance.options.load_signage_and_labelling", "order": 1},
              {"value": "anti_collapse_mesh", "i18nKey": "questions.safety_and_compliance.options.anti_collapse_mesh", "order": 2},
              {"value": "walkway_guardrails", "i18nKey": "questions.safety_and_compliance.options.walkway_guardrails", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 6. Warehouse Fit-Outs
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'warehouse-fit-outs' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'warehouse-fit-outs',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "af6b11b5-3b2a-4c4d-8ce9-08b4b7519202",
        "category": "commercial-industrial",
        "subcategory": "industrial-warehouse-storage",
        "name": "Warehouse Fit-Outs",
        "slug": "warehouse-fit-outs",
        "i18nPrefix": "warehouse.fitouts",
        "questions": [
          {
            "key": "warehouse_profile",
            "type": "single",
            "required": true,
            "i18nKey": "questions.warehouse_profile.title",
            "aiHint": "Defines the overall role of the warehouse.",
            "options": [
              {"value": "pure_storage", "i18nKey": "questions.warehouse_profile.options.pure_storage", "order": 0},
              {"value": "logistics_and_distribution_hub", "i18nKey": "questions.warehouse_profile.options.logistics_and_distribution_hub", "order": 1},
              {"value": "light_production_and_storage", "i18nKey": "questions.warehouse_profile.options.light_production_and_storage", "order": 2},
              {"value": "ecommerce_fulfilment", "i18nKey": "questions.warehouse_profile.options.ecommerce_fulfilment", "order": 3}
            ]
          },
          {
            "key": "temperature_environment",
            "type": "single",
            "required": true,
            "i18nKey": "questions.temperature_environment.title",
            "aiHint": "Indicates if the fit-out must support specialised temperature conditions.",
            "options": [
              {"value": "ambient_only", "i18nKey": "questions.temperature_environment.options.ambient_only", "order": 0},
              {"value": "chilled_or_cool_store", "i18nKey": "questions.temperature_environment.options.chilled_or_cool_store", "order": 1},
              {"value": "frozen_or_low_temp", "i18nKey": "questions.temperature_environment.options.frozen_or_low_temp", "order": 2},
              {"value": "mixed_zones", "i18nKey": "questions.temperature_environment.options.mixed_zones", "order": 3}
            ]
          },
          {
            "key": "fitout_focus_areas",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.fitout_focus_areas.title",
            "aiHint": "Identifies the main components of the warehouse fit-out.",
            "options": [
              {"value": "racking_and_storage", "i18nKey": "questions.fitout_focus_areas.options.racking_and_storage", "order": 0},
              {"value": "goods_in_out_zones", "i18nKey": "questions.fitout_focus_areas.options.goods_in_out_zones", "order": 1},
              {"value": "internal_offices", "i18nKey": "questions.fitout_focus_areas.options.internal_offices", "order": 2},
              {"value": "staff_welfare_areas", "i18nKey": "questions.fitout_focus_areas.options.staff_welfare_areas", "order": 3},
              {"value": "pick_pack_areas", "i18nKey": "questions.fitout_focus_areas.options.pick_pack_areas", "order": 4}
            ]
          },
          {
            "key": "floor_and_markings",
            "type": "single",
            "required": false,
            "i18nKey": "questions.floor_and_markings.title",
            "aiHint": "Describes expectations for warehouse flooring and line marking.",
            "options": [
              {"value": "basic_repair_and_clean", "i18nKey": "questions.floor_and_markings.options.basic_repair_and_clean", "order": 0},
              {"value": "resin_or_epoxy_finish", "i18nKey": "questions.floor_and_markings.options.resin_or_epoxy_finish", "order": 1},
              {"value": "full_line_marking_and_zoning", "i18nKey": "questions.floor_and_markings.options.full_line_marking_and_zoning", "order": 2}
            ]
          },
          {
            "key": "material_handling_equip",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.material_handling_equip.title",
            "aiHint": "Clarifies equipment that the layout must support.",
            "options": [
              {"value": "forklifts_or_reach_trucks", "i18nKey": "questions.material_handling_equip.options.forklifts_or_reach_trucks", "order": 0},
              {"value": "pallet_trucks_trolleys", "i18nKey": "questions.material_handling_equip.options.pallet_trucks_trolleys", "order": 1},
              {"value": "conveyor_systems", "i18nKey": "questions.material_handling_equip.options.conveyor_systems", "order": 2},
              {"value": "automated_storage_systems", "i18nKey": "questions.material_handling_equip.options.automated_storage_systems", "order": 3}
            ]
          },
          {
            "key": "office_and_welfare_integration",
            "type": "single",
            "required": false,
            "i18nKey": "questions.office_and_welfare_integration.title",
            "aiHint": "Explains how much office and welfare provision is part of the fit-out.",
            "options": [
              {"value": "minimal_basic_facilities", "i18nKey": "questions.office_and_welfare_integration.options.minimal_basic_facilities", "order": 0},
              {"value": "standard_offices_and_welfare", "i18nKey": "questions.office_and_welfare_integration.options.standard_offices_and_welfare", "order": 1},
              {"value": "expanded_office_block_and_welfare", "i18nKey": "questions.office_and_welfare_integration.options.expanded_office_block_and_welfare", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;
END $$;