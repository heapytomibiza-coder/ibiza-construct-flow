-- Add 7 more HVAC question packs: AC Performance/Noise, Regular AC Servicing, AC Installation, AC Maintenance, AC System Upgrade/Replacement, AC Unit Relocation, and Ducted AC Installation

INSERT INTO question_packs (pack_id, micro_slug, version, status, source, is_active, content)
VALUES
-- 1. AC Performance / Noise Issues
(
  gen_random_uuid(),
  'ac-performance-noise',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "9f63ce0a-555d-4aeb-9c00-2f78a4d8c604",
    "category": "hvac",
    "name": "AC Poor Performance / Noise Issues",
    "slug": "ac-performance-noise",
    "i18nPrefix": "hvac.acPerformanceNoise",
    "questions": [
      {
        "key": "main_concern",
        "type": "single",
        "i18nKey": "hvac.acPerformanceNoise.questions.main_concern.title",
        "required": true,
        "aiHint": "Whether the leading issue is performance, noise or both.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.main_concern.options.poor_cooling_performance", "value": "poor_cooling_performance", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.main_concern.options.noise_issue", "value": "noise_issue", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.main_concern.options.both_performance_and_noise", "value": "both_performance_and_noise", "order": 2 }
        ]
      },
      {
        "key": "performance_issue_type",
        "type": "multi",
        "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.title",
        "required": true,
        "aiHint": "Types of cooling or performance issues noticed.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.options.not_reaching_set_temperature", "value": "not_reaching_set_temperature", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.options.takes_very_long_to_cool", "value": "takes_very_long_to_cool", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.options.uneven_temperature_in_room", "value": "uneven_temperature_in_room", "order": 2 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.options.unit_short_cycles", "value": "unit_short_cycles", "order": 3 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.performance_issue_type.options.airflow_weak_from_vents", "value": "airflow_weak_from_vents", "order": 4 }
        ]
      },
      {
        "key": "noise_type",
        "type": "multi",
        "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.title",
        "required": true,
        "aiHint": "Description of unusual sounds coming from the AC.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.options.rattling_or_vibration", "value": "rattling_or_vibration", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.options.buzzing_or_humming", "value": "buzzing_or_humming", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.options.squealing_or_screeching", "value": "squealing_or_screeching", "order": 2 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.options.banging_or_knocking", "value": "banging_or_knocking", "order": 3 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.noise_type.options.whistling_air_noise", "value": "whistling_air_noise", "order": 4 }
        ]
      },
      {
        "key": "when_issues_occur",
        "type": "single",
        "i18nKey": "hvac.acPerformanceNoise.questions.when_issues_occur.title",
        "required": true,
        "aiHint": "Operating conditions when issues are most noticeable.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.when_issues_occur.options.at_startup", "value": "at_startup", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.when_issues_occur.options.after_running_for_a_while", "value": "after_running_for_a_while", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.when_issues_occur.options.randomly", "value": "randomly", "order": 2 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.when_issues_occur.options.continuously_while_on", "value": "continuously_while_on", "order": 3 }
        ]
      },
      {
        "key": "units_affected",
        "type": "single",
        "i18nKey": "hvac.acPerformanceNoise.questions.units_affected.title",
        "required": true,
        "aiHint": "How widespread the performance/noise issues are across units.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.units_affected.options.single_unit_only", "value": "single_unit_only", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.units_affected.options.few_units_on_same_system", "value": "few_units_on_same_system", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.units_affected.options.most_or_all_units", "value": "most_or_all_units", "order": 2 }
        ]
      },
      {
        "key": "filter_and_maintenance_status",
        "type": "single",
        "i18nKey": "hvac.acPerformanceNoise.questions.filter_and_maintenance_status.title",
        "required": true,
        "aiHint": "Rough idea of recent filter cleaning and maintenance history.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.filter_and_maintenance_status.options.filters_cleaned_recently", "value": "filters_cleaned_recently", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.filter_and_maintenance_status.options.filters_not_cleaned_for_a_while", "value": "filters_not_cleaned_for_a_while", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.filter_and_maintenance_status.options.never_had_full_service", "value": "never_had_full_service", "order": 2 }
        ]
      },
      {
        "key": "overall_impact",
        "type": "single",
        "i18nKey": "hvac.acPerformanceNoise.questions.overall_impact.title",
        "required": true,
        "aiHint": "How much the performance/noise issue affects use of the space.",
        "options": [
          { "i18nKey": "hvac.acPerformanceNoise.questions.overall_impact.options.minor_annoyance", "value": "minor_annoyance", "order": 0 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.overall_impact.options.disruptive_but_tolerable", "value": "disruptive_but_tolerable", "order": 1 },
          { "i18nKey": "hvac.acPerformanceNoise.questions.overall_impact.options.makes_space_hard_to_use", "value": "makes_space_hard_to_use", "order": 2 }
        ]
      }
    ],
    "question_order": [
      "main_concern",
      "performance_issue_type",
      "noise_type",
      "when_issues_occur",
      "units_affected",
      "filter_and_maintenance_status",
      "overall_impact"
    ],
    "ai_prompt_template": "You are an HVAC diagnostician. Use the answers to explain whether the main issue is performance, noise, or both; describe the performance symptoms, the types of noises heard, when they occur, how many units are affected, the maintenance/filter status, and overall impact. Produce a troubleshooting brief that a technician can use to plan inspection."
  }$json$::jsonb
),

-- 2. Regular AC Servicing
(
  gen_random_uuid(),
  'regular-ac-servicing',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "c8c5b6c5-44b4-4b26-b39f-9eaf0ff8c705",
    "category": "hvac",
    "name": "Regular AC Servicing",
    "slug": "regular-ac-servicing",
    "i18nPrefix": "hvac.regularAcServicing",
    "questions": [
      {
        "key": "environment_type",
        "type": "single",
        "i18nKey": "hvac.regularAcServicing.questions.environment_type.title",
        "required": true,
        "aiHint": "Type of environment where AC servicing is required.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.environment_type.options.private_home", "value": "private_home", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.environment_type.options.holiday_rental", "value": "holiday_rental", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.environment_type.options.office_or_workspace", "value": "office_or_workspace", "order": 2 },
          { "i18nKey": "hvac.regularAcServicing.questions.environment_type.options.retail_or_hospitality", "value": "retail_or_hospitality", "order": 3 },
          { "i18nKey": "hvac.regularAcServicing.questions.environment_type.options.other_commercial", "value": "other_commercial", "order": 4 }
        ]
      },
      {
        "key": "system_mix",
        "type": "multi",
        "i18nKey": "hvac.regularAcServicing.questions.system_mix.title",
        "required": true,
        "aiHint": "Types of AC systems that are part of the servicing contract.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.system_mix.options.split_wall_units", "value": "split_wall_units", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.system_mix.options.multi_split_systems", "value": "multi_split_systems", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.system_mix.options.ducted_systems", "value": "ducted_systems", "order": 2 },
          { "i18nKey": "hvac.regularAcServicing.questions.system_mix.options.cassette_units", "value": "cassette_units", "order": 3 },
          { "i18nKey": "hvac.regularAcServicing.questions.system_mix.options.window_units", "value": "window_units", "order": 4 }
        ]
      },
      {
        "key": "approx_number_of_units",
        "type": "single",
        "i18nKey": "hvac.regularAcServicing.questions.approx_number_of_units.title",
        "required": true,
        "aiHint": "Approximate number of indoor units included in servicing.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.approx_number_of_units.options.one_to_three_units", "value": "one_to_three_units", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.approx_number_of_units.options.four_to_eight_units", "value": "four_to_eight_units", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.approx_number_of_units.options.nine_to_fifteen_units", "value": "nine_to_fifteen_units", "order": 2 },
          { "i18nKey": "hvac.regularAcServicing.questions.approx_number_of_units.options.sixteen_or_more_units", "value": "sixteen_or_more_units", "order": 3 }
        ]
      },
      {
        "key": "usage_intensity",
        "type": "single",
        "i18nKey": "hvac.regularAcServicing.questions.usage_intensity.title",
        "required": true,
        "aiHint": "How intensively the AC systems are typically used.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.usage_intensity.options.light_seasonal_use", "value": "light_seasonal_use", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.usage_intensity.options.regular_daily_use", "value": "regular_daily_use", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.usage_intensity.options.heavy_or_near_constant_use", "value": "heavy_or_near_constant_use", "order": 2 }
        ]
      },
      {
        "key": "current_known_issues",
        "type": "multi",
        "i18nKey": "hvac.regularAcServicing.questions.current_known_issues.title",
        "required": true,
        "aiHint": "Any existing issues to address during servicing, in addition to routine work.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.current_known_issues.options.none_routine_service_only", "value": "none_routine_service_only", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.current_known_issues.options.some_units_low_performance", "value": "some_units_low_performance", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.current_known_issues.options.some_units_noise_or_vibration", "value": "some_units_noise_or_vibration", "order": 2 },
          { "i18nKey": "hvac.regularAcServicing.questions.current_known_issues.options.known_leak_or_drainage_issue", "value": "known_leak_or_drainage_issue", "order": 3 }
        ]
      },
      {
        "key": "service_depth_required",
        "type": "single",
        "i18nKey": "hvac.regularAcServicing.questions.service_depth_required.title",
        "required": true,
        "aiHint": "Depth of service expected for each visit.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.service_depth_required.options.basic_filter_clean_and_check", "value": "basic_filter_clean_and_check", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.service_depth_required.options.full_cleaning_and_function_tests", "value": "full_cleaning_and_function_tests", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.service_depth_required.options.full_service_plus_detailed_system_health_report", "value": "full_service_plus_detailed_system_health_report", "order": 2 }
        ]
      },
      {
        "key": "priority_focus",
        "type": "single",
        "i18nKey": "hvac.regularAcServicing.questions.priority_focus.title",
        "required": true,
        "aiHint": "What matters most to the client from regular servicing.",
        "options": [
          { "i18nKey": "hvac.regularAcServicing.questions.priority_focus.options.reliability_and_preventing_breakdowns", "value": "reliability_and_preventing_breakdowns", "order": 0 },
          { "i18nKey": "hvac.regularAcServicing.questions.priority_focus.options.energy_efficiency", "value": "energy_efficiency", "order": 1 },
          { "i18nKey": "hvac.regularAcServicing.questions.priority_focus.options.air_quality_and_cleanliness", "value": "air_quality_and_cleanliness", "order": 2 },
          { "i18nKey": "hvac.regularAcServicing.questions.priority_focus.options.comfort_and_quiet_operation", "value": "comfort_and_quiet_operation", "order": 3 }
        ]
      }
    ],
    "question_order": [
      "environment_type",
      "system_mix",
      "approx_number_of_units",
      "usage_intensity",
      "current_known_issues",
      "service_depth_required",
      "priority_focus"
    ],
    "ai_prompt_template": "You are an HVAC professional arranging a regular AC servicing plan. Use the answers to describe the environment type, mix of systems, approximate number of units, usage intensity, any known issues, desired depth of service, and the client's main priorities. Produce a servicing scope summary suitable for a maintenance contract proposal, without including scheduling or price."
  }$json$::jsonb
),

-- 3. AC Installation
(
  gen_random_uuid(),
  'ac-installation',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "fa3a18f3-4f2b-4eb7-9f5b-4a3e8dd7a111",
    "category": "hvac",
    "name": "AC Installation",
    "slug": "ac-installation",
    "i18nPrefix": "hvac.acInstallation",
    "questions": [
      {
        "key": "system_type",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.system_type.title",
        "required": true,
        "aiHint": "Type of AC system the client wants installed.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.single_split_wall_unit", "value": "single_split_wall_unit", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.multi_split_several_indoor_units", "value": "multi_split_several_indoor_units", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.ducted_concealed_system", "value": "ducted_concealed_system", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.ceiling_cassette_unit", "value": "ceiling_cassette_unit", "order": 3 },
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.window_unit", "value": "window_unit", "order": 4 },
          { "i18nKey": "hvac.acInstallation.questions.system_type.options.not_sure_need_advice", "value": "not_sure_need_advice", "order": 5 }
        ]
      },
      {
        "key": "property_type",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.property_type.title",
        "required": true,
        "aiHint": "Type of property where the AC system will be installed.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.apartment_or_flat", "value": "apartment_or_flat", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.detached_or_semi_detached_house", "value": "detached_or_semi_detached_house", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.townhouse_or_duplex", "value": "townhouse_or_duplex", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.office_or_workspace", "value": "office_or_workspace", "order": 3 },
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.retail_or_hospitality_space", "value": "retail_or_hospitality_space", "order": 4 },
          { "i18nKey": "hvac.acInstallation.questions.property_type.options.other_property_type", "value": "other_property_type", "order": 5 }
        ]
      },
      {
        "key": "areas_to_cool",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.areas_to_cool.title",
        "required": true,
        "aiHint": "How much of the property needs cooling with this installation.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.areas_to_cool.options.single_small_room", "value": "single_small_room", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.areas_to_cool.options.single_large_room_or_open_plan", "value": "single_large_room_or_open_plan", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.areas_to_cool.options.two_to_three_rooms", "value": "two_to_three_rooms", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.areas_to_cool.options.whole_property_multiple_rooms", "value": "whole_property_multiple_rooms", "order": 3 }
        ]
      },
      {
        "key": "installation_scenario",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.installation_scenario.title",
        "required": true,
        "aiHint": "Whether this is a first-time install, replacement, or system expansion.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.installation_scenario.options.new_install_no_existing_system", "value": "new_install_no_existing_system", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.installation_scenario.options.replacing_old_unit_same_location", "value": "replacing_old_unit_same_location", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.installation_scenario.options.relocating_existing_system", "value": "relocating_existing_system", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.installation_scenario.options.adding_extra_units_to_existing_system", "value": "adding_extra_units_to_existing_system", "order": 3 }
        ]
      },
      {
        "key": "mounting_preference",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.mounting_preference.title",
        "required": true,
        "aiHint": "Preferred mounting style for the indoor AC units.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.mounting_preference.options.high_wall_mounted_units", "value": "high_wall_mounted_units", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.mounting_preference.options.ceiling_cassette_units", "value": "ceiling_cassette_units", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.mounting_preference.options.floor_console_units", "value": "floor_console_units", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.mounting_preference.options.fully_ducted_concealed", "value": "fully_ducted_concealed", "order": 3 },
          { "i18nKey": "hvac.acInstallation.questions.mounting_preference.options.no_strong_preference_need_advice", "value": "no_strong_preference_need_advice", "order": 4 }
        ]
      },
      {
        "key": "existing_preinstallation",
        "type": "single",
        "i18nKey": "hvac.acInstallation.questions.existing_preinstallation.title",
        "required": true,
        "aiHint": "Whether any AC pipework, drains or electrics are already in place.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.existing_preinstallation.options.full_preinstallation_pipes_and_cables_ready", "value": "full_preinstallation_pipes_and_cables_ready", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.existing_preinstallation.options.partial_preinstallation_some_pipes_or_cables", "value": "partial_preinstallation_some_pipes_or_cables", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.existing_preinstallation.options.no_existing_preinstallation", "value": "no_existing_preinstallation", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.existing_preinstallation.options.not_sure_what_is_installed", "value": "not_sure_what_is_installed", "order": 3 }
        ]
      },
      {
        "key": "special_requirements",
        "type": "multi",
        "i18nKey": "hvac.acInstallation.questions.special_requirements.title",
        "required": true,
        "aiHint": "Any specific performance, control or aesthetic requirements for the installation.",
        "options": [
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.very_quiet_operation", "value": "very_quiet_operation", "order": 0 },
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.high_energy_efficiency", "value": "high_energy_efficiency", "order": 1 },
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.wifi_or_smartphone_control", "value": "wifi_or_smartphone_control", "order": 2 },
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.low_visual_impact_minimal_visibility", "value": "low_visual_impact_minimal_visibility", "order": 3 },
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.allergy_or_air_quality_focus", "value": "allergy_or_air_quality_focus", "order": 4 },
          { "i18nKey": "hvac.acInstallation.questions.special_requirements.options.no_special_requirements", "value": "no_special_requirements", "order": 5 }
        ]
      }
    ],
    "question_order": [
      "system_type",
      "property_type",
      "areas_to_cool",
      "installation_scenario",
      "mounting_preference",
      "existing_preinstallation",
      "special_requirements"
    ],
    "ai_prompt_template": "You are an HVAC installer. Use the client's answers to describe the type of AC system requested, property type, areas to be cooled, whether this is a new install or replacement/expansion, preferred indoor unit mounting style, what preinstallation is already in place, and any special requirements (noise, efficiency, smart control, aesthetics). Produce a clear AC installation brief without mentioning exact dates, address or budget."
  }$json$::jsonb
),

-- 4. AC Maintenance
(
  gen_random_uuid(),
  'ac-maintenance',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "bd86b1f5-9a0a-4d44-b56f-2e9447c7d222",
    "category": "hvac",
    "name": "AC Maintenance",
    "slug": "ac-maintenance",
    "i18nPrefix": "hvac.acMaintenance",
    "questions": [
      {
        "key": "maintenance_reason",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.title",
        "required": true,
        "aiHint": "Main reason the client is requesting AC maintenance.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.options.routine_health_check", "value": "routine_health_check", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.options.performance_is_not_as_good_as_before", "value": "performance_is_not_as_good_as_before", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.options.intermittent_noise_or_vibration", "value": "intermittent_noise_or_vibration", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.options.preparing_for_high_use_season", "value": "preparing_for_high_use_season", "order": 3 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_reason.options.check_before_renting_or_selling_property", "value": "check_before_renting_or_selling_property", "order": 4 }
        ]
      },
      {
        "key": "system_coverage",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.system_coverage.title",
        "required": true,
        "aiHint": "Overall AC system configuration that maintenance should cover.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.system_coverage.options.single_split_system", "value": "single_split_system", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.system_coverage.options.several_split_systems_same_property", "value": "several_split_systems_same_property", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.system_coverage.options.one_ducted_or_cassette_system", "value": "one_ducted_or_cassette_system", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.system_coverage.options.mixed_system_types", "value": "mixed_system_types", "order": 3 }
        ]
      },
      {
        "key": "unit_age",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.unit_age.title",
        "required": true,
        "aiHint": "Approximate age of the AC units being maintained.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.unit_age.options.less_than_three_years_old", "value": "less_than_three_years_old", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.unit_age.options.between_three_and_seven_years_old", "value": "between_three_and_seven_years_old", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.unit_age.options.between_eight_and_twelve_years_old", "value": "between_eight_and_twelve_years_old", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.unit_age.options.older_than_twelve_years", "value": "older_than_twelve_years", "order": 3 },
          { "i18nKey": "hvac.acMaintenance.questions.unit_age.options.mix_of_different_ages", "value": "mix_of_different_ages", "order": 4 }
        ]
      },
      {
        "key": "previous_maintenance_pattern",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.previous_maintenance_pattern.title",
        "required": true,
        "aiHint": "How AC maintenance has been handled in the past.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.previous_maintenance_pattern.options.serviced_every_year", "value": "serviced_every_year", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.previous_maintenance_pattern.options.serviced_every_few_years", "value": "serviced_every_few_years", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.previous_maintenance_pattern.options.only_when_problems_occur", "value": "only_when_problems_occur", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.previous_maintenance_pattern.options.never_been_properly_serviced", "value": "never_been_properly_serviced", "order": 3 }
        ]
      },
      {
        "key": "current_minor_issues",
        "type": "multi",
        "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.title",
        "required": true,
        "aiHint": "Minor issues that should be checked during maintenance.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.options.slight_noise_or_vibration", "value": "slight_noise_or_vibration", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.options.weak_airflow_compared_to_before", "value": "weak_airflow_compared_to_before", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.options.slight_smell_when_unit_starts", "value": "slight_smell_when_unit_starts", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.options.water_drops_or_damp_near_unit", "value": "water_drops_or_damp_near_unit", "order": 3 },
          { "i18nKey": "hvac.acMaintenance.questions.current_minor_issues.options.no_specific_issues_just_maintenance", "value": "no_specific_issues_just_maintenance", "order": 4 }
        ]
      },
      {
        "key": "visual_condition_filters_and_coils",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.visual_condition_filters_and_coils.title",
        "required": true,
        "aiHint": "Client's impression of how clean or dirty the units seem.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.visual_condition_filters_and_coils.options.look_clean_or_light_dust", "value": "look_clean_or_light_dust", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.visual_condition_filters_and_coils.options.visibly_dusty_or_grey", "value": "visibly_dusty_or_grey", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.visual_condition_filters_and_coils.options.visible_mould_or_heavy_dirt", "value": "visible_mould_or_heavy_dirt", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.visual_condition_filters_and_coils.options.not_checked_inside_units", "value": "not_checked_inside_units", "order": 3 }
        ]
      },
      {
        "key": "maintenance_priority_outcome",
        "type": "single",
        "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.title",
        "required": true,
        "aiHint": "What outcome matters most to the client from this maintenance visit.",
        "options": [
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.options.restore_best_possible_performance", "value": "restore_best_possible_performance", "order": 0 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.options.reduce_noise_and_vibration", "value": "reduce_noise_and_vibration", "order": 1 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.options.prevent_future_breakdowns", "value": "prevent_future_breakdowns", "order": 2 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.options.extend_lifespan_of_units", "value": "extend_lifespan_of_units", "order": 3 },
          { "i18nKey": "hvac.acMaintenance.questions.maintenance_priority_outcome.options.general_health_report_on_system", "value": "general_health_report_on_system", "order": 4 }
        ]
      }
    ],
    "question_order": [
      "maintenance_reason",
      "system_coverage",
      "unit_age",
      "previous_maintenance_pattern",
      "current_minor_issues",
      "visual_condition_filters_and_coils",
      "maintenance_priority_outcome"
    ],
    "ai_prompt_template": "You are an HVAC technician planning a maintenance visit. Use the client's answers to explain why maintenance is requested, what type of system configuration is covered, approximate unit age, past maintenance pattern, minor issues to investigate, observed cleanliness of filters/coils, and the main outcome the client wants (performance, noise reduction, prevention, lifespan, or a health report). Produce a focused AC maintenance brief without dates, address or pricing."
  }$json$::jsonb
),

-- 5. AC System Upgrade or Replacement
(
  gen_random_uuid(),
  'ac-system-upgrade-replacement',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "00000000-0000-0000-0000-000000000001",
    "category": "hvac",
    "subcategory": "ac-installation-upgrades",
    "name": "AC System Upgrade or Replacement",
    "slug": "ac-system-upgrade-replacement",
    "i18nPrefix": "ac.system.upgrade.replacement",
    "questions": [
      {
        "key": "current_system_type",
        "type": "single",
        "i18nKey": "questions.current_system_type.title",
        "required": true,
        "aiHint": "Identifies the existing AC system type for replacement planning.",
        "options": [
          { "i18nKey": "questions.current_system_type.options.split", "value": "split", "order": 0 },
          { "i18nKey": "questions.current_system_type.options.multi_split", "value": "multi_split", "order": 1 },
          { "i18nKey": "questions.current_system_type.options.portable", "value": "portable", "order": 2 },
          { "i18nKey": "questions.current_system_type.options.window", "value": "window", "order": 3 },
          { "i18nKey": "questions.current_system_type.options.ducted", "value": "ducted", "order": 4 }
        ]
      },
      {
        "key": "reason_for_upgrade",
        "type": "single",
        "i18nKey": "questions.reason_for_upgrade.title",
        "required": true,
        "aiHint": "Clarifies the client's primary motivation for replacing the system.",
        "options": [
          { "i18nKey": "questions.reason_for_upgrade.options.not_cooling", "value": "not_cooling", "order": 0 },
          { "i18nKey": "questions.reason_for_upgrade.options.energy_efficiency", "value": "energy_efficiency", "order": 1 },
          { "i18nKey": "questions.reason_for_upgrade.options.too_old", "value": "too_old", "order": 2 },
          { "i18nKey": "questions.reason_for_upgrade.options.noisy", "value": "noisy", "order": 3 },
          { "i18nKey": "questions.reason_for_upgrade.options.larger_capacity_needed", "value": "larger_capacity_needed", "order": 4 }
        ]
      },
      {
        "key": "preferred_new_system",
        "type": "single",
        "i18nKey": "questions.preferred_new_system.title",
        "required": true,
        "aiHint": "Helps identify the target system for upgrade or replacement.",
        "options": [
          { "i18nKey": "questions.preferred_new_system.options.split", "value": "split", "order": 0 },
          { "i18nKey": "questions.preferred_new_system.options.multi_split", "value": "multi_split", "order": 1 },
          { "i18nKey": "questions.preferred_new_system.options.ducted", "value": "ducted", "order": 2 },
          { "i18nKey": "questions.preferred_new_system.options.heat_pump", "value": "heat_pump", "order": 3 },
          { "i18nKey": "questions.preferred_new_system.options.not_sure", "value": "not_sure", "order": 4 }
        ]
      },
      {
        "key": "existing_power_supply",
        "type": "single",
        "i18nKey": "questions.existing_power_supply.title",
        "required": true,
        "aiHint": "Ensures the electrical supply is adequate for the upgraded system.",
        "options": [
          { "i18nKey": "questions.existing_power_supply.options.standard_220v", "value": "standard_220v", "order": 0 },
          { "i18nKey": "questions.existing_power_supply.options.high_load_available", "value": "high_load_available", "order": 1 },
          { "i18nKey": "questions.existing_power_supply.options.not_sure", "value": "not_sure", "order": 2 }
        ]
      },
      {
        "key": "pipework_condition",
        "type": "single",
        "i18nKey": "questions.pipework_condition.title",
        "required": true,
        "aiHint": "Checks whether refrigerant pipes may need replacement.",
        "options": [
          { "i18nKey": "questions.pipework_condition.options.good", "value": "good", "order": 0 },
          { "i18nKey": "questions.pipework_condition.options.old", "value": "old", "order": 1 },
          { "i18nKey": "questions.pipework_condition.options.damaged", "value": "damaged", "order": 2 },
          { "i18nKey": "questions.pipework_condition.options.not_sure", "value": "not_sure", "order": 3 }
        ]
      },
      {
        "key": "preferred_efficiency_rating",
        "type": "single",
        "i18nKey": "questions.preferred_efficiency_rating.title",
        "required": true,
        "aiHint": "Indicates how energy efficient the client wants the new unit to be.",
        "options": [
          { "i18nKey": "questions.preferred_efficiency_rating.options.standard", "value": "standard", "order": 0 },
          { "i18nKey": "questions.preferred_efficiency_rating.options.high", "value": "high", "order": 1 },
          { "i18nKey": "questions.preferred_efficiency_rating.options.premium", "value": "premium", "order": 2 },
          { "i18nKey": "questions.preferred_efficiency_rating.options.not_sure", "value": "not_sure", "order": 3 }
        ]
      },
      {
        "key": "system_components_to_replace",
        "type": "single",
        "i18nKey": "questions.system_components_to_replace.title",
        "required": true,
        "aiHint": "Defines scope: full system, partial, or components.",
        "options": [
          { "i18nKey": "questions.system_components_to_replace.options.full_system", "value": "full_system", "order": 0 },
          { "i18nKey": "questions.system_components_to_replace.options.indoor_unit_only", "value": "indoor_unit_only", "order": 1 },
          { "i18nKey": "questions.system_components_to_replace.options.outdoor_unit_only", "value": "outdoor_unit_only", "order": 2 },
          { "i18nKey": "questions.system_components_to_replace.options.pipework_only", "value": "pipework_only", "order": 3 }
        ]
      }
    ]
  }$json$::jsonb
),

-- 6. AC Unit Relocation
(
  gen_random_uuid(),
  'ac-unit-relocation',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "00000000-0000-0000-0000-000000000002",
    "category": "hvac",
    "subcategory": "ac-installation-upgrades",
    "name": "AC Unit Relocation",
    "slug": "ac-unit-relocation",
    "i18nPrefix": "ac.unit.relocation",
    "questions": [
      {
        "key": "unit_type",
        "type": "single",
        "i18nKey": "questions.unit_type.title",
        "required": true,
        "aiHint": "Identifies which AC unit needs relocation.",
        "options": [
          { "i18nKey": "questions.unit_type.options.indoor", "value": "indoor", "order": 0 },
          { "i18nKey": "questions.unit_type.options.outdoor", "value": "outdoor", "order": 1 },
          { "i18nKey": "questions.unit_type.options.both", "value": "both", "order": 2 }
        ]
      },
      {
        "key": "distance_of_relocation",
        "type": "single",
        "i18nKey": "questions.distance_of_relocation.title",
        "required": true,
        "aiHint": "Indicates how far the unit is moving from the original location.",
        "options": [
          { "i18nKey": "questions.distance_of_relocation.options.less_than_2m", "value": "less_than_2m", "order": 0 },
          { "i18nKey": "questions.distance_of_relocation.options.two_to_five_m", "value": "2_to_5m", "order": 1 },
          { "i18nKey": "questions.distance_of_relocation.options.more_than_5m", "value": "more_than_5m", "order": 2 }
        ]
      },
      {
        "key": "new_mounting_surface",
        "type": "single",
        "i18nKey": "questions.new_mounting_surface.title",
        "required": true,
        "aiHint": "Clarifies the type of surface the unit will be mounted on.",
        "options": [
          { "i18nKey": "questions.new_mounting_surface.options.brick", "value": "brick", "order": 0 },
          { "i18nKey": "questions.new_mounting_surface.options.concrete", "value": "concrete", "order": 1 },
          { "i18nKey": "questions.new_mounting_surface.options.plasterboard", "value": "plasterboard", "order": 2 },
          { "i18nKey": "questions.new_mounting_surface.options.metal_frame", "value": "metal_frame", "order": 3 }
        ]
      },
      {
        "key": "pipework_extension_needed",
        "type": "single",
        "i18nKey": "questions.pipework_extension_needed.title",
        "required": true,
        "aiHint": "Determines whether refrigerant lines need extension.",
        "options": [
          { "i18nKey": "questions.pipework_extension_needed.options.yes", "value": "yes", "order": 0 },
          { "i18nKey": "questions.pipework_extension_needed.options.no", "value": "no", "order": 1 },
          { "i18nKey": "questions.pipework_extension_needed.options.not_sure", "value": "not_sure", "order": 2 }
        ]
      },
      {
        "key": "drainage_adjustment",
        "type": "single",
        "i18nKey": "questions.drainage_adjustment.title",
        "required": true,
        "aiHint": "Checks if the condensate drainage will require modification.",
        "options": [
          { "i18nKey": "questions.drainage_adjustment.options.needed", "value": "needed", "order": 0 },
          { "i18nKey": "questions.drainage_adjustment.options.not_needed", "value": "not_needed", "order": 1 },
          { "i18nKey": "questions.drainage_adjustment.options.not_sure", "value": "not_sure", "order": 2 }
        ]
      },
      {
        "key": "electrical_cable_extension",
        "type": "single",
        "i18nKey": "questions.electrical_cable_extension.title",
        "required": true,
        "aiHint": "Determines if power cables require extending.",
        "options": [
          { "i18nKey": "questions.electrical_cable_extension.options.yes", "value": "yes", "order": 0 },
          { "i18nKey": "questions.electrical_cable_extension.options.no", "value": "no", "order": 1 },
          { "i18nKey": "questions.electrical_cable_extension.options.not_sure", "value": "not_sure", "order": 2 }
        ]
      },
      {
        "key": "relocation_reason",
        "type": "single",
        "i18nKey": "questions.relocation_reason.title",
        "required": true,
        "aiHint": "Explains why the client wants the unit moved.",
        "options": [
          { "i18nKey": "questions.relocation_reason.options.noise", "value": "noise", "order": 0 },
          { "i18nKey": "questions.relocation_reason.options.aesthetic", "value": "aesthetic", "order": 1 },
          { "i18nKey": "questions.relocation_reason.options.obstruction", "value": "obstruction", "order": 2 },
          { "i18nKey": "questions.relocation_reason.options.room_layout_change", "value": "room_layout_change", "order": 3 }
        ]
      }
    ]
  }$json$::jsonb
),

-- 7. Ducted AC Installation
(
  gen_random_uuid(),
  'ducted-ac-installation',
  1,
  'approved',
  'manual',
  true,
  $json${
    "id": "00000000-0000-0000-0000-000000000003",
    "category": "hvac",
    "subcategory": "ac-installation-upgrades",
    "name": "Ducted AC Installation",
    "slug": "ducted-ac-installation",
    "i18nPrefix": "ac.ducted.installation",
    "questions": [
      {
        "key": "property_type",
        "type": "single",
        "i18nKey": "questions.property_type.title",
        "required": true,
        "aiHint": "Defines building type so installer can plan ducting and unit positions.",
        "options": [
          { "i18nKey": "questions.property_type.options.apartment", "value": "apartment", "order": 0 },
          { "i18nKey": "questions.property_type.options.villa", "value": "villa", "order": 1 },
          { "i18nKey": "questions.property_type.options.commercial", "value": "commercial", "order": 2 }
        ]
      },
      {
        "key": "ducting_space_availability",
        "type": "single",
        "i18nKey": "questions.ducting_space_availability.title",
        "required": true,
        "aiHint": "Checks if there is enough space for ducts in ceilings or walls.",
        "options": [
          { "i18nKey": "questions.ducting_space_availability.options.false_ceiling", "value": "false_ceiling", "order": 0 },
          { "i18nKey": "questions.ducting_space_availability.options.attic_space", "value": "attic_space", "order": 1 },
          { "i18nKey": "questions.ducting_space_availability.options.wall_voids", "value": "wall_voids", "order": 2 },
          { "i18nKey": "questions.ducting_space_availability.options.not_sure", "value": "not_sure", "order": 3 }
        ]
      },
      {
        "key": "rooms_to_connect",
        "type": "single",
        "i18nKey": "questions.rooms_to_connect.title",
        "required": true,
        "aiHint": "Indicates how many rooms must be fed by the duct system.",
        "options": [
          { "i18nKey": "questions.rooms_to_connect.options.one_to_two", "value": "1-2", "order": 0 },
          { "i18nKey": "questions.rooms_to_connect.options.three_to_four", "value": "3-4", "order": 1 },
          { "i18nKey": "questions.rooms_to_connect.options.five_plus", "value": "5+", "order": 2 }
        ]
      },
      {
        "key": "preferred_outlet_style",
        "type": "single",
        "i18nKey": "questions.preferred_outlet_style.title",
        "required": true,
        "aiHint": "Specifies vent grille style for aesthetics and airflow.",
        "options": [
          { "i18nKey": "questions.preferred_outlet_style.options.linear_slot", "value": "linear_slot", "order": 0 },
          { "i18nKey": "questions.preferred_outlet_style.options.square_diffuser", "value": "square_diffuser", "order": 1 },
          { "i18nKey": "questions.preferred_outlet_style.options.round_diffuser", "value": "round_diffuser", "order": 2 }
        ]
      },
      {
        "key": "control_system_preference",
        "type": "single",
        "i18nKey": "questions.control_system_preference.title",
        "required": true,
        "aiHint": "Determines how the ducted system should be controlled.",
        "options": [
          { "i18nKey": "questions.control_system_preference.options.single_zone", "value": "single_zone", "order": 0 },
          { "i18nKey": "questions.control_system_preference.options.multi_zone", "value": "multi_zone", "order": 1 },
          { "i18nKey": "questions.control_system_preference.options.smart_app", "value": "smart_app", "order": 2 }
        ]
      },
      {
        "key": "ceiling_type",
        "type": "single",
        "i18nKey": "questions.ceiling_type.title",
        "required": true,
        "aiHint": "Identifies ceiling material for fixing ducts and vents.",
        "options": [
          { "i18nKey": "questions.ceiling_type.options.plasterboard", "value": "plasterboard", "order": 0 },
          { "i18nKey": "questions.ceiling_type.options.concrete", "value": "concrete", "order": 1 },
          { "i18nKey": "questions.ceiling_type.options.wood", "value": "wood", "order": 2 }
        ]
      },
      {
        "key": "preferred_efficiency_level",
        "type": "single",
        "i18nKey": "questions.preferred_efficiency_level.title",
        "required": true,
        "aiHint": "Determines SEER rating or energy efficiency preference.",
        "options": [
          { "i18nKey": "questions.preferred_efficiency_level.options.standard", "value": "standard", "order": 0 },
          { "i18nKey": "questions.preferred_efficiency_level.options.high", "value": "high", "order": 1 },
          { "i18nKey": "questions.preferred_efficiency_level.options.premium", "value": "premium", "order": 2 }
        ]
      }
    ]
  }$json$::jsonb
)

ON CONFLICT (micro_slug, version) DO NOTHING;