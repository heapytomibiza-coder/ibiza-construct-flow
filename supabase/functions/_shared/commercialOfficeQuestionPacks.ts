/**
 * Commercial & Office Question Packs
 * Covers: Planned Maintenance Contracts, Shopfront/Facade Repairs, Office Partitions, Office Renovation
 */

export const commercialOfficeQuestionPacks = [
  {
    microSlug: 'planned-maintenance-contracts',
    categorySlug: 'commercial-industrial',
    version: 1,
    questions: [
      {
        id: 'portfolio_type',
        question: 'What type of sites does the maintenance contract cover?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_commercial_site', label: 'Single commercial site' },
          { value: 'multiple_units_same_building', label: 'Multiple units in the same building' },
          { value: 'multiple_sites_portfolio', label: 'Multiple sites across a portfolio' }
        ]
      },
      {
        id: 'disciplines_in_scope',
        question: 'Which trades and systems should the contract cover?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'general_fabric_repairs', label: 'General fabric repairs' },
          { value: 'electrical_systems', label: 'Electrical systems' },
          { value: 'plumbing_and_drains', label: 'Plumbing and drains' },
          { value: 'hvac_and_air_con', label: 'HVAC and air conditioning' },
          { value: 'fire_safety_equipment', label: 'Fire safety equipment' }
        ]
      },
      {
        id: 'service_style',
        question: 'What level of service is required?',
        type: 'radio',
        required: true,
        options: [
          { value: 'inspection_only_with_reports', label: 'Inspection only with reports' },
          { value: 'inspection_plus_small_repairs', label: 'Inspection plus small repairs' },
          { value: 'full_preventative_and_reactive', label: 'Full preventative and reactive service' }
        ]
      },
      {
        id: 'asset_register_status',
        question: 'Do you have an existing asset register?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no_existing_register', label: 'No existing register' },
          { value: 'basic_list_only', label: 'Basic list only' },
          { value: 'formal_asset_register_in_place', label: 'Formal asset register in place' }
        ]
      },
      {
        id: 'compliance_focus',
        question: 'Which compliance areas are most important?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'electrical_testing', label: 'Electrical testing' },
          { value: 'fire_alarm_and_extinguishers', label: 'Fire alarm and extinguishers' },
          { value: 'emergency_lighting_checks', label: 'Emergency lighting checks' },
          { value: 'water_hygiene_and_legionella', label: 'Water hygiene and legionella' }
        ]
      },
      {
        id: 'reporting_requirement',
        question: 'What level of reporting do you need?',
        type: 'radio',
        required: false,
        options: [
          { value: 'basic_visit_notes', label: 'Basic visit notes' },
          { value: 'structured_checklists', label: 'Structured checklists' },
          { value: 'full_digital_reports_with_photos', label: 'Full digital reports with photos' }
        ]
      }
    ]
  },
  {
    microSlug: 'shopfront-facade-repairs',
    categorySlug: 'commercial-industrial',
    version: 1,
    questions: [
      {
        id: 'frontage_type',
        question: 'What type of shopfront or facade needs repair?',
        type: 'radio',
        required: true,
        options: [
          { value: 'full_glazed_shopfront', label: 'Full glazed shopfront' },
          { value: 'framed_glass_with_panels', label: 'Framed glass with panels' },
          { value: 'solid_masonry_or_render', label: 'Solid masonry or render' },
          { value: 'mixed_materials', label: 'Mixed materials' }
        ]
      },
      {
        id: 'main_issues',
        question: 'What are the main repair problems?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'damaged_or_cracked_glass', label: 'Damaged or cracked glass' },
          { value: 'rotted_or_damaged_frames', label: 'Rotted or damaged frames' },
          { value: 'peeling_paint_or_stained_finish', label: 'Peeling paint or stained finish' },
          { value: 'cracked_render_or_masonry', label: 'Cracked render or masonry' },
          { value: 'leaking_or_draughts', label: 'Leaking or draughts' }
        ]
      },
      {
        id: 'signage_and_branding',
        question: 'Does the work involve signage or branding?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'signage_repair_only', label: 'Signage repair only' },
          { value: 'new_signage_to_be_installed', label: 'New signage to be installed' },
          { value: 'lighting_for_signage', label: 'Lighting for signage' },
          { value: 'no_signage_works', label: 'No signage works' }
        ]
      },
      {
        id: 'security_elements',
        question: 'Which security elements are included?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'shutters_or_grilles', label: 'Shutters or grilles' },
          { value: 'locks_and_hardware', label: 'Locks and hardware' },
          { value: 'security_glazing_or_lamination', label: 'Security glazing or lamination' },
          { value: 'no_security_changes', label: 'No security changes' }
        ]
      },
      {
        id: 'weather_exposure_level',
        question: 'What is the weather exposure level?',
        type: 'radio',
        required: false,
        options: [
          { value: 'sheltered_or_covered', label: 'Sheltered or covered' },
          { value: 'standard_street_exposure', label: 'Standard street exposure' },
          { value: 'high_wind_or_coastal_exposure', label: 'High wind or coastal exposure' }
        ]
      },
      {
        id: 'appearance_goal',
        question: 'What is the target appearance level?',
        type: 'radio',
        required: false,
        options: [
          { value: 'make_safe_and_tidy', label: 'Make safe and tidy' },
          { value: 'smart_refresh_to_match_existing', label: 'Smart refresh to match existing' },
          { value: 'full_visual_upgrade', label: 'Full visual upgrade' }
        ]
      }
    ]
  },
  {
    microSlug: 'office-partitions',
    categorySlug: 'office-fitouts',
    version: 1,
    questions: [
      {
        id: 'partition_purpose',
        question: 'Why are partitions being installed or changed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'create_private_offices', label: 'Create private offices' },
          { value: 'add_meeting_rooms', label: 'Add meeting rooms' },
          { value: 'subdivide_open_plan', label: 'Subdivide open plan space' },
          { value: 'improve_acoustics_privacy', label: 'Improve acoustics and privacy' }
        ]
      },
      {
        id: 'partition_type',
        question: 'What type of partition construction is needed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'solid_plasterboard', label: 'Solid plasterboard' },
          { value: 'glazed_partitions', label: 'Glazed partitions' },
          { value: 'half_glazed_half_solid', label: 'Half glazed, half solid' },
          { value: 'demountable_system', label: 'Demountable system' }
        ]
      },
      {
        id: 'acoustic_requirement',
        question: 'What level of sound performance is required?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_office', label: 'Standard office' },
          { value: 'enhanced_meeting_room', label: 'Enhanced meeting room' },
          { value: 'high_privacy_confidential', label: 'High privacy / confidential' }
        ]
      },
      {
        id: 'door_integration',
        question: 'What door and access requirements are needed?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'standard_swing_doors', label: 'Standard swing doors' },
          { value: 'frameless_glass_doors', label: 'Frameless glass doors' },
          { value: 'sliding_or_pocket_doors', label: 'Sliding or pocket doors' },
          { value: 'no_doors_required', label: 'No doors required' }
        ]
      },
      {
        id: 'services_in_partitions',
        question: 'Which services need to be routed through partitions?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'power_sockets', label: 'Power sockets' },
          { value: 'data_points', label: 'Data points' },
          { value: 'switches_controls', label: 'Switches and controls' },
          { value: 'no_services_required', label: 'No services required' }
        ]
      },
      {
        id: 'finish_level',
        question: 'What visual finish level is expected?',
        type: 'radio',
        required: false,
        options: [
          { value: 'basic_practical', label: 'Basic / practical' },
          { value: 'smart_professional', label: 'Smart / professional' },
          { value: 'high_end_corporate', label: 'High-end / corporate' }
        ]
      }
    ]
  },
  {
    microSlug: 'office-renovation',
    categorySlug: 'office-fitouts',
    version: 1,
    questions: [
      {
        id: 'renovation_scope',
        question: 'Which elements of the office are being renovated?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'layout_and_partitions', label: 'Layout and partitions' },
          { value: 'flooring_and_finishes', label: 'Flooring and finishes' },
          { value: 'lighting_and_power', label: 'Lighting and power' },
          { value: 'reception_and_front_of_house', label: 'Reception and front of house' },
          { value: 'kitchenette_and_breakout', label: 'Kitchenette and breakout areas' }
        ]
      },
      {
        id: 'existing_condition',
        question: 'What is the current condition of the space?',
        type: 'radio',
        required: true,
        options: [
          { value: 'fair_with_minor_wear', label: 'Fair with minor wear' },
          { value: 'tired_needs_full_refresh', label: 'Tired, needs full refresh' },
          { value: 'poor_condition_or_damaged', label: 'Poor condition or damaged' }
        ]
      },
      {
        id: 'workspace_style',
        question: 'What workspace style is planned?',
        type: 'radio',
        required: false,
        options: [
          { value: 'mainly_open_plan', label: 'Mainly open plan' },
          { value: 'mix_of_open_and_cellular', label: 'Mix of open and cellular' },
          { value: 'mostly_private_offices', label: 'Mostly private offices' }
        ]
      },
      {
        id: 'tech_integration',
        question: 'What level of tech/AV integration is needed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_data_points', label: 'Standard data points' },
          { value: 'video_conference_rooms', label: 'Video conference rooms' },
          { value: 'smart_control_and_automation', label: 'Smart control and automation' }
        ]
      },
      {
        id: 'design_tone',
        question: 'What is the overall design style?',
        type: 'radio',
        required: false,
        options: [
          { value: 'clean_corporate', label: 'Clean / corporate' },
          { value: 'creative_informal', label: 'Creative / informal' },
          { value: 'high_end_executive', label: 'High-end / executive' }
        ]
      },
      {
        id: 'sustainability_preference',
        question: 'What is the sustainability focus?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no_specific_focus', label: 'No specific focus' },
          { value: 'prefer_sustainable_materials', label: 'Prefer sustainable materials' },
          { value: 'strong_green_build_focus', label: 'Strong green building focus' }
        ]
      }
    ]
  }
];
