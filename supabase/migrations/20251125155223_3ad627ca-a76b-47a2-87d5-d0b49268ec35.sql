-- Add missing micro-services for new question packs
DO $$ 
BEGIN
  -- Heater Installation (HVAC/heating-systems)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'heater-installation'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000047',
      'Heater Installation',
      'heater-installation',
      'hvac',
      'heating-systems',
      NOW()
    );
  END IF;

  -- Heater Repair (HVAC/heating-systems)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'heater-repair'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000048',
      'Heater Repair',
      'heater-repair',
      'hvac',
      'heating-systems',
      NOW()
    );
  END IF;

  -- Accessibility Improvements (Commercial/Building Services)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'accessibility-improvements'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      gen_random_uuid(),
      'Accessibility Improvements',
      'accessibility-improvements',
      'commercial-industrial',
      'building-services-compliance',
      NOW()
    );
  END IF;

  -- Acoustic Treatments (Commercial/Building Services)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'acoustic-treatments'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      gen_random_uuid(),
      'Acoustic Treatments',
      'acoustic-treatments',
      'commercial-industrial',
      'building-services-compliance',
      NOW()
    );
  END IF;

  -- Fire Safety Works (Commercial/Building Services)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'fire-safety-works'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, category_slug, subcategory_slug, created_at)
    VALUES (
      gen_random_uuid(),
      'Fire Safety Works',
      'fire-safety-works',
      'commercial-industrial',
      'building-services-compliance',
      NOW()
    );
  END IF;
END $$;

-- Insert question packs
DO $$ 
BEGIN
  -- 1. Heater Installation
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'heater-installation' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'heater-installation',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "00000000-0000-0000-0000-000000000047",
        "category": "hvac",
        "subcategory": "heating-systems",
        "name": "Heater Installation",
        "slug": "heater-installation",
        "i18nPrefix": "heater.installation",
        "questions": [
          {
            "key": "heater_type",
            "type": "single",
            "i18nKey": "questions.heater_type.title",
            "required": true,
            "aiHint": "Identifies the type of heater to be installed.",
            "options": [
              {"i18nKey": "questions.heater_type.options.electric_panel", "value": "electric_panel", "order": 0},
              {"i18nKey": "questions.heater_type.options.electric_convector", "value": "electric_convector", "order": 1},
              {"i18nKey": "questions.heater_type.options.infrared_panel", "value": "infrared_panel", "order": 2},
              {"i18nKey": "questions.heater_type.options.gas_wall_heater", "value": "gas_wall_heater", "order": 3},
              {"i18nKey": "questions.heater_type.options.outdoor_patio_heater", "value": "outdoor_patio_heater", "order": 4}
            ]
          },
          {
            "key": "mounting_style",
            "type": "single",
            "i18nKey": "questions.mounting_style.title",
            "required": true,
            "aiHint": "Shows how the heater will be positioned or fixed.",
            "options": [
              {"i18nKey": "questions.mounting_style.options.wall_mounted", "value": "wall_mounted", "order": 0},
              {"i18nKey": "questions.mounting_style.options.floor_standing", "value": "floor_standing", "order": 1},
              {"i18nKey": "questions.mounting_style.options.ceiling_mounted", "value": "ceiling_mounted", "order": 2}
            ]
          },
          {
            "key": "room_size_band",
            "type": "single",
            "i18nKey": "questions.room_size_band.title",
            "required": true,
            "aiHint": "Helps select the correct kW output for the heater.",
            "options": [
              {"i18nKey": "questions.room_size_band.options.small_room", "value": "small", "order": 0},
              {"i18nKey": "questions.room_size_band.options.medium_room", "value": "medium", "order": 1},
              {"i18nKey": "questions.room_size_band.options.large_room", "value": "large", "order": 2},
              {"i18nKey": "questions.room_size_band.options.very_large_or_open_plan", "value": "very_large", "order": 3}
            ]
          },
          {
            "key": "wall_or_surface_type",
            "type": "single",
            "i18nKey": "questions.wall_or_surface_type.title",
            "required": true,
            "aiHint": "Determines fixings needed for safe mounting.",
            "options": [
              {"i18nKey": "questions.wall_or_surface_type.options.brick_or_block", "value": "brick_block", "order": 0},
              {"i18nKey": "questions.wall_or_surface_type.options.concrete", "value": "concrete", "order": 1},
              {"i18nKey": "questions.wall_or_surface_type.options.plasterboard", "value": "plasterboard", "order": 2},
              {"i18nKey": "questions.wall_or_surface_type.options.timber_or_stud", "value": "timber_stud", "order": 3}
            ]
          },
          {
            "key": "power_supply_setup",
            "type": "single",
            "i18nKey": "questions.power_supply_setup.title",
            "required": true,
            "aiHint": "Shows whether a new circuit or spur may be required.",
            "options": [
              {"i18nKey": "questions.power_supply_setup.options.existing_socket_nearby", "value": "existing_socket", "order": 0},
              {"i18nKey": "questions.power_supply_setup.options.fused_spur_required", "value": "fused_spur_required", "order": 1},
              {"i18nKey": "questions.power_supply_setup.options.dedicated_circuit_needed", "value": "dedicated_circuit", "order": 2},
              {"i18nKey": "questions.power_supply_setup.options.gas_supply_for_heater", "value": "gas_supply", "order": 3}
            ]
          },
          {
            "key": "control_option_preference",
            "type": "single",
            "i18nKey": "questions.control_option_preference.title",
            "required": true,
            "aiHint": "Defines how the heater should be controlled.",
            "options": [
              {"i18nKey": "questions.control_option_preference.options.built_in_controls_only", "value": "built_in", "order": 0},
              {"i18nKey": "questions.control_option_preference.options.wall_thermostat", "value": "wall_thermostat", "order": 1},
              {"i18nKey": "questions.control_option_preference.options.smart_app_control", "value": "smart_app", "order": 2}
            ]
          },
          {
            "key": "usage_pattern",
            "type": "single",
            "i18nKey": "questions.usage_pattern.title",
            "required": true,
            "aiHint": "Helps choose heater type suitable for duty cycle and efficiency.",
            "options": [
              {"i18nKey": "questions.usage_pattern.options.occasional_top_up_heat", "value": "occasional", "order": 0},
              {"i18nKey": "questions.usage_pattern.options.regular_daily_use", "value": "regular_daily", "order": 1},
              {"i18nKey": "questions.usage_pattern.options.primary_long_term_heating", "value": "primary_heating", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 2. Heater Repair
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'heater-repair' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'heater-repair',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "00000000-0000-0000-0000-000000000048",
        "category": "hvac",
        "subcategory": "heating-systems",
        "name": "Heater Repair",
        "slug": "heater-repair",
        "i18nPrefix": "heater.repair",
        "questions": [
          {
            "key": "heater_type",
            "type": "single",
            "i18nKey": "questions.heater_type.title",
            "required": true,
            "aiHint": "Identifies the type of heater that has the fault.",
            "options": [
              {"i18nKey": "questions.heater_type.options.electric_panel", "value": "electric_panel", "order": 0},
              {"i18nKey": "questions.heater_type.options.electric_convector", "value": "electric_convector", "order": 1},
              {"i18nKey": "questions.heater_type.options.infrared_panel", "value": "infrared_panel", "order": 2},
              {"i18nKey": "questions.heater_type.options.gas_heater", "value": "gas_heater", "order": 3},
              {"i18nKey": "questions.heater_type.options.outdoor_patio_heater", "value": "outdoor_patio_heater", "order": 4}
            ]
          },
          {
            "key": "heater_power_source",
            "type": "single",
            "i18nKey": "questions.heater_power_source.title",
            "required": true,
            "aiHint": "Clarifies whether the heater is gas or electric for correct engineer skills.",
            "options": [
              {"i18nKey": "questions.heater_power_source.options.electric", "value": "electric", "order": 0},
              {"i18nKey": "questions.heater_power_source.options.mains_gas", "value": "mains_gas", "order": 1},
              {"i18nKey": "questions.heater_power_source.options.lpg_or_bottle_gas", "value": "lpg", "order": 2}
            ]
          },
          {
            "key": "main_fault_symptom",
            "type": "single",
            "i18nKey": "questions.main_fault_symptom.title",
            "required": true,
            "aiHint": "Captures the primary observable fault for diagnostics.",
            "options": [
              {"i18nKey": "questions.main_fault_symptom.options.no_power_or_not_turning_on", "value": "no_power", "order": 0},
              {"i18nKey": "questions.main_fault_symptom.options.heater_on_but_no_heat", "value": "no_heat", "order": 1},
              {"i18nKey": "questions.main_fault_symptom.options.heater_cuts_out_intermittently", "value": "cuts_out", "order": 2},
              {"i18nKey": "questions.main_fault_symptom.options.unusual_smell_or_noise", "value": "smell_noise", "order": 3}
            ]
          },
          {
            "key": "control_issue",
            "type": "single",
            "i18nKey": "questions.control_issue.title",
            "required": true,
            "aiHint": "Shows if the problem relates to thermostats or controls.",
            "options": [
              {"i18nKey": "questions.control_issue.options.controls_not_responding", "value": "not_responding", "order": 0},
              {"i18nKey": "questions.control_issue.options.inaccurate_temperature", "value": "inaccurate_temp", "order": 1},
              {"i18nKey": "questions.control_issue.options.timer_or_programme_not_working", "value": "timer_issue", "order": 2},
              {"i18nKey": "questions.control_issue.options.no_control_issues_observed", "value": "no_control_issue", "order": 3}
            ]
          },
          {
            "key": "heater_location_type",
            "type": "single",
            "i18nKey": "questions.heater_location_type.title",
            "required": true,
            "aiHint": "Indicates environment and potential IP/safety considerations.",
            "options": [
              {"i18nKey": "questions.heater_location_type.options.indoor_standard_room", "value": "indoor_standard", "order": 0},
              {"i18nKey": "questions.heater_location_type.options.bathroom_or_wet_area", "value": "wet_area", "order": 1},
              {"i18nKey": "questions.heater_location_type.options.outdoor_or_covered_terrace", "value": "outdoor_or_terrace", "order": 2}
            ]
          },
          {
            "key": "age_of_heater",
            "type": "single",
            "i18nKey": "questions.age_of_heater.title",
            "required": true,
            "aiHint": "Helps judge likelihood of repair vs replace and spare parts.",
            "options": [
              {"i18nKey": "questions.age_of_heater.options.less_than_3_years", "value": "<3", "order": 0},
              {"i18nKey": "questions.age_of_heater.options.three_to_seven_years", "value": "3-7", "order": 1},
              {"i18nKey": "questions.age_of_heater.options.seven_to_twelve_years", "value": "7-12", "order": 2},
              {"i18nKey": "questions.age_of_heater.options.more_than_twelve_years", "value": ">12", "order": 3},
              {"i18nKey": "questions.age_of_heater.options.not_sure", "value": "not_sure", "order": 4}
            ]
          },
          {
            "key": "previous_repairs_or_issues",
            "type": "single",
            "i18nKey": "questions.previous_repairs_or_issues.title",
            "required": true,
            "aiHint": "Indicates if the heater has a history of faults.",
            "options": [
              {"i18nKey": "questions.previous_repairs_or_issues.options.no_previous_issues", "value": "none", "order": 0},
              {"i18nKey": "questions.previous_repairs_or_issues.options.one_previous_repair", "value": "one_repair", "order": 1},
              {"i18nKey": "questions.previous_repairs_or_issues.options.multiple_repairs_or_recurring_fault", "value": "multiple_repairs", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 3. Accessibility Improvements
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'accessibility-improvements' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'accessibility-improvements',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "' || gen_random_uuid() || '",
        "category": "commercial-industrial",
        "subcategory": "building-services-compliance",
        "name": "Accessibility Improvements",
        "slug": "accessibility-improvements",
        "i18nPrefix": "accessibility.improvements",
        "questions": [
          {
            "key": "access_need",
            "type": "single",
            "i18nKey": "questions.access_need.title",
            "required": true,
            "aiHint": "Clarifies the main type of accessibility work required.",
            "options": [
              {"value": "ramps", "i18nKey": "questions.access_need.options.ramps", "order": 0},
              {"value": "handrails", "i18nKey": "questions.access_need.options.handrails", "order": 1},
              {"value": "door-widening", "i18nKey": "questions.access_need.options.door_widening", "order": 2},
              {"value": "toilets", "i18nKey": "questions.access_need.options.toilets", "order": 3},
              {"value": "full-assessment", "i18nKey": "questions.access_need.options.full_assessment", "order": 4}
            ]
          },
          {
            "key": "building_type",
            "type": "single",
            "i18nKey": "questions.building_type.title",
            "required": true,
            "aiHint": "Identifies type of property for compliance context.",
            "options": [
              {"value": "restaurant", "i18nKey": "questions.building_type.options.restaurant", "order": 0},
              {"value": "hotel", "i18nKey": "questions.building_type.options.hotel", "order": 1},
              {"value": "office", "i18nKey": "questions.building_type.options.office", "order": 2},
              {"value": "retail", "i18nKey": "questions.building_type.options.retail", "order": 3},
              {"value": "industrial", "i18nKey": "questions.building_type.options.industrial", "order": 4}
            ]
          },
          {
            "key": "current_access_issues",
            "type": "multi",
            "i18nKey": "questions.current_access_issues.title",
            "required": false,
            "aiHint": "Captures specific pain points or safety barriers.",
            "options": [
              {"value": "steps_at_entry", "i18nKey": "questions.current_access_issues.options.steps_at_entry", "order": 0},
              {"value": "narrow_doorways", "i18nKey": "questions.current_access_issues.options.narrow_doorways", "order": 1},
              {"value": "no_grab_rails", "i18nKey": "questions.current_access_issues.options.no_grab_rails", "order": 2},
              {"value": "poor_signage", "i18nKey": "questions.current_access_issues.options.poor_signage", "order": 3},
              {"value": "non_compliant_bathroom", "i18nKey": "questions.current_access_issues.options.non_compliant_bathroom", "order": 4}
            ]
          },
          {
            "key": "materials_preference",
            "type": "single",
            "i18nKey": "questions.materials_preference.title",
            "required": false,
            "aiHint": "Indicates preference for finish/material standard.",
            "options": [
              {"value": "standard", "i18nKey": "questions.materials_preference.options.standard", "order": 0},
              {"value": "premium", "i18nKey": "questions.materials_preference.options.premium", "order": 1},
              {"value": "heavy-duty", "i18nKey": "questions.materials_preference.options.heavy_duty", "order": 2}
            ]
          },
          {
            "key": "structural_modifications",
            "type": "single",
            "i18nKey": "questions.structural_modifications.title",
            "required": true,
            "aiHint": "Determines whether any walls or structural changes will be needed.",
            "options": [
              {"value": "yes", "i18nKey": "questions.structural_modifications.options.yes", "order": 0},
              {"value": "no", "i18nKey": "questions.structural_modifications.options.no", "order": 1},
              {"value": "not_sure", "i18nKey": "questions.structural_modifications.options.not_sure", "order": 2}
            ]
          },
          {
            "key": "compliance_target",
            "type": "single",
            "i18nKey": "questions.compliance_target.title",
            "required": true,
            "aiHint": "Helps determine regulation level required.",
            "options": [
              {"value": "basic_improvement", "i18nKey": "questions.compliance_target.options.basic", "order": 0},
              {"value": "full_ada_equivalent", "i18nKey": "questions.compliance_target.options.full", "order": 1},
              {"value": "consultation_needed", "i18nKey": "questions.compliance_target.options.consultation", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 4. Acoustic Treatments
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'acoustic-treatments' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'acoustic-treatments',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "' || gen_random_uuid() || '",
        "category": "commercial-industrial",
        "subcategory": "building-services-compliance",
        "name": "Acoustic Treatments",
        "slug": "acoustic-treatments",
        "i18nPrefix": "acoustic.treatments",
        "questions": [
          {
            "key": "acoustic_goal",
            "type": "single",
            "required": true,
            "i18nKey": "questions.acoustic_goal.title",
            "aiHint": "Defines intended outcome for sound treatment.",
            "options": [
              {"value": "noise_reduction", "i18nKey": "questions.acoustic_goal.options.noise_reduction", "order": 0},
              {"value": "soundproofing", "i18nKey": "questions.acoustic_goal.options.soundproofing", "order": 1},
              {"value": "echo_control", "i18nKey": "questions.acoustic_goal.options.echo_control", "order": 2},
              {"value": "full_acoustic_design", "i18nKey": "questions.acoustic_goal.options.full_design", "order": 3}
            ]
          },
          {
            "key": "space_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.space_type.title",
            "aiHint": "Identifies room type to determine acoustic requirements.",
            "options": [
              {"value": "restaurant", "i18nKey": "questions.space_type.options.restaurant", "order": 0},
              {"value": "studio", "i18nKey": "questions.space_type.options.studio", "order": 1},
              {"value": "office", "i18nKey": "questions.space_type.options.office", "order": 2},
              {"value": "industrial", "i18nKey": "questions.space_type.options.industrial", "order": 3},
              {"value": "event_space", "i18nKey": "questions.space_type.options.event_space", "order": 4}
            ]
          },
          {
            "key": "current_noise_issues",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.current_noise_issues.title",
            "aiHint": "Captures noise sources.",
            "options": [
              {"value": "external_traffic", "i18nKey": "questions.current_noise_issues.options.external_traffic", "order": 0},
              {"value": "machinery", "i18nKey": "questions.current_noise_issues.options.machinery", "order": 1},
              {"value": "echo", "i18nKey": "questions.current_noise_issues.options.echo", "order": 2},
              {"value": "neighbouring_units", "i18nKey": "questions.current_noise_issues.options.neighbouring_units", "order": 3}
            ]
          },
          {
            "key": "treatment_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.treatment_type.title",
            "aiHint": "Helps technician choose materials.",
            "options": [
              {"value": "panels", "i18nKey": "questions.treatment_type.options.panels", "order": 0},
              {"value": "insulation", "i18nKey": "questions.treatment_type.options.insulation", "order": 1},
              {"value": "barriers", "i18nKey": "questions.treatment_type.options.barriers", "order": 2},
              {"value": "mixed_solution", "i18nKey": "questions.treatment_type.options.mixed", "order": 3}
            ]
          },
          {
            "key": "wall_ceiling_condition",
            "type": "single",
            "required": true,
            "i18nKey": "questions.wall_ceiling_condition.title",
            "aiHint": "Checks if the structure supports treatments.",
            "options": [
              {"value": "good", "i18nKey": "questions.wall_ceiling_condition.options.good", "order": 0},
              {"value": "needs_repair", "i18nKey": "questions.wall_ceiling_condition.options.needs_repair", "order": 1},
              {"value": "unknown", "i18nKey": "questions.wall_ceiling_condition.options.unknown", "order": 2}
            ]
          },
          {
            "key": "design_preference",
            "type": "single",
            "required": false,
            "i18nKey": "questions.design_preference.title",
            "aiHint": "For aesthetic vs functional balance.",
            "options": [
              {"value": "discreet", "i18nKey": "questions.design_preference.options.discreet", "order": 0},
              {"value": "visible_feature_panels", "i18nKey": "questions.design_preference.options.feature_panels", "order": 1},
              {"value": "no_preference", "i18nKey": "questions.design_preference.options.no_preference", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 5. Fire Safety Works
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'fire-safety-works' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'fire-safety-works',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "' || gen_random_uuid() || '",
        "category": "commercial-industrial",
        "subcategory": "building-services-compliance",
        "name": "Fire Safety Works",
        "slug": "fire-safety-works",
        "i18nPrefix": "fire.safety",
        "questions": [
          {
            "key": "fire_work_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.fire_work_type.title",
            "aiHint": "Identifies core fire safety work required.",
            "options": [
              {"value": "alarms", "i18nKey": "questions.fire_work_type.options.alarms", "order": 0},
              {"value": "extinguishers", "i18nKey": "questions.fire_work_type.options.extinguishers", "order": 1},
              {"value": "emergency_lighting", "i18nKey": "questions.fire_work_type.options.emergency_lighting", "order": 2},
              {"value": "fire_doors", "i18nKey": "questions.fire_work_type.options.fire_doors", "order": 3},
              {"value": "full_safety_upgrade", "i18nKey": "questions.fire_work_type.options.full_upgrade", "order": 4}
            ]
          },
          {
            "key": "building_usage",
            "type": "single",
            "required": true,
            "i18nKey": "questions.building_usage.title",
            "aiHint": "Impacts compliance requirements.",
            "options": [
              {"value": "hospitality", "i18nKey": "questions.building_usage.options.hospitality", "order": 0},
              {"value": "retail", "i18nKey": "questions.building_usage.options.retail", "order": 1},
              {"value": "office", "i18nKey": "questions.building_usage.options.office", "order": 2},
              {"value": "industrial", "i18nKey": "questions.building_usage.options.industrial", "order": 3}
            ]
          },
          {
            "key": "existing_systems",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.existing_systems.title",
            "aiHint": "Lists already installed fire systems.",
            "options": [
              {"value": "alarms", "i18nKey": "questions.existing_systems.options.alarms", "order": 0},
              {"value": "sprinklers", "i18nKey": "questions.existing_systems.options.sprinklers", "order": 1},
              {"value": "extinguishers", "i18nKey": "questions.existing_systems.options.extinguishers", "order": 2},
              {"value": "fire_doors", "i18nKey": "questions.existing_systems.options.fire_doors", "order": 3},
              {"value": "emergency_lighting", "i18nKey": "questions.existing_systems.options.emergency_lighting", "order": 4}
            ]
          },
          {
            "key": "certification_need",
            "type": "single",
            "required": true,
            "i18nKey": "questions.certification_need.title",
            "aiHint": "Clarifies if compliance paperwork must be provided.",
            "options": [
              {"value": "installation_only", "i18nKey": "questions.certification_need.options.installation_only", "order": 0},
              {"value": "full_certification", "i18nKey": "questions.certification_need.options.full_certification", "order": 1},
              {"value": "assessment_required", "i18nKey": "questions.certification_need.options.assessment_required", "order": 2}
            ]
          },
          {
            "key": "building_age",
            "type": "single",
            "required": false,
            "i18nKey": "questions.building_age.title",
            "aiHint": "Helps assess wiring, structural, and compliance risks.",
            "options": [
              {"value": "new_build", "i18nKey": "questions.building_age.options.new_build", "order": 0},
              {"value": "10_to_20_years", "i18nKey": "questions.building_age.options.10_20", "order": 1},
              {"value": "20_plus_years", "i18nKey": "questions.building_age.options.20_plus", "order": 2},
              {"value": "unsure", "i18nKey": "questions.building_age.options.unsure", "order": 3}
            ]
          },
          {
            "key": "access_requirements",
            "type": "single",
            "required": false,
            "i18nKey": "questions.access_requirements.title",
            "aiHint": "Determines equipment needed for installation.",
            "options": [
              {"value": "normal_access", "i18nKey": "questions.access_requirements.options.normal", "order": 0},
              {"value": "high_ceiling", "i18nKey": "questions.access_requirements.options.high_ceiling", "order": 1},
              {"value": "restricted_areas", "i18nKey": "questions.access_requirements.options.restricted", "order": 2}
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;
END $$;