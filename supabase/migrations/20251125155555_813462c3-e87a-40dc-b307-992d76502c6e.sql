-- Add missing micro-services for new question packs
DO $$ 
BEGIN
  -- Partitioning & Layout Changes
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'partitioning-layout-changes'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      gen_random_uuid(),
      'Partitioning & Layout Changes',
      'partitioning-layout-changes',
      'commercial-industrial',
      'building-services-compliance',
      NOW()
    );
  END IF;

  -- Signage & Wayfinding
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'signage-wayfinding'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      gen_random_uuid(),
      'Signage & Wayfinding',
      'signage-wayfinding',
      'commercial-industrial',
      'building-services-compliance',
      NOW()
    );
  END IF;

  -- Café and Takeaway Refurbishments
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'cafe-takeaway-refurbishments'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      '8a5e4ca3-5a3c-4a7a-9b56-9e4e1f5b1101',
      'Café and Takeaway Refurbishments',
      'cafe-takeaway-refurbishments',
      'commercial-industrial',
      'retail-hospitality-leisure',
      NOW()
    );
  END IF;

  -- Clubs and Venue Fit-Outs
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'clubs-venue-fitouts'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      'f41debc0-3f4f-4c75-9c0d-4e1e7e0e2202',
      'Clubs and Venue Fit-Outs',
      'clubs-venue-fitouts',
      'commercial-industrial',
      'retail-hospitality-leisure',
      NOW()
    );
  END IF;

  -- Pop-Up and Temporary Shops
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'popup-temporary-shops'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      '3c2f0ed6-3513-4b8d-8f3a-41f1b3d53303',
      'Pop-Up and Temporary Shops',
      'popup-temporary-shops',
      'commercial-industrial',
      'retail-hospitality-leisure',
      NOW()
    );
  END IF;
END $$;

-- Insert question packs
DO $$ 
BEGIN
  -- 1. Partitioning & Layout Changes
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'partitioning-layout-changes' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'partitioning-layout-changes',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "' || gen_random_uuid() || '",
        "category": "commercial-industrial",
        "subcategory": "building-services-compliance",
        "name": "Partitioning & Layout Changes",
        "slug": "partitioning-layout-changes",
        "i18nPrefix": "partitioning.layout",
        "questions": [
          {
            "key": "partition_goal",
            "type": "single",
            "required": true,
            "i18nKey": "questions.partition_goal.title",
            "aiHint": "Defines the main purpose of the layout change.",
            "options": [
              {"value": "create_new_rooms", "i18nKey": "questions.partition_goal.options.create_new_rooms", "order": 0},
              {"value": "open_plan_conversion", "i18nKey": "questions.partition_goal.options.open_plan_conversion", "order": 1},
              {"value": "privacy_separation", "i18nKey": "questions.partition_goal.options.privacy_separation", "order": 2},
              {"value": "workflow_optimization", "i18nKey": "questions.partition_goal.options.workflow_optimization", "order": 3}
            ]
          },
          {
            "key": "partition_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.partition_type.title",
            "aiHint": "Identifies the construction type of the requested partitions.",
            "options": [
              {"value": "drywall", "i18nKey": "questions.partition_type.options.drywall", "order": 0},
              {"value": "glass", "i18nKey": "questions.partition_type.options.glass", "order": 1},
              {"value": "acoustic", "i18nKey": "questions.partition_type.options.acoustic", "order": 2},
              {"value": "temporary_modular", "i18nKey": "questions.partition_type.options.temporary_modular", "order": 3}
            ]
          },
          {
            "key": "structural_involvement",
            "type": "single",
            "required": true,
            "i18nKey": "questions.structural_involvement.title",
            "aiHint": "Determines whether structural walls are involved in the changes.",
            "options": [
              {"value": "non_structural_only", "i18nKey": "questions.structural_involvement.options.non_structural_only", "order": 0},
              {"value": "structural_walls_involved", "i18nKey": "questions.structural_involvement.options.structural_walls_involved", "order": 1},
              {"value": "not_sure", "i18nKey": "questions.structural_involvement.options.not_sure", "order": 2}
            ]
          },
          {
            "key": "electrical_considerations",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.electrical_considerations.title",
            "aiHint": "Identifies electrical or systems rerouting needed.",
            "options": [
              {"value": "power_outlets", "i18nKey": "questions.electrical_considerations.options.power_outlets", "order": 0},
              {"value": "lighting_changes", "i18nKey": "questions.electrical_considerations.options.lighting_changes", "order": 1},
              {"value": "data_cabling", "i18nKey": "questions.electrical_considerations.options.data_cabling", "order": 2},
              {"value": "none", "i18nKey": "questions.electrical_considerations.options.none", "order": 3}
            ]
          },
          {
            "key": "sound_privacy",
            "type": "single",
            "required": false,
            "i18nKey": "questions.sound_privacy.title",
            "aiHint": "Determines whether partitions need acoustic performance.",
            "options": [
              {"value": "standard", "i18nKey": "questions.sound_privacy.options.standard", "order": 0},
              {"value": "enhanced_acoustic", "i18nKey": "questions.sound_privacy.options.enhanced", "order": 1},
              {"value": "not_applicable", "i18nKey": "questions.sound_privacy.options.not_applicable", "order": 2}
            ]
          },
          {
            "key": "finish_quality",
            "type": "single",
            "required": false,
            "i18nKey": "questions.finish_quality.title",
            "aiHint": "Helps determine material and finishing expectations.",
            "options": [
              {"value": "standard_commercial", "i18nKey": "questions.finish_quality.options.standard", "order": 0},
              {"value": "premium_corporate", "i18nKey": "questions.finish_quality.options.premium", "order": 1},
              {"value": "industrial_basic", "i18nKey": "questions.finish_quality.options.industrial", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 2. Signage & Wayfinding
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'signage-wayfinding' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'signage-wayfinding',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "' || gen_random_uuid() || '",
        "category": "commercial-industrial",
        "subcategory": "building-services-compliance",
        "name": "Signage & Wayfinding",
        "slug": "signage-wayfinding",
        "i18nPrefix": "signage.wayfinding",
        "questions": [
          {
            "key": "signage_purpose",
            "type": "single",
            "required": true,
            "i18nKey": "questions.signage_purpose.title",
            "aiHint": "Clarifies what type of signage the client needs.",
            "options": [
              {"value": "directional", "i18nKey": "questions.signage_purpose.options.directional", "order": 0},
              {"value": "safety_compliance", "i18nKey": "questions.signage_purpose.options.safety", "order": 1},
              {"value": "branding_visual", "i18nKey": "questions.signage_purpose.options.branding", "order": 2},
              {"value": "mixed", "i18nKey": "questions.signage_purpose.options.mixed", "order": 3}
            ]
          },
          {
            "key": "installation_area",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.installation_area.title",
            "aiHint": "Identifies key building areas affected.",
            "options": [
              {"value": "entrance", "i18nKey": "questions.installation_area.options.entrance", "order": 0},
              {"value": "corridors", "i18nKey": "questions.installation_area.options.corridors", "order": 1},
              {"value": "toilets", "i18nKey": "questions.installation_area.options.toilets", "order": 2},
              {"value": "emergency_routes", "i18nKey": "questions.installation_area.options.emergency_routes", "order": 3},
              {"value": "outdoor", "i18nKey": "questions.installation_area.options.outdoor", "order": 4}
            ]
          },
          {
            "key": "signage_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.signage_type.title",
            "aiHint": "Defines the construction method of the signage.",
            "options": [
              {"value": "wall_mounted", "i18nKey": "questions.signage_type.options.wall_mounted", "order": 0},
              {"value": "hanging_ceiling", "i18nKey": "questions.signage_type.options.hanging", "order": 1},
              {"value": "floor_stickers", "i18nKey": "questions.signage_type.options.floor", "order": 2},
              {"value": "illuminated", "i18nKey": "questions.signage_type.options.illuminated", "order": 3}
            ]
          },
          {
            "key": "design_requirement",
            "type": "single",
            "required": true,
            "i18nKey": "questions.design_requirement.title",
            "aiHint": "Indicates whether the client needs design or only installation.",
            "options": [
              {"value": "installation_only", "i18nKey": "questions.design_requirement.options.installation", "order": 0},
              {"value": "design_and_installation", "i18nKey": "questions.design_requirement.options.design_install", "order": 1},
              {"value": "design_only", "i18nKey": "questions.design_requirement.options.design_only", "order": 2}
            ]
          },
          {
            "key": "branding_consistency",
            "type": "single",
            "required": false,
            "i18nKey": "questions.branding_consistency.title",
            "aiHint": "Helps workers align signage styling with brand guidelines.",
            "options": [
              {"value": "strict_brand_rules", "i18nKey": "questions.branding_consistency.options.strict", "order": 0},
              {"value": "flexible", "i18nKey": "questions.branding_consistency.options.flexible", "order": 1},
              {"value": "no_branding_needed", "i18nKey": "questions.branding_consistency.options.none", "order": 2}
            ]
          },
          {
            "key": "material_preference",
            "type": "single",
            "required": false,
            "i18nKey": "questions.material_preference.title",
            "aiHint": "Helps determine durability and finish.",
            "options": [
              {"value": "vinyl", "i18nKey": "questions.material_preference.options.vinyl", "order": 0},
              {"value": "acrylic", "i18nKey": "questions.material_preference.options.acrylic", "order": 1},
              {"value": "metal", "i18nKey": "questions.material_preference.options.metal", "order": 2},
              {"value": "no_preference", "i18nKey": "questions.material_preference.options.no_preference", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 3. Café and Takeaway Refurbishments
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'cafe-takeaway-refurbishments' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'cafe-takeaway-refurbishments',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "8a5e4ca3-5a3c-4a7a-9b56-9e4e1f5b1101",
        "category": "commercial-industrial",
        "subcategory": "retail-hospitality-leisure",
        "name": "Café and Takeaway Refurbishments",
        "slug": "cafe-takeaway-refurbishments",
        "i18nPrefix": "cafe.refurbishments",
        "questions": [
          {
            "key": "service_focus",
            "type": "single",
            "required": true,
            "i18nKey": "questions.service_focus.title",
            "aiHint": "Clarifies whether the work is focused on customer area, kitchen, or full premises.",
            "options": [
              {"value": "front_of_house", "i18nKey": "questions.service_focus.options.front_of_house", "order": 0},
              {"value": "kitchen_back_of_house", "i18nKey": "questions.service_focus.options.kitchen_back_of_house", "order": 1},
              {"value": "full_premises", "i18nKey": "questions.service_focus.options.full_premises", "order": 2}
            ]
          },
          {
            "key": "food_prep_intensity",
            "type": "single",
            "required": true,
            "i18nKey": "questions.food_prep_intensity.title",
            "aiHint": "Indicates how demanding the food preparation area will be.",
            "options": [
              {"value": "light_snacks_coffee", "i18nKey": "questions.food_prep_intensity.options.light_snacks_coffee", "order": 0},
              {"value": "hot_food_simple_menu", "i18nKey": "questions.food_prep_intensity.options.hot_food_simple_menu", "order": 1},
              {"value": "full_kitchen_high_output", "i18nKey": "questions.food_prep_intensity.options.full_kitchen_high_output", "order": 2}
            ]
          },
          {
            "key": "kitchen_work_scope",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.kitchen_work_scope.title",
            "aiHint": "Defines main kitchen-related works required.",
            "options": [
              {"value": "ventilation_extract", "i18nKey": "questions.kitchen_work_scope.options.ventilation_extract", "order": 0},
              {"value": "stainless_steel_surfaces", "i18nKey": "questions.kitchen_work_scope.options.stainless_steel_surfaces", "order": 1},
              {"value": "equipment_layout_changes", "i18nKey": "questions.kitchen_work_scope.options.equipment_layout_changes", "order": 2},
              {"value": "new_serve_counter", "i18nKey": "questions.kitchen_work_scope.options.new_serve_counter", "order": 3}
            ]
          },
          {
            "key": "customer_flow_style",
            "type": "single",
            "required": true,
            "i18nKey": "questions.customer_flow_style.title",
            "aiHint": "Helps design layout for ordering and collection.",
            "options": [
              {"value": "order_at_counter_only", "i18nKey": "questions.customer_flow_style.options.order_at_counter_only", "order": 0},
              {"value": "order_and_seat_inside", "i18nKey": "questions.customer_flow_style.options.order_and_seat_inside", "order": 1},
              {"value": "order_and_takeaway_focus", "i18nKey": "questions.customer_flow_style.options.order_and_takeaway_focus", "order": 2},
              {"value": "mixed_seating_and_takeaway", "i18nKey": "questions.customer_flow_style.options.mixed_seating_and_takeaway", "order": 3}
            ]
          },
          {
            "key": "seating_approach",
            "type": "single",
            "required": false,
            "i18nKey": "questions.seating_approach.title",
            "aiHint": "Clarifies style of seating to plan around.",
            "options": [
              {"value": "high_stools_counters", "i18nKey": "questions.seating_approach.options.high_stools_counters", "order": 0},
              {"value": "tables_and_chairs", "i18nKey": "questions.seating_approach.options.tables_and_chairs", "order": 1},
              {"value": "banquette_fixed_seating", "i18nKey": "questions.seating_approach.options.banquette_fixed_seating", "order": 2},
              {"value": "minimal_or_no_seating", "i18nKey": "questions.seating_approach.options.minimal_or_no_seating", "order": 3}
            ]
          },
          {
            "key": "finish_level",
            "type": "single",
            "required": true,
            "i18nKey": "questions.finish_level.title",
            "aiHint": "Sets expectation for material and finish quality.",
            "options": [
              {"value": "hardwearing_basic", "i18nKey": "questions.finish_level.options.hardwearing_basic", "order": 0},
              {"value": "mid_range_design_led", "i18nKey": "questions.finish_level.options.mid_range_design_led", "order": 1},
              {"value": "high_end_boutique", "i18nKey": "questions.finish_level.options.high_end_boutique", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 4. Clubs and Venue Fit-Outs
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'clubs-venue-fitouts' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'clubs-venue-fitouts',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "f41debc0-3f4f-4c75-9c0d-4e1e7e0e2202",
        "category": "commercial-industrial",
        "subcategory": "retail-hospitality-leisure",
        "name": "Clubs and Venue Fit-Outs",
        "slug": "clubs-venue-fitouts",
        "i18nPrefix": "clubs.fitouts",
        "questions": [
          {
            "key": "project_stage",
            "type": "single",
            "required": true,
            "i18nKey": "questions.project_stage.title",
            "aiHint": "Shows whether this is a full new fit-out or an upgrade.",
            "options": [
              {"value": "empty_shell_fitout", "i18nKey": "questions.project_stage.options.empty_shell_fitout", "order": 0},
              {"value": "major_refurb_existing_club", "i18nKey": "questions.project_stage.options.major_refurb_existing_club", "order": 1},
              {"value": "cosmetic_refresh_only", "i18nKey": "questions.project_stage.options.cosmetic_refresh_only", "order": 2}
            ]
          },
          {
            "key": "music_focus",
            "type": "single",
            "required": true,
            "i18nKey": "questions.music_focus.title",
            "aiHint": "Determines the priority for sound system and DJ area.",
            "options": [
              {"value": "dj_led_club", "i18nKey": "questions.music_focus.options.dj_led_club", "order": 0},
              {"value": "live_music_friendly", "i18nKey": "questions.music_focus.options.live_music_friendly", "order": 1},
              {"value": "background_music_venue", "i18nKey": "questions.music_focus.options.background_music_venue", "order": 2}
            ]
          },
          {
            "key": "av_and_lighting_scope",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.av_and_lighting_scope.title",
            "aiHint": "Identifies key technical systems involved.",
            "options": [
              {"value": "sound_system", "i18nKey": "questions.av_and_lighting_scope.options.sound_system", "order": 0},
              {"value": "club_lighting_fx", "i18nKey": "questions.av_and_lighting_scope.options.club_lighting_fx", "order": 1},
              {"value": "led_screens_visuals", "i18nKey": "questions.av_and_lighting_scope.options.led_screens_visuals", "order": 2},
              {"value": "basic_house_lighting_only", "i18nKey": "questions.av_and_lighting_scope.options.basic_house_lighting_only", "order": 3}
            ]
          },
          {
            "key": "bar_setup",
            "type": "single",
            "required": true,
            "i18nKey": "questions.bar_setup.title",
            "aiHint": "Defines how many bar zones need to be designed and built.",
            "options": [
              {"value": "single_main_bar", "i18nKey": "questions.bar_setup.options.single_main_bar", "order": 0},
              {"value": "multiple_bars", "i18nKey": "questions.bar_setup.options.multiple_bars", "order": 1},
              {"value": "mobile_or_pop_up_bars", "i18nKey": "questions.bar_setup.options.mobile_or_pop_up_bars", "order": 2},
              {"value": "no_bar_focus", "i18nKey": "questions.bar_setup.options.no_bar_focus", "order": 3}
            ]
          },
          {
            "key": "seating_and_zones",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.seating_and_zones.title",
            "aiHint": "Clarifies layout zones the fit-out must support.",
            "options": [
              {"value": "dancefloor_central", "i18nKey": "questions.seating_and_zones.options.dancefloor_central", "order": 0},
              {"value": "vip_booths", "i18nKey": "questions.seating_and_zones.options.vip_booths", "order": 1},
              {"value": "lounge_seating_areas", "i18nKey": "questions.seating_and_zones.options.lounge_seating_areas", "order": 2},
              {"value": "smoking_terrace_area", "i18nKey": "questions.seating_and_zones.options.smoking_terrace_area", "order": 3}
            ]
          },
          {
            "key": "design_direction",
            "type": "single",
            "required": false,
            "i18nKey": "questions.design_direction.title",
            "aiHint": "Gives a high-level sense of the design style.",
            "options": [
              {"value": "industrial_raw", "i18nKey": "questions.design_direction.options.industrial_raw", "order": 0},
              {"value": "luxury_high_end", "i18nKey": "questions.design_direction.options.luxury_high_end", "order": 1},
              {"value": "underground_warehouse", "i18nKey": "questions.design_direction.options.underground_warehouse", "order": 2},
              {"value": "no_fixed_direction", "i18nKey": "questions.design_direction.options.no_fixed_direction", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 5. Pop-Up and Temporary Shops
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'popup-temporary-shops' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'popup-temporary-shops',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "3c2f0ed6-3513-4b8d-8f3a-41f1b3d53303",
        "category": "commercial-industrial",
        "subcategory": "retail-hospitality-leisure",
        "name": "Pop-Up and Temporary Shops",
        "slug": "popup-temporary-shops",
        "i18nPrefix": "popup.shops",
        "questions": [
          {
            "key": "brand_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.brand_type.title",
            "aiHint": "Identifies what is being sold to inform layout and fixtures.",
            "options": [
              {"value": "fashion_apparel", "i18nKey": "questions.brand_type.options.fashion_apparel", "order": 0},
              {"value": "food_drink", "i18nKey": "questions.brand_type.options.food_drink", "order": 1},
              {"value": "lifestyle_homeware", "i18nKey": "questions.brand_type.options.lifestyle_homeware", "order": 2},
              {"value": "tech_or_specialist", "i18nKey": "questions.brand_type.options.tech_or_specialist", "order": 3}
            ]
          },
          {
            "key": "structure_approach",
            "type": "single",
            "required": true,
            "i18nKey": "questions.structure_approach.title",
            "aiHint": "Defines whether this is modular, freestanding or built-in.",
            "options": [
              {"value": "freestanding_units", "i18nKey": "questions.structure_approach.options.freestanding_units", "order": 0},
              {"value": "modular_system", "i18nKey": "questions.structure_approach.options.modular_system", "order": 1},
              {"value": "lightweight_built_in", "i18nKey": "questions.structure_approach.options.lightweight_built_in", "order": 2}
            ]
          },
          {
            "key": "reusability_priority",
            "type": "single",
            "required": true,
            "i18nKey": "questions.reusability_priority.title",
            "aiHint": "Shows if the client wants elements that can be reused at other locations.",
            "options": [
              {"value": "single_use_only", "i18nKey": "questions.reusability_priority.options.single_use_only", "order": 0},
              {"value": "reusable_for_future_popups", "i18nKey": "questions.reusability_priority.options.reusable_for_future_popups", "order": 1},
              {"value": "mix_of_bespoke_and_reusable", "i18nKey": "questions.reusability_priority.options.mix_of_bespoke_and_reusable", "order": 2}
            ]
          },
          {
            "key": "display_focus",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.display_focus.title",
            "aiHint": "Clarifies the main merchandising priorities.",
            "options": [
              {"value": "hero_central_display", "i18nKey": "questions.display_focus.options.hero_central_display", "order": 0},
              {"value": "wall_bays", "i18nKey": "questions.display_focus.options.wall_bays", "order": 1},
              {"value": "tables_plinths", "i18nKey": "questions.display_focus.options.tables_plinths", "order": 2},
              {"value": "storage_hidden_backdrop", "i18nKey": "questions.display_focus.options.storage_hidden_backdrop", "order": 3}
            ]
          },
          {
            "key": "brand_impact_level",
            "type": "single",
            "required": false,
            "i18nKey": "questions.brand_impact_level.title",
            "aiHint": "Indicates how visually bold the pop-up should feel.",
            "options": [
              {"value": "simple_clean", "i18nKey": "questions.brand_impact_level.options.simple_clean", "order": 0},
              {"value": "strong_visual_statement", "i18nKey": "questions.brand_impact_level.options.strong_visual_statement", "order": 1},
              {"value": "immersive_experience", "i18nKey": "questions.brand_impact_level.options.immersive_experience", "order": 2}
            ]
          },
          {
            "key": "services_required",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.services_required.title",
            "aiHint": "Lists which disciplines are needed for this pop-up.",
            "options": [
              {"value": "design_only", "i18nKey": "questions.services_required.options.design_only", "order": 0},
              {"value": "build_install", "i18nKey": "questions.services_required.options.build_install", "order": 1},
              {"value": "graphics_signage", "i18nKey": "questions.services_required.options.graphics_signage", "order": 2},
              {"value": "lighting_setup", "i18nKey": "questions.services_required.options.lighting_setup", "order": 3}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;
END $$;