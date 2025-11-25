
-- Add 5 new question packs: Co-working, Large Commercial Projects, Common Areas, Emergency Call-Outs, General Commercial Repairs (CORRECTED)

-- Add missing micro-services for new question packs
DO $$
BEGIN
  -- 1. Co-working and Shared Offices (office-fit-outs-refurbishments: 64e0b787-ebf3-4c37-b8f3-c3a49732e133)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'coworking-shared-offices'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'd8f5c5a1-8b1b-4c63-9d93-2b2a5b920201',
      'Co-working and Shared Offices',
      'coworking-shared-offices',
      '64e0b787-ebf3-4c37-b8f3-c3a49732e133',
      NOW()
    );
  END IF;

  -- 2. Large Commercial Projects (office-fit-outs-refurbishments: 64e0b787-ebf3-4c37-b8f3-c3a49732e133)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'large-commercial-office-projects'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'a37b8475-3f0f-4a4f-9a65-0aa6e8e50302',
      'Large Commercial Projects',
      'large-commercial-office-projects',
      '64e0b787-ebf3-4c37-b8f3-c3a49732e133',
      NOW()
    );
  END IF;

  -- 3. Common Areas and Stairwells (commercial-maintenance-repairs: ae552f8b-d434-4371-a1d1-5a0563f5b498)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'common-areas-stairwells'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'e0af72a4-b418-4e07-9d01-1cdfc9aa0101',
      'Common Areas and Stairwells',
      'common-areas-stairwells',
      'ae552f8b-d434-4371-a1d1-5a0563f5b498',
      NOW()
    );
  END IF;

  -- 4. Emergency Call-Outs (commercial-maintenance-repairs: ae552f8b-d434-4371-a1d1-5a0563f5b498)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'emergency-call-outs'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      'b51dd7fa-7518-4c13-9de4-71bf42f70302',
      'Emergency Call-Outs',
      'emergency-call-outs',
      'ae552f8b-d434-4371-a1d1-5a0563f5b498',
      NOW()
    );
  END IF;

  -- 5. General Commercial Repairs (commercial-maintenance-repairs: ae552f8b-d434-4371-a1d1-5a0563f5b498)
  IF NOT EXISTS (
    SELECT 1 FROM service_micro_categories WHERE slug = 'general-commercial-repairs'
  ) THEN
    INSERT INTO service_micro_categories (id, name, slug, subcategory_id, created_at)
    VALUES (
      '8c41e553-d176-4c49-b1f4-683d7ae10303',
      'General Commercial Repairs',
      'general-commercial-repairs',
      'ae552f8b-d434-4371-a1d1-5a0563f5b498',
      NOW()
    );
  END IF;
END $$;

-- Insert question packs
DO $$
BEGIN
  -- 1. Co-working and Shared Offices
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'coworking-shared-offices' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'coworking-shared-offices',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "d8f5c5a1-8b1b-4c63-9d93-2b2a5b920201",
        "category": "commercial-industrial",
        "subcategory": "office-fit-outs-refurbishments",
        "name": "Co-working and Shared Offices",
        "slug": "coworking-shared-offices",
        "i18nPrefix": "coworking.shared",
        "questions": [
          {
            "key": "workspace_mix",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.workspace_mix.title",
            "aiHint": "Defines the main types of workspaces that must be included.",
            "options": [
              { "value": "hot_desking_open_plan", "i18nKey": "questions.workspace_mix.options.hot_desking_open_plan", "order": 0 },
              { "value": "dedicated_desks", "i18nKey": "questions.workspace_mix.options.dedicated_desks", "order": 1 },
              { "value": "private_offices", "i18nKey": "questions.workspace_mix.options.private_offices", "order": 2 },
              { "value": "meeting_rooms", "i18nKey": "questions.workspace_mix.options.meeting_rooms", "order": 3 },
              { "value": "phone_or_focus_booths", "i18nKey": "questions.workspace_mix.options.phone_or_focus_booths", "order": 4 }
            ]
          },
          {
            "key": "community_areas",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.community_areas.title",
            "aiHint": "Identifies shared amenity spaces for users.",
            "options": [
              { "value": "reception_lounge", "i18nKey": "questions.community_areas.options.reception_lounge", "order": 0 },
              { "value": "coffee_bar_or_kitchen", "i18nKey": "questions.community_areas.options.coffee_bar_or_kitchen", "order": 1 },
              { "value": "event_or_townhall_space", "i18nKey": "questions.community_areas.options.event_or_townhall_space", "order": 2 },
              { "value": "informal_breakout_zones", "i18nKey": "questions.community_areas.options.informal_breakout_zones", "order": 3 }
            ]
          },
          {
            "key": "acoustic_priority",
            "type": "single",
            "required": true,
            "i18nKey": "questions.acoustic_priority.title",
            "aiHint": "Shows how important sound control is across the space.",
            "options": [
              { "value": "standard_office_acoustics", "i18nKey": "questions.acoustic_priority.options.standard_office_acoustics", "order": 0 },
              { "value": "enhanced_for_calls_and_meetings", "i18nKey": "questions.acoustic_priority.options.enhanced_for_calls_and_meetings", "order": 1 },
              { "value": "high_performance_focus_areas", "i18nKey": "questions.acoustic_priority.options.high_performance_focus_areas", "order": 2 }
            ]
          },
          {
            "key": "tech_infrastructure_level",
            "type": "single",
            "required": true,
            "i18nKey": "questions.tech_infrastructure_level.title",
            "aiHint": "Defines complexity of IT and AV for co-working users.",
            "options": [
              { "value": "basic_power_wifi", "i18nKey": "questions.tech_infrastructure_level.options.basic_power_wifi", "order": 0 },
              { "value": "enhanced_data_points_and_av", "i18nKey": "questions.tech_infrastructure_level.options.enhanced_data_points_and_av", "order": 1 },
              { "value": "high_spec_smart_spaces", "i18nKey": "questions.tech_infrastructure_level.options.high_spec_smart_spaces", "order": 2 }
            ]
          },
          {
            "key": "brand_and_atmosphere",
            "type": "single",
            "required": false,
            "i18nKey": "questions.brand_and_atmosphere.title",
            "aiHint": "Guides the visual and experiential style.",
            "options": [
              { "value": "minimal_clean_and_light", "i18nKey": "questions.brand_and_atmosphere.options.minimal_clean_and_light", "order": 0 },
              { "value": "creative_boutique", "i18nKey": "questions.brand_and_atmosphere.options.creative_boutique", "order": 1 },
              { "value": "corporate_professional", "i18nKey": "questions.brand_and_atmosphere.options.corporate_professional", "order": 2 }
            ]
          },
          {
            "key": "flexibility_emphasis",
            "type": "single",
            "required": false,
            "i18nKey": "questions.flexibility_emphasis.title",
            "aiHint": "Clarifies how important modular / reconfigurable layouts are.",
            "options": [
              { "value": "highly_flexible_reconfigurable", "i18nKey": "questions.flexibility_emphasis.options.highly_flexible_reconfigurable", "order": 0 },
              { "value": "balanced_fixed_and_flexible", "i18nKey": "questions.flexibility_emphasis.options.balanced_fixed_and_flexible", "order": 1 },
              { "value": "mainly_fixed_layout", "i18nKey": "questions.flexibility_emphasis.options.mainly_fixed_layout", "order": 2 }
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 2. Large Commercial Projects
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'large-commercial-office-projects' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'large-commercial-office-projects',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "a37b8475-3f0f-4a4f-9a65-0aa6e8e50302",
        "category": "commercial-industrial",
        "subcategory": "office-fit-outs-refurbishments",
        "name": "Large Commercial Projects",
        "slug": "large-commercial-office-projects",
        "i18nPrefix": "large.commercial",
        "questions": [
          {
            "key": "project_nature",
            "type": "single",
            "required": true,
            "i18nKey": "questions.project_nature.title",
            "aiHint": "Defines the scope type for the office project.",
            "options": [
              { "value": "cat_a_fitout", "i18nKey": "questions.project_nature.options.cat_a_fitout", "order": 0 },
              { "value": "cat_b_tenant_fitout", "i18nKey": "questions.project_nature.options.cat_b_tenant_fitout", "order": 1 },
              { "value": "full_strip_out_and_refurb", "i18nKey": "questions.project_nature.options.full_strip_out_and_refurb", "order": 2 }
            ]
          },
          {
            "key": "planning_priority",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.planning_priority.title",
            "aiHint": "Highlights key planning drivers for the project.",
            "options": [
              { "value": "high_occupancy_density", "i18nKey": "questions.planning_priority.options.high_occupancy_density", "order": 0 },
              { "value": "collaboration_spaces", "i18nKey": "questions.planning_priority.options.collaboration_spaces", "order": 1 },
              { "value": "quiet_focus_zones", "i18nKey": "questions.planning_priority.options.quiet_focus_zones", "order": 2 },
              { "value": "client_front_of_house", "i18nKey": "questions.planning_priority.options.client_front_of_house", "order": 3 }
            ]
          },
          {
            "key": "services_scope",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.services_scope.title",
            "aiHint": "Identifies building services likely to be altered.",
            "options": [
              { "value": "hvac_changes", "i18nKey": "questions.services_scope.options.hvac_changes", "order": 0 },
              { "value": "lighting_design", "i18nKey": "questions.services_scope.options.lighting_design", "order": 1 },
              { "value": "power_and_data_distribution", "i18nKey": "questions.services_scope.options.power_and_data_distribution", "order": 2 },
              { "value": "fire_safety_and_detection", "i18nKey": "questions.services_scope.options.fire_safety_and_detection", "order": 3 }
            ]
          },
          {
            "key": "sustainability_targets",
            "type": "single",
            "required": false,
            "i18nKey": "questions.sustainability_targets.title",
            "aiHint": "Shows whether environmental certification is a design driver.",
            "options": [
              { "value": "standard_compliance_only", "i18nKey": "questions.sustainability_targets.options.standard_compliance_only", "order": 0 },
              { "value": "improved_energy_performance", "i18nKey": "questions.sustainability_targets.options.improved_energy_performance", "order": 1 },
              { "value": "target_certification_breeam_leed", "i18nKey": "questions.sustainability_targets.options.target_certification_breeam_leed", "order": 2 }
            ]
          },
          {
            "key": "corporate_image_level",
            "type": "single",
            "required": false,
            "i18nKey": "questions.corporate_image_level.title",
            "aiHint": "Sets expectation for front-of-house and client-facing areas.",
            "options": [
              { "value": "functional_professional", "i18nKey": "questions.corporate_image_level.options.functional_professional", "order": 0 },
              { "value": "elevated_high_spec", "i18nKey": "questions.corporate_image_level.options.elevated_high_spec", "order": 1 },
              { "value": "flagship_headquarters_standard", "i18nKey": "questions.corporate_image_level.options.flagship_headquarters_standard", "order": 2 }
            ]
          },
          {
            "key": "change_management_complexity",
            "type": "single",
            "required": false,
            "i18nKey": "questions.change_management_complexity.title",
            "aiHint": "Helps understand how much phasing and stakeholder coordination may be needed.",
            "options": [
              { "value": "single_tenant_simple", "i18nKey": "questions.change_management_complexity.options.single_tenant_simple", "order": 0 },
              { "value": "multi_tenant_multi_floor", "i18nKey": "questions.change_management_complexity.options.multi_tenant_multi_floor", "order": 1 },
              { "value": "live_occupation_during_works", "i18nKey": "questions.change_management_complexity.options.live_occupation_during_works", "order": 2 }
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 3. Common Areas and Stairwells
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'common-areas-stairwells' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'common-areas-stairwells',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "e0af72a4-b418-4e07-9d01-1cdfc9aa0101",
        "category": "commercial-industrial",
        "subcategory": "commercial-maintenance-repairs",
        "name": "Common Areas and Stairwells",
        "slug": "common-areas-stairwells",
        "i18nPrefix": "common.areas",
        "questions": [
          {
            "key": "work_type",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.work_type.title",
            "aiHint": "Defines key maintenance or repair tasks requested.",
            "options": [
              { "value": "painting_refresh", "i18nKey": "questions.work_type.options.painting_refresh", "order": 0 },
              { "value": "lighting_repairs", "i18nKey": "questions.work_type.options.lighting_repairs", "order": 1 },
              { "value": "floor_or_tiling_repairs", "i18nKey": "questions.work_type.options.floor_or_tiling_repairs", "order": 2 },
              { "value": "handrail_fixing", "i18nKey": "questions.work_type.options.handrail_fixing", "order": 3 },
              { "value": "cleaning_and_upkeep", "i18nKey": "questions.work_type.options.cleaning_and_upkeep", "order": 4 }
            ]
          },
          {
            "key": "building_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.building_type.title",
            "aiHint": "Indicates property category and standards required.",
            "options": [
              { "value": "residential_block", "i18nKey": "questions.building_type.options.residential_block", "order": 0 },
              { "value": "office_building", "i18nKey": "questions.building_type.options.office_building", "order": 1 },
              { "value": "retail_or_mixed_use", "i18nKey": "questions.building_type.options.retail_or_mixed_use", "order": 2 },
              { "value": "hospitality_venue", "i18nKey": "questions.building_type.options.hospitality_venue", "order": 3 }
            ]
          },
          {
            "key": "lighting_system",
            "type": "single",
            "required": false,
            "i18nKey": "questions.lighting_system.title",
            "aiHint": "Determines complexity of lighting maintenance in stairwells.",
            "options": [
              { "value": "standard_led", "i18nKey": "questions.lighting_system.options.standard_led", "order": 0 },
              { "value": "sensor_activated_lighting", "i18nKey": "questions.lighting_system.options.sensor_activated_lighting", "order": 1 },
              { "value": "emergency_lighting", "i18nKey": "questions.lighting_system.options.emergency_lighting", "order": 2 }
            ]
          },
          {
            "key": "surface_condition",
            "type": "single",
            "required": false,
            "i18nKey": "questions.surface_condition.title",
            "aiHint": "Identifies level of deterioration.",
            "options": [
              { "value": "minor_scuffs", "i18nKey": "questions.surface_condition.options.minor_scuffs", "order": 0 },
              { "value": "visible_damage", "i18nKey": "questions.surface_condition.options.visible_damage", "order": 1 },
              { "value": "poor_overall_condition", "i18nKey": "questions.surface_condition.options.poor_overall_condition", "order": 2 }
            ]
          },
          {
            "key": "safety_elements",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.safety_elements.title",
            "aiHint": "Defines safety features requiring updates.",
            "options": [
              { "value": "handrails", "i18nKey": "questions.safety_elements.options.handrails", "order": 0 },
              { "value": "non_slip_treads", "i18nKey": "questions.safety_elements.options.non_slip_treads", "order": 1 },
              { "value": "signage_replacement", "i18nKey": "questions.safety_elements.options.signage_replacement", "order": 2 }
            ]
          },
          {
            "key": "finish_expectation",
            "type": "single",
            "required": false,
            "i18nKey": "questions.finish_expectation.title",
            "aiHint": "Sets expectations for finish level.",
            "options": [
              { "value": "basic_maintenance", "i18nKey": "questions.finish_expectation.options.basic_maintenance", "order": 0 },
              { "value": "mid_range_refresh", "i18nKey": "questions.finish_expectation.options.mid_range_refresh", "order": 1 },
              { "value": "high_end_presentation", "i18nKey": "questions.finish_expectation.options.high_end_presentation", "order": 2 }
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 4. Emergency Call-Outs
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'emergency-call-outs' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'emergency-call-outs',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "b51dd7fa-7518-4c13-9de4-71bf42f70302",
        "category": "commercial-industrial",
        "subcategory": "commercial-maintenance-repairs",
        "name": "Emergency Call-Outs",
        "slug": "emergency-call-outs",
        "i18nPrefix": "emergency.callouts",
        "questions": [
          {
            "key": "emergency_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.emergency_type.title",
            "aiHint": "Defines the primary category of urgent problem.",
            "options": [
              { "value": "electrical_fault", "i18nKey": "questions.emergency_type.options.electrical_fault", "order": 0 },
              { "value": "water_leak_or_flooding", "i18nKey": "questions.emergency_type.options.water_leak_or_flooding", "order": 1 },
              { "value": "blocked_or_overflowing_drain", "i18nKey": "questions.emergency_type.options.blocked_or_overflowing_drain", "order": 2 },
              { "value": "security_issue_or_breakage", "i18nKey": "questions.emergency_type.options.security_issue", "order": 3 },
              { "value": "structural_damage", "i18nKey": "questions.emergency_type.options.structural_damage", "order": 4 }
            ]
          },
          {
            "key": "impact_on_business",
            "type": "single",
            "required": true,
            "i18nKey": "questions.impact_on_business.title",
            "aiHint": "Shows severity level without reference to timing.",
            "options": [
              { "value": "minor_disruption", "i18nKey": "questions.impact_on_business.options.minor_disruption", "order": 0 },
              { "value": "significant_disruption", "i18nKey": "questions.impact_on_business.options.significant_disruption", "order": 1 },
              { "value": "operations_stopped", "i18nKey": "questions.impact_on_business.options.operations_stopped", "order": 2 }
            ]
          },
          {
            "key": "systems_involved",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.systems_involved.title",
            "aiHint": "Identifies building systems affected.",
            "options": [
              { "value": "water_systems", "i18nKey": "questions.systems_involved.options.water_systems", "order": 0 },
              { "value": "electrical_systems", "i18nKey": "questions.systems_involved.options.electrical_systems", "order": 1 },
              { "value": "doors_windows_security", "i18nKey": "questions.systems_involved.options.doors_windows_security", "order": 2 },
              { "value": "drainage", "i18nKey": "questions.systems_involved.options.drainage", "order": 3 }
            ]
          },
          {
            "key": "problem_location",
            "type": "single",
            "required": false,
            "i18nKey": "questions.problem_location.title",
            "aiHint": "Identifies the general part of the building affected.",
            "options": [
              { "value": "interior", "i18nKey": "questions.problem_location.options.interior", "order": 0 },
              { "value": "exterior", "i18nKey": "questions.problem_location.options.exterior", "order": 1 },
              { "value": "roof_or_facade", "i18nKey": "questions.problem_location.options.roof_or_facade", "order": 2 }
            ]
          },
          {
            "key": "temporary_measures_needed",
            "type": "single",
            "required": false,
            "i18nKey": "questions.temporary_measures_needed.title",
            "aiHint": "Shows whether temporary fixes or securing are needed.",
            "options": [
              { "value": "secure_and_make_safe", "i18nKey": "questions.temporary_measures_needed.options.secure_and_make_safe", "order": 0 },
              { "value": "short_term_repair", "i18nKey": "questions.temporary_measures_needed.options.short_term_repair", "order": 1 },
              { "value": "full_repair_expected", "i18nKey": "questions.temporary_measures_needed.options.full_repair_expected", "order": 2 }
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;

  -- 5. General Commercial Repairs
  IF NOT EXISTS (
    SELECT 1 FROM question_packs WHERE micro_slug = 'general-commercial-repairs' AND version = 1
  ) THEN
    INSERT INTO question_packs (micro_slug, version, status, source, is_active, content, created_at)
    VALUES (
      'general-commercial-repairs',
      1,
      'approved',
      'ai',
      true,
      '{
        "id": "8c41e553-d176-4c49-b1f4-683d7ae10303",
        "category": "commercial-industrial",
        "subcategory": "commercial-maintenance-repairs",
        "name": "General Commercial Repairs",
        "slug": "general-commercial-repairs",
        "i18nPrefix": "general.commercial.repairs",
        "questions": [
          {
            "key": "repair_categories",
            "type": "multi",
            "required": true,
            "i18nKey": "questions.repair_categories.title",
            "aiHint": "Defines the type of repair or maintenance needed across the property.",
            "options": [
              { "value": "electrical_repairs", "i18nKey": "questions.repair_categories.options.electrical_repairs", "order": 0 },
              { "value": "plumbing_repairs", "i18nKey": "questions.repair_categories.options.plumbing_repairs", "order": 1 },
              { "value": "carpentry_repairs", "i18nKey": "questions.repair_categories.options.carpentry_repairs", "order": 2 },
              { "value": "general_building_repairs", "i18nKey": "questions.repair_categories.options.general_building_repairs", "order": 3 },
              { "value": "hvac_or_ventilation", "i18nKey": "questions.repair_categories.options.hvac_or_ventilation", "order": 4 }
            ]
          },
          {
            "key": "property_type",
            "type": "single",
            "required": true,
            "i18nKey": "questions.property_type.title",
            "aiHint": "Helps understand typical standards for expected repairs.",
            "options": [
              { "value": "retail_unit", "i18nKey": "questions.property_type.options.retail_unit", "order": 0 },
              { "value": "office_space", "i18nKey": "questions.property_type.options.office_space", "order": 1 },
              { "value": "restaurant_or_venue", "i18nKey": "questions.property_type.options.restaurant_or_venue", "order": 2 },
              { "value": "industrial_unit", "i18nKey": "questions.property_type.options.industrial_unit", "order": 3 }
            ]
          },
          {
            "key": "issue_severity",
            "type": "single",
            "required": true,
            "i18nKey": "questions.issue_severity.title",
            "aiHint": "Describes the level of degradation or impact.",
            "options": [
              { "value": "minor_cosmetic", "i18nKey": "questions.issue_severity.options.minor_cosmetic", "order": 0 },
              { "value": "functional_issue", "i18nKey": "questions.issue_severity.options.functional_issue", "order": 1 },
              { "value": "major_failure", "i18nKey": "questions.issue_severity.options.major_failure", "order": 2 }
            ]
          },
          {
            "key": "materials_involved",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.materials_involved.title",
            "aiHint": "Helps the contractor understand which materials/tools may be needed.",
            "options": [
              { "value": "woodwork", "i18nKey": "questions.materials_involved.options.woodwork", "order": 0 },
              { "value": "metalwork", "i18nKey": "questions.materials_involved.options.metalwork", "order": 1 },
              { "value": "plaster_or_drywall", "i18nKey": "questions.materials_involved.options.plaster_or_drywall", "order": 2 },
              { "value": "tiling_or_flooring", "i18nKey": "questions.materials_involved.options.tiling_or_flooring", "order": 3 }
            ]
          },
          {
            "key": "system_dependencies",
            "type": "multi",
            "required": false,
            "i18nKey": "questions.system_dependencies.title",
            "aiHint": "Shows what building systems the repair may interact with.",
            "options": [
              { "value": "electrical_systems", "i18nKey": "questions.system_dependencies.options.electrical_systems", "order": 0 },
              { "value": "plumbing_systems", "i18nKey": "questions.system_dependencies.options.plumbing_systems", "order": 1 },
              { "value": "hvac_or_airflow", "i18nKey": "questions.system_dependencies.options.hvac_or_airflow", "order": 2 },
              { "value": "interior_finishes", "i18nKey": "questions.system_dependencies.options.interior_finishes", "order": 3 }
            ]
          },
          {
            "key": "finish_expectation",
            "type": "single",
            "required": false,
            "i18nKey": "questions.finish_expectation.title",
            "aiHint": "Sets expectations for repair finish quality.",
            "options": [
              { "value": "basic_repair_finish", "i18nKey": "questions.finish_expectation.options.basic_repair_finish", "order": 0 },
              { "value": "mid_level_polished", "i18nKey": "questions.finish_expectation.options.mid_level_polished", "order": 1 },
              { "value": "high_end_like_new", "i18nKey": "questions.finish_expectation.options.high_end_like_new", "order": 2 }
            ]
          }
        ]
      }'::jsonb,
      NOW()
    );
  END IF;
END $$;
