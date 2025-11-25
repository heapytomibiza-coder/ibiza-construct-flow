/**
 * Question packs for Commercial, Office, Retail, Kitchen, Bathroom, Storage, Extensions, Brickwork, Pool, Spa, Water Treatment, Painting/Decorating Exterior, Interior & Specialist, Floors/Doors/Windows services
 * Manually crafted and curated
 */

export const commercialOfficeQuestionPacks = [
  // 1. Planned Maintenance Contracts
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

  // 2. Shopfront and Facade Repairs
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

  // 3. Office Partitions
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

  // 4. Office Renovation
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
  },

  // 5. Retail Display (Updated v2)
  {
    microSlug: 'retail-display',
    categorySlug: 'retail-spaces',
    version: 2,
    questions: [
      {
        id: 'display_type',
        question: 'What type of retail display do you need?',
        type: 'radio',
        required: true,
        options: [
          { value: 'wall_mounted_display', label: 'Wall-mounted display' },
          { value: 'free_standing_unit', label: 'Free-standing unit' },
          { value: 'window_display', label: 'Window display' },
          { value: 'counter_top_display', label: 'Counter-top display' },
          { value: 'product_shelving', label: 'Product shelving' },
          { value: 'mannequin_setup', label: 'Mannequin setup' },
          { value: 'mixed_displays', label: 'Mixed displays' }
        ]
      },
      {
        id: 'product_type',
        question: 'What products will the display hold?',
        type: 'radio',
        required: true,
        options: [
          { value: 'clothing', label: 'Clothing' },
          { value: 'accessories', label: 'Accessories' },
          { value: 'footwear', label: 'Footwear' },
          { value: 'beauty_cosmetics', label: 'Beauty / cosmetics' },
          { value: 'food_packaged_goods', label: 'Food / packaged goods' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'general_retail_items', label: 'General retail items' }
        ]
      },
      {
        id: 'display_style',
        question: 'What is your preferred display style?',
        type: 'radio',
        required: false,
        options: [
          { value: 'minimal_modern', label: 'Minimal & modern' },
          { value: 'rustic_natural', label: 'Rustic / natural' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'luxury_premium', label: 'Luxury / premium' },
          { value: 'high_impact_visual', label: 'High-impact visual' },
          { value: 'functional_simple', label: 'Functional & simple' }
        ]
      },
      {
        id: 'materials',
        question: 'What materials do you prefer?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'wood', label: 'Wood' },
          { value: 'metal', label: 'Metal' },
          { value: 'glass', label: 'Glass' },
          { value: 'acrylic', label: 'Acrylic' },
          { value: 'mixed_materials', label: 'Mixed materials' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'lighting',
        question: 'Do you need integrated lighting?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_full_led_integration', label: 'Yes – full LED integration' },
          { value: 'spotlights', label: 'Spotlights' },
          { value: 'backlit_panels', label: 'Backlit panels' },
          { value: 'no_lighting_required', label: 'No lighting required' }
        ]
      },
      {
        id: 'branding',
        question: 'Will the display need branding or graphics?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_logo_printing', label: 'Yes – logo printing' },
          { value: 'yes_vinyl_graphics', label: 'Yes – vinyl graphics' },
          { value: 'yes_full_brand_wall', label: 'Yes – full brand wall' },
          { value: 'no_branding_needed', label: 'No branding needed' }
        ]
      },
      {
        id: 'display_area',
        question: 'What is the expected installation area size?',
        type: 'radio',
        required: false,
        options: [
          { value: 'small_0_3m', label: 'Small (0–3m)' },
          { value: 'medium_3_6m', label: 'Medium (3–6m)' },
          { value: 'large_6_12m', label: 'Large (6–12m)' },
          { value: 'entire_shop_front', label: 'Entire shop front' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      }
    ]
  },

  // 6. Shop Fitting (Updated v2)
  {
    microSlug: 'shop-fitting',
    categorySlug: 'retail-spaces',
    version: 2,
    questions: [
      {
        id: 'shop_type',
        question: 'What type of shop are you fitting out?',
        type: 'radio',
        required: true,
        options: [
          { value: 'fashion_retail', label: 'Fashion retail' },
          { value: 'food_beverage', label: 'Food & beverage' },
          { value: 'beauty_cosmetics', label: 'Beauty / cosmetics' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'convenience_general_store', label: 'Convenience / general store' },
          { value: 'luxury_retail', label: 'Luxury retail' },
          { value: 'pop_up_shop', label: 'Pop-up shop' }
        ]
      },
      {
        id: 'fit_elements',
        question: 'What elements do you need installed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'shelving_storage', label: 'Shelving & storage' },
          { value: 'counters_tills', label: 'Counters & tills' },
          { value: 'changing_rooms', label: 'Changing rooms' },
          { value: 'wall_panelling', label: 'Wall panelling' },
          { value: 'product_display_units', label: 'Product display units' },
          { value: 'back_of_house_storage', label: 'Back-of-house storage' },
          { value: 'full_interior_build', label: 'Full interior build' }
        ]
      },
      {
        id: 'custom_furniture',
        question: 'Do you require custom-built furniture?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_full_custom', label: 'Yes – full custom' },
          { value: 'yes_certain_items', label: 'Yes – certain items' },
          { value: 'no_prefabricated_items', label: 'No – prefabricated items' },
          { value: 'not_sure_yet', label: 'Not sure yet' }
        ]
      },
      {
        id: 'lighting_type',
        question: 'What type of lighting do you require?',
        type: 'radio',
        required: false,
        options: [
          { value: 'track_lighting', label: 'Track lighting' },
          { value: 'spotlights', label: 'Spotlights' },
          { value: 'led_strips', label: 'LED strips' },
          { value: 'ambient_retail_lighting', label: 'Ambient retail lighting' },
          { value: 'no_lighting_required', label: 'No lighting required' }
        ]
      },
      {
        id: 'electrical_work',
        question: 'Do you need electrical installations?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_new_wiring', label: 'Yes – new wiring' },
          { value: 'yes_new_sockets', label: 'Yes – new sockets' },
          { value: 'yes_lighting_only', label: 'Yes – lighting only' },
          { value: 'no_electrical_work_needed', label: 'No electrical work needed' }
        ]
      },
      {
        id: 'flooring',
        question: 'What is the flooring situation?',
        type: 'radio',
        required: false,
        options: [
          { value: 'install_new_flooring', label: 'Install new flooring' },
          { value: 'restore_existing_flooring', label: 'Restore existing flooring' },
          { value: 'no_flooring_work', label: 'No flooring work' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'branding_needs',
        question: 'Is branding required for the fit-out?',
        type: 'radio',
        required: false,
        options: [
          { value: 'logo_walls', label: 'Logo walls' },
          { value: 'signage_installation', label: 'Signage installation' },
          { value: 'full_brand_theme', label: 'Full brand theme' },
          { value: 'no_branding_needed', label: 'No branding needed' }
        ]
      },
      {
        id: 'space_condition',
        question: 'What is the current condition of the space?',
        type: 'radio',
        required: true,
        options: [
          { value: 'empty_shell', label: 'Empty shell' },
          { value: 'partially_fitted', label: 'Partially fitted' },
          { value: 'fully_fitted_needs_replacing', label: 'Fully fitted but needs replacing' },
          { value: 'operational_needs_upgrades', label: 'Operational and needs upgrades' }
        ]
      }
    ]
  },

  // 7. Accessible and Mobility Bathrooms
  {
    microSlug: 'accessible-mobility-bathrooms',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'user_mobility_needs',
        question: 'Who is the bathroom being adapted for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'wheelchair_user', label: 'Wheelchair user' },
          { value: 'walker_frame_user', label: 'Walker / frame user' },
          { value: 'limited_mobility_no_aids', label: 'Limited mobility (no aids)' },
          { value: 'elderly_fall_risk', label: 'Elderly – fall risk' },
          { value: 'child_additional_needs', label: 'Child with additional needs' },
          { value: 'general_future_proofing', label: 'General future-proofing' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
        ]
      },
      {
        id: 'access_priorities',
        question: 'What are the main access priorities?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'step_free_level_access_shower', label: 'Step-free / level access shower' },
          { value: 'space_wheelchair_turning', label: 'Space for wheelchair turning' },
          { value: 'easier_toilet_access', label: 'Easier toilet access' },
          { value: 'safer_bathing_showering', label: 'Safer bathing / showering' },
          { value: 'support_standing_sitting', label: 'Support when standing / sitting' },
          { value: 'easier_carer_assistance', label: 'Easier carer assistance' }
        ]
      },
      {
        id: 'key_adaptations',
        question: 'Which features would you like to include?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'level_access_walk_in_shower', label: 'Level-access / walk-in shower' },
          { value: 'low_walk_in_bath', label: 'Low or walk-in bath' },
          { value: 'grab_rails', label: 'Grab rails' },
          { value: 'fold_down_shower_seat', label: 'Fold-down shower seat' },
          { value: 'raised_comfort_height_toilet', label: 'Raised or comfort-height toilet' },
          { value: 'non_slip_flooring', label: 'Non-slip flooring' },
          { value: 'handheld_shower_riser_rail', label: 'Handheld shower with riser rail' }
        ]
      },
      {
        id: 'door_and_space',
        question: 'How is the current access and space?',
        type: 'radio',
        required: false,
        options: [
          { value: 'wide_doorway_good_space', label: 'Wide doorway, good space' },
          { value: 'standard_doorway_limited_space', label: 'Standard doorway, limited space' },
          { value: 'narrow_doorway_tight_space', label: 'Narrow doorway, very tight space' },
          { value: 'not_sure_need_advice', label: 'Not sure / need advice' }
        ]
      },
      {
        id: 'current_layout',
        question: 'What best describes your current bathroom layout?',
        type: 'radio',
        required: false,
        options: [
          { value: 'bath_only', label: 'Bath only' },
          { value: 'shower_only', label: 'Shower only' },
          { value: 'bath_separate_shower', label: 'Bath and separate shower' },
          { value: 'small_cloakroom_wc', label: 'Small cloakroom / WC' },
          { value: 'empty_room_refurbishment', label: 'Empty room or full refurbishment' }
        ]
      },
      {
        id: 'floor_type',
        question: 'What type of floor structure do you have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_concrete_floor', label: 'Solid concrete floor' },
          { value: 'timber_suspended_floor', label: 'Timber / suspended floor' },
          { value: 'apartment_floor_not_ground', label: 'Apartment floor (not ground level)' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'safety_preferences',
        question: 'Are there any extra safety preferences?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'maximum_non_slip_surfaces', label: 'Maximum non-slip surfaces' },
          { value: 'easy_to_use_taps_controls', label: 'Easy-to-use taps and controls' },
          { value: 'no_glass_doors_if_possible', label: 'No glass doors if possible' },
          { value: 'rounded_edges_no_sharp_corners', label: 'Rounded edges / no sharp corners' },
          { value: 'low_maintenance_easy_cleaning', label: 'Low maintenance / easy cleaning' },
          { value: 'need_professional_advice', label: 'Need professional advice' }
        ]
      }
    ]
  },

  // 8. Bathroom Waterproofing and Tanking
  {
    microSlug: 'bathroom-waterproofing-tanking',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'waterproof_area',
        question: 'Which area needs waterproofing or tanking?',
        type: 'radio',
        required: true,
        options: [
          { value: 'shower_enclosure_only', label: 'Shower enclosure only' },
          { value: 'bath_area_only', label: 'Bath area only' },
          { value: 'full_wetroom_entire_bathroom', label: 'Full wetroom / entire bathroom' },
          { value: 'single_wall_section', label: 'Single wall or section' },
          { value: 'floor_only', label: 'Floor only' },
          { value: 'not_sure_need_advice', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'project_type',
        question: 'Is this a new installation or solving a problem?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_bathroom_remodel', label: 'New bathroom / remodel' },
          { value: 'converting_to_wetroom', label: 'Converting to wetroom' },
          { value: 'existing_leaks_water_damage', label: 'Existing leaks or water damage' },
          { value: 'preventative_waterproofing', label: 'Preventative waterproofing' },
          { value: 'landlord_compliance_upgrade', label: 'Landlord / compliance upgrade' }
        ]
      },
      {
        id: 'substrate_type',
        question: 'What is the current surface or substrate?',
        type: 'radio',
        required: false,
        options: [
          { value: 'plasterboard_walls', label: 'Plasterboard walls' },
          { value: 'solid_masonry_walls', label: 'Solid masonry walls' },
          { value: 'timber_chipboard_floor', label: 'Timber / chipboard floor' },
          { value: 'concrete_floor', label: 'Concrete floor' },
          { value: 'existing_tiles', label: 'Existing tiles' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'visible_issues',
        question: 'Are there any visible issues at the moment?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'damp_patches', label: 'Damp patches' },
          { value: 'mould_mildew', label: 'Mould or mildew' },
          { value: 'loose_cracked_tiles', label: 'Loose or cracked tiles' },
          { value: 'water_staining_ceiling_below', label: 'Water staining on ceiling below' },
          { value: 'swollen_floor_boards', label: 'Swollen floor or boards' },
          { value: 'no_visible_issues', label: 'No visible issues' }
        ]
      },
      {
        id: 'finish_type',
        question: 'What type of final finish will go over the waterproofing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'ceramic_porcelain_tiles', label: 'Ceramic / porcelain tiles' },
          { value: 'natural_stone_tiles', label: 'Natural stone tiles' },
          { value: 'microcement_seamless_finish', label: 'Microcement / seamless finish' },
          { value: 'vinyl_floor_covering', label: 'Vinyl floor covering' },
          { value: 'unsure_need_recommendations', label: 'Unsure – need recommendations' }
        ]
      },
      {
        id: 'underfloor_heating',
        question: 'Is there, or will there be, underfloor heating?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_already_installed', label: 'Yes – already installed' },
          { value: 'yes_will_be_added', label: 'Yes – will be added' },
          { value: 'no_underfloor_heating', label: 'No underfloor heating' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'room_level',
        question: 'Where is the bathroom located in the property?',
        type: 'radio',
        required: false,
        options: [
          { value: 'ground_floor', label: 'Ground floor' },
          { value: 'upper_floor', label: 'Upper floor' },
          { value: 'basement', label: 'Basement' },
          { value: 'loft_attic_conversion', label: 'Loft / attic conversion' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      }
    ]
  },

  // 9. Walk-in Shower Conversions
  {
    microSlug: 'walk-in-shower-conversions',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'current_setup',
        question: 'What are you converting into a walk-in shower?',
        type: 'radio',
        required: true,
        options: [
          { value: 'standard_bath', label: 'Standard bath' },
          { value: 'shower_over_bath', label: 'Shower over bath' },
          { value: 'raised_shower_tray', label: 'Raised shower tray' },
          { value: 'old_walk_in_dated_shower', label: 'Old walk-in / dated shower' },
          { value: 'empty_stripped_out_space', label: 'Empty or stripped-out space' }
        ]
      },
      {
        id: 'shower_access_type',
        question: 'What type of walk-in shower are you looking for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'fully_level_access_flush', label: 'Fully level-access (flush with floor)' },
          { value: 'low_profile_shower_tray', label: 'Low-profile shower tray' },
          { value: 'wetroom_style_screen', label: 'Wetroom-style with screen' },
          { value: 'open_walk_in_minimal_screens', label: 'Open walk-in with minimal screens' },
          { value: 'need_advice_best_option', label: 'Need advice on best option' }
        ]
      },
      {
        id: 'screens_and_doors',
        question: 'What style of screens or doors do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'fixed_glass_panel', label: 'Fixed glass panel' },
          { value: 'walk_in_single_screen', label: 'Walk-in with single screen' },
          { value: 'sliding_door', label: 'Sliding door' },
          { value: 'hinged_door', label: 'Hinged door' },
          { value: 'no_screens_if_possible', label: 'No screens if possible' },
          { value: 'not_sure_yet', label: 'Not sure yet' }
        ]
      },
      {
        id: 'drainage_option',
        question: 'What type of drainage do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'linear_channel_drain', label: 'Linear / channel drain' },
          { value: 'square_point_drain', label: 'Square point drain' },
          { value: 'use_existing_drain_position', label: 'Use existing drain position' },
          { value: 'open_installer_recommendation', label: 'Open to installer recommendation' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'floor_structure',
        question: 'What type of floor structure is under the shower area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_concrete_floor', label: 'Solid concrete floor' },
          { value: 'timber_suspended_floor', label: 'Timber / suspended floor' },
          { value: 'apartment_floor_above', label: 'Apartment floor (above another property)' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'accessibility_features',
        question: 'Do you need any accessibility or safety features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'grab_rails', label: 'Grab rails' },
          { value: 'fold_down_built_in_seat', label: 'Fold-down or built-in seat' },
          { value: 'non_slip_flooring', label: 'Non-slip flooring' },
          { value: 'easy_reach_controls', label: 'Easy-reach controls' },
          { value: 'wide_open_access', label: 'Wide, open access' },
          { value: 'no_special_features', label: 'No special features' }
        ]
      },
      {
        id: 'retile_or_reuse',
        question: 'Will the walls and floor need new finishes?',
        type: 'radio',
        required: false,
        options: [
          { value: 'full_retiling_shower_area', label: 'Full re-tiling of shower area' },
          { value: 'partial_tiling_around_shower', label: 'Partial tiling around new shower' },
          { value: 'keeping_most_existing_tiles', label: 'Keeping most existing tiles' },
          { value: 'changing_floor_only', label: 'Changing floor only' },
          { value: 'not_sure_need_advice', label: 'Not sure – need advice' }
        ]
      }
    ]
  },

  // 10. Wetroom Installation
  {
    microSlug: 'wetroom-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'wetroom_type',
        question: 'What type of wetroom are you planning?',
        type: 'radio',
        required: true,
        options: [
          { value: 'full_wetroom_entire_floor', label: 'Full wetroom (entire floor waterproofed)' },
          { value: 'partial_wetroom_shower_zone', label: 'Partial wetroom (shower zone only)' },
          { value: 'luxury_wetroom_bespoke', label: 'Luxury wetroom with bespoke features' },
          { value: 'compact_wetroom', label: 'Compact wetroom' },
          { value: 'not_sure_need_advice', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'current_setup',
        question: 'What is the current bathroom setup?',
        type: 'radio',
        required: true,
        options: [
          { value: 'bath_only', label: 'Bath only' },
          { value: 'shower_tray', label: 'Shower tray' },
          { value: 'shower_over_bath', label: 'Shower over bath' },
          { value: 'empty_stripped_space', label: 'Empty or stripped space' },
          { value: 'existing_wetroom_needing_replacement', label: 'Existing wetroom needing replacement' }
        ]
      },
      {
        id: 'drain_type',
        question: 'What type of drainage do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'linear_drain', label: 'Linear drain' },
          { value: 'square_point_drain', label: 'Square point drain' },
          { value: 'use_existing_drain_position', label: 'Use existing drain position' },
          { value: 'installer_recommendation', label: 'Installer recommendation' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'floor_structure',
        question: 'What type of floor structure do you have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'timber_suspended', label: 'Timber / suspended' },
          { value: 'solid_concrete', label: 'Solid concrete' },
          { value: 'apartment_floor', label: 'Apartment floor' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'finish_type',
        question: 'What wall and floor finishes do you want?',
        type: 'radio',
        required: false,
        options: [
          { value: 'large_tiles', label: 'Large tiles' },
          { value: 'mosaic_tiles', label: 'Mosaic tiles' },
          { value: 'microcement', label: 'Microcement' },
          { value: 'vinyl_safety_flooring', label: 'Vinyl safety flooring' },
          { value: 'unsure', label: 'Unsure' }
        ]
      },
      {
        id: 'accessibility',
        question: 'Will the wetroom require accessibility features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'level_access', label: 'Level access' },
          { value: 'grab_rails', label: 'Grab rails' },
          { value: 'fold_down_seat', label: 'Fold-down seat' },
          { value: 'non_slip_flooring', label: 'Non-slip flooring' },
          { value: 'no_accessibility_features', label: 'No accessibility features' }
        ]
      },
      {
        id: 'tanking',
        question: 'Do you need waterproofing/tanking included?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_full_room', label: 'Yes – full room' },
          { value: 'yes_shower_zone_only', label: 'Yes – shower zone only' },
          { value: 'already_waterproofed', label: 'Already waterproofed' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'extras',
        question: 'Are there any additional features you want?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'underfloor_heating', label: 'Underfloor heating' },
          { value: 'built_in_niches', label: 'Built-in niches' },
          { value: 'steam_shower', label: 'Steam shower' },
          { value: 'led_lighting', label: 'LED lighting' },
          { value: 'none', label: 'None' }
        ]
      }
    ]
  },

  // 11. Bathroom Design
  {
    microSlug: 'bathroom-design',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'design_stage',
        question: 'What stage are you at with your bathroom design?',
        type: 'radio',
        required: true,
        options: [
          { value: 'starting_from_scratch', label: 'Starting from scratch' },
          { value: 'have_ideas_need_design_help', label: 'Have ideas but need design help' },
          { value: 'need_layout_options', label: 'Need layout options' },
          { value: 'need_technical_drawings', label: 'Need technical drawings' },
          { value: 'need_3d_visuals', label: 'Need 3D visuals' }
        ]
      },
      {
        id: 'design_style',
        question: 'What style are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'modern', label: 'Modern' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'luxury_spa', label: 'Luxury spa' },
          { value: 'rustic_natural', label: 'Rustic / natural' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'mediterranean', label: 'Mediterranean' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'fixtures',
        question: 'What fixtures should be included in the design?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'bath', label: 'Bath' },
          { value: 'walk_in_shower', label: 'Walk-in shower' },
          { value: 'double_vanity', label: 'Double vanity' },
          { value: 'storage_solutions', label: 'Storage solutions' },
          { value: 'toilet_repositioning', label: 'Toilet repositioning' },
          { value: 'lighting_design', label: 'Lighting design' }
        ]
      },
      {
        id: 'layout_goals',
        question: 'What are your layout goals?',
        type: 'radio',
        required: false,
        options: [
          { value: 'maximise_space', label: 'Maximise space' },
          { value: 'add_storage', label: 'Add storage' },
          { value: 'improve_accessibility', label: 'Improve accessibility' },
          { value: 'add_luxury_features', label: 'Add luxury features' },
          { value: 'complete_redesign', label: 'Complete redesign' }
        ]
      },
      {
        id: 'measurements',
        question: 'Do you have measurements or a floor plan?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_accurate_measurements', label: 'Yes – accurate measurements' },
          { value: 'rough_measurements', label: 'Rough measurements' },
          { value: 'no_measurements', label: 'No measurements' },
          { value: 'need_site_visit', label: 'Need site visit' }
        ]
      },
      {
        id: 'visuals',
        question: 'Will you need 3D visualisations?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_essential', label: 'Yes – essential' },
          { value: 'yes_if_affordable', label: 'Yes – if affordable' },
          { value: 'no_plan_only', label: 'No – plan only' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'materials',
        question: 'Do you have preferred materials?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'tiles', label: 'Tiles' },
          { value: 'microcement', label: 'Microcement' },
          { value: 'natural_stone', label: 'Natural stone' },
          { value: 'wood_effect', label: 'Wood-effect' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'project_management',
        question: 'Is the designer expected to manage the renovation?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_full_management', label: 'Yes – full management' },
          { value: 'yes_design_specification_only', label: 'Yes – design & specification only' },
          { value: 'no_design_only', label: 'No – design only' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      }
    ]
  },

  // 12. Bathroom Refurbishment
  {
    microSlug: 'bathroom-refurbishment',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'refurb_level',
        question: 'What level of refurbishment do you need?',
        type: 'radio',
        required: true,
        options: [
          { value: 'light_refresh', label: 'Light refresh' },
          { value: 'mid_level_upgrade', label: 'Mid-level upgrade' },
          { value: 'full_strip_out_rebuild', label: 'Full strip-out & rebuild' },
          { value: 'luxury_refurbishment', label: 'Luxury refurbishment' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'items_to_change',
        question: 'What existing items are you changing?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'bath', label: 'Bath' },
          { value: 'shower', label: 'Shower' },
          { value: 'toilet', label: 'Toilet' },
          { value: 'basin_vanity', label: 'Basin/vanity' },
          { value: 'tiles', label: 'Tiles' },
          { value: 'storage', label: 'Storage' },
          { value: 'flooring', label: 'Flooring' }
        ]
      },
      {
        id: 'layout_change',
        question: 'Do you want to change the bathroom layout?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_full_layout_change', label: 'Yes – full layout change' },
          { value: 'yes_minor_changes', label: 'Yes – minor changes' },
          { value: 'no_keep_current_layout', label: 'No – keep current layout' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'plumbing_work',
        question: 'Will plumbing need modifying?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_relocate_waste_pipes', label: 'Yes – relocate waste pipes' },
          { value: 'yes_upgrade_plumbing', label: 'Yes – upgrade plumbing' },
          { value: 'no_minor_adjustments', label: 'No – minor adjustments' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'electrical_work',
        question: 'Will electrical work be required?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'lighting_redesign', label: 'Lighting redesign' },
          { value: 'new_switches_sockets', label: 'New switches/sockets' },
          { value: 'extractor_fan_upgrade', label: 'Extractor fan upgrade' },
          { value: 'heated_mirror', label: 'Heated mirror' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'finishes',
        question: 'What wall and floor finishes do you want?',
        type: 'radio',
        required: false,
        options: [
          { value: 'new_tiles', label: 'New tiles' },
          { value: 'microcement', label: 'Microcement' },
          { value: 'full_waterproofing', label: 'Full waterproofing' },
          { value: 'vinyl_laminate', label: 'Vinyl / laminate' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'current_issues',
        question: 'Are there any problem areas currently?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'mould', label: 'Mould' },
          { value: 'damp_patches', label: 'Damp patches' },
          { value: 'loose_tiles', label: 'Loose tiles' },
          { value: 'poor_drainage', label: 'Poor drainage' },
          { value: 'low_water_pressure', label: 'Low water pressure' },
          { value: 'no_issues', label: 'No issues' }
        ]
      },
      {
        id: 'bathroom_type',
        question: 'Is this your main bathroom or an additional one?',
        type: 'radio',
        required: false,
        options: [
          { value: 'main_bathroom', label: 'Main bathroom' },
          { value: 'ensuite', label: 'Ensuite' },
          { value: 'guest_bathroom', label: 'Guest bathroom' },
          { value: 'cloakroom', label: 'Cloakroom' },
          { value: 'rental_property_bathroom', label: 'Rental property bathroom' }
        ]
      }
    ]
  },

  // 13. Cloakroom and Ensuite Bathrooms
  {
    microSlug: 'cloakroom-ensuite-bathrooms',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'room_type',
        question: 'What type of small bathroom are you working on?',
        type: 'radio',
        required: true,
        options: [
          { value: 'cloakroom_wc_only', label: 'Cloakroom / WC only' },
          { value: 'ensuite_with_shower', label: 'Ensuite with shower' },
          { value: 'ensuite_with_bath', label: 'Ensuite with bath' },
          { value: 'combined_wc_and_shower', label: 'Combined WC and shower' },
          { value: 'not_sure_flexible', label: 'Not sure / flexible' }
        ]
      },
      {
        id: 'current_state',
        question: 'What best describes the current state of the room?',
        type: 'radio',
        required: true,
        options: [
          { value: 'fully_fitted_needs_updating', label: 'Fully fitted, needs updating' },
          { value: 'partially_fitted', label: 'Partially fitted' },
          { value: 'empty_stud_walls_only', label: 'Empty or stud walls only' },
          { value: 'currently_another_type_room', label: 'Currently another type of room' },
          { value: 'extension_new_build_space', label: 'Extension / new build space' }
        ]
      },
      {
        id: 'fixtures_required',
        question: 'Which fixtures do you want in this cloakroom or ensuite?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'toilet', label: 'Toilet' },
          { value: 'basin', label: 'Basin' },
          { value: 'shower', label: 'Shower' },
          { value: 'bath', label: 'Bath' },
          { value: 'heated_towel_rail', label: 'Heated towel rail' },
          { value: 'storage_vanity_unit', label: 'Storage / vanity unit' }
        ]
      },
      {
        id: 'space_priority',
        question: 'What is the main priority for this small bathroom?',
        type: 'radio',
        required: false,
        options: [
          { value: 'maximise_usable_space', label: 'Maximise usable space' },
          { value: 'make_feel_bigger_lighter', label: 'Make it feel bigger / lighter' },
          { value: 'add_storage', label: 'Add storage' },
          { value: 'create_luxury_feel', label: 'Create a luxury feel' },
          { value: 'improve_accessibility', label: 'Improve accessibility' }
        ]
      },
      {
        id: 'door_and_layout',
        question: 'How is access and layout currently?',
        type: 'radio',
        required: false,
        options: [
          { value: 'door_position_works_well', label: 'Door position works well' },
          { value: 'door_position_causes_issues', label: 'Door position causes issues' },
          { value: 'awkward_layout_tight_space', label: 'Awkward layout / tight space' },
          { value: 'room_shape_unusual', label: 'Room shape is unusual' },
          { value: 'need_advice_on_layout', label: 'Need advice on layout' }
        ]
      },
      {
        id: 'ventilation',
        question: 'What ventilation is available in this room?',
        type: 'radio',
        required: false,
        options: [
          { value: 'window_only', label: 'Window only' },
          { value: 'extractor_fan_only', label: 'Extractor fan only' },
          { value: 'window_and_extractor', label: 'Window and extractor' },
          { value: 'no_ventilation_yet', label: 'No ventilation yet' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'finishes_style',
        question: 'What style of finishes are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'simple_and_practical', label: 'Simple and practical' },
          { value: 'modern_and_minimal', label: 'Modern and minimal' },
          { value: 'luxury_hotel_style', label: 'Luxury hotel-style' },
          { value: 'traditional_classic', label: 'Traditional / classic' },
          { value: 'happy_installer_suggestions', label: 'Happy with installer suggestions' }
        ]
      },
      {
        id: 'small_space_challenges',
        question: 'Are there any known challenges with this small space?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'very_narrow_room', label: 'Very narrow room' },
          { value: 'low_ceiling_sloped_ceiling', label: 'Low ceiling or sloped ceiling' },
          { value: 'limited_pipe_access', label: 'Limited pipe access' },
          { value: 'existing_damp_mould', label: 'Existing damp / mould' },
          { value: 'no_obvious_challenges', label: 'No obvious challenges' }
        ]
      }
    ]
  },

  // 14. New Bathroom Installation
  {
    microSlug: 'new-bathroom-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'project_context',
        question: 'What is the context for this new bathroom?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_build_property', label: 'New build property' },
          { value: 'extension_loft_conversion', label: 'Extension or loft conversion' },
          { value: 'converting_existing_room', label: 'Converting an existing room' },
          { value: 'replacing_old_bathroom_completely', label: 'Replacing an old bathroom completely' },
          { value: 'adding_extra_bathroom', label: 'Adding an extra bathroom' }
        ]
      },
      {
        id: 'rough_plumbing_status',
        question: 'What stage is the plumbing currently at?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no_plumbing_in_place_yet', label: 'No plumbing in place yet' },
          { value: 'first_fix_pipework_in_place', label: 'First-fix pipework in place' },
          { value: 'existing_pipework_to_reuse', label: 'Existing pipework to reuse' },
          { value: 'old_pipework_to_remove_replace', label: 'Old pipework to remove and replace' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'bathroom_type',
        question: 'What type of bathroom are you installing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'main_family_bathroom', label: 'Main family bathroom' },
          { value: 'ensuite', label: 'Ensuite' },
          { value: 'guest_bathroom', label: 'Guest bathroom' },
          { value: 'cloakroom_wc', label: 'Cloakroom / WC' },
          { value: 'accessible_bathroom', label: 'Accessible bathroom' }
        ]
      },
      {
        id: 'planned_fixtures',
        question: 'Which fixtures do you want in the new bathroom?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'bath', label: 'Bath' },
          { value: 'walk_in_shower', label: 'Walk-in shower' },
          { value: 'shower_over_bath', label: 'Shower over bath' },
          { value: 'single_vanity', label: 'Single vanity' },
          { value: 'double_vanity', label: 'Double vanity' },
          { value: 'toilet', label: 'Toilet' },
          { value: 'bidet_or_bidet_shower', label: 'Bidet or bidet shower' },
          { value: 'heated_towel_rail', label: 'Heated towel rail' }
        ]
      },
      {
        id: 'floor_and_structure',
        question: 'What best describes the floor and structure?',
        type: 'radio',
        required: false,
        options: [
          { value: 'timber_suspended_floor', label: 'Timber / suspended floor' },
          { value: 'solid_concrete_floor', label: 'Solid concrete floor' },
          { value: 'apartment_floor_above_unit', label: 'Apartment floor (above another unit)' },
          { value: 'room_still_being_built_framed', label: 'Room still being built or framed' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'tiling_and_waterproofing',
        question: 'How much of the room will need tiling and waterproofing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'shower_bath_area_only', label: 'Shower / bath area only' },
          { value: 'half_height_tiling_around_room', label: 'Half-height tiling around room' },
          { value: 'full_height_tiling_key_areas', label: 'Full-height tiling in key areas' },
          { value: 'floor_shower_fully_tanked', label: 'Floor and shower fully tanked' },
          { value: 'unsure_need_advice', label: 'Unsure – need advice' }
        ]
      },
      {
        id: 'storage_and_layout',
        question: 'What are your priorities for layout and storage?',
        type: 'radio',
        required: false,
        options: [
          { value: 'maximise_storage', label: 'Maximise storage' },
          { value: 'maximise_open_space', label: 'Maximise open space' },
          { value: 'fit_both_bath_and_shower', label: 'Fit in both bath and shower' },
          { value: 'simplest_layout_to_install', label: 'Simplest layout to install' },
          { value: 'need_layout_guidance', label: 'Need layout guidance' }
        ]
      },
      {
        id: 'finish_and_style',
        question: 'What overall style are you aiming for in this new bathroom?',
        type: 'radio',
        required: false,
        options: [
          { value: 'clean_and_simple', label: 'Clean and simple' },
          { value: 'modern_and_minimal', label: 'Modern and minimal' },
          { value: 'luxury_hotel_style', label: 'Luxury hotel-style' },
          { value: 'traditional_classic', label: 'Traditional / classic' },
          { value: 'installer_to_propose_options', label: 'Installer to propose options' }
        ]
      }
    ]
  },

  // Kitchen & Bathroom - Full Bathroom Fit
  {
    microSlug: 'full-bathroom-fit',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'current_state',
        type: 'radio',
        question: 'What is the current state of your bathroom?',
        options: [
          { value: 'fully_fitted_replacing', label: 'Fully fitted – replacing everything' },
          { value: 'partially_fitted', label: 'Partially fitted – some items staying' },
          { value: 'stripped_out', label: 'Stripped out / empty room' },
          { value: 'converting_room', label: 'Converting another room into a bathroom' }
        ],
        required: true
      },
      {
        id: 'bathroom_type',
        type: 'radio',
        question: 'What type of bathroom is this?',
        options: [
          { value: 'main_family', label: 'Main family bathroom' },
          { value: 'ensuite', label: 'Ensuite' },
          { value: 'guest', label: 'Guest bathroom' },
          { value: 'cloakroom', label: 'Cloakroom / WC' },
          { value: 'accessible', label: 'Accessible bathroom' }
        ],
        required: true
      },
      {
        id: 'fixtures',
        type: 'checkbox',
        question: 'Which fixtures do you want included?',
        options: [
          { value: 'bath', label: 'Bath' },
          { value: 'walk_in_shower', label: 'Walk-in shower' },
          { value: 'shower_over_bath', label: 'Shower over bath' },
          { value: 'single_vanity', label: 'Single vanity' },
          { value: 'double_vanity', label: 'Double vanity' },
          { value: 'toilet', label: 'Toilet' },
          { value: 'bidet', label: 'Bidet or bidet spray' },
          { value: 'heated_towel_rail', label: 'Heated towel rail' }
        ],
        required: true
      },
      {
        id: 'layout_changes',
        type: 'radio',
        question: 'Are you changing the layout?',
        options: [
          { value: 'full_new', label: 'Yes – full new layout' },
          { value: 'small_changes', label: 'Yes – small changes' },
          { value: 'keeping_layout', label: 'No – keeping layout' },
          { value: 'not_sure', label: 'Not sure yet' }
        ],
        required: false
      },
      {
        id: 'plumbing_changes',
        type: 'radio',
        question: 'Will plumbing need modifying?',
        options: [
          { value: 'repositioning_all', label: 'Repositioning all plumbing' },
          { value: 'some_changes', label: 'Some plumbing changes' },
          { value: 'minor_adjustments', label: 'Minor adjustments only' },
          { value: 'no_changes', label: 'No plumbing changes' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'tiling_scope',
        type: 'radio',
        question: 'How much tiling is required?',
        options: [
          { value: 'shower_bath_only', label: 'Shower/bath area only' },
          { value: 'half_height', label: 'Half-height walls' },
          { value: 'full_height', label: 'Full-height tiling' },
          { value: 'floor_only', label: 'Floor only' },
          { value: 'entire_room', label: 'Entire room' },
          { value: 'unsure', label: 'Unsure' }
        ],
        required: false
      },
      {
        id: 'finishes_style',
        type: 'radio',
        question: 'What style and finish do you want?',
        options: [
          { value: 'modern', label: 'Modern' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'luxury_hotel', label: 'Luxury hotel-style' },
          { value: 'traditional', label: 'Traditional / classic' },
          { value: 'installer_suggestions', label: 'Installer suggestions welcome' }
        ],
        required: false
      },
      {
        id: 'special_features',
        type: 'checkbox',
        question: 'Any additional features?',
        options: [
          { value: 'underfloor_heating', label: 'Underfloor heating' },
          { value: 'built_in_niches', label: 'Built-in niches' },
          { value: 'led_lighting', label: 'LED lighting' },
          { value: 'steam_shower', label: 'Steam shower' },
          { value: 'smart_controls', label: 'Smart controls' },
          { value: 'none', label: 'None' }
        ],
        required: false
      }
    ]
  },

  // Kitchen & Bathroom - Wetroom Installation (v2 - corrected)
  {
    microSlug: 'wetroom-installation-v2',
    categorySlug: 'kitchen-bathroom',
    version: 2,
    questions: [
      {
        id: 'wetroom_type',
        type: 'radio',
        question: 'What type of wetroom are you planning?',
        options: [
          { value: 'full_wetroom', label: 'Full wetroom (whole floor waterproofed)' },
          { value: 'partial_wetroom', label: 'Partial wetroom (shower zone only)' },
          { value: 'luxury_wetroom', label: 'Luxury wetroom' },
          { value: 'compact_wetroom', label: 'Compact wetroom' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: true
      },
      {
        id: 'current_setup',
        type: 'radio',
        question: 'What is the current bathroom setup?',
        options: [
          { value: 'bath_only', label: 'Bath only' },
          { value: 'existing_shower_tray', label: 'Existing shower tray' },
          { value: 'shower_over_bath', label: 'Shower over bath' },
          { value: 'empty', label: 'Empty / stripped back' },
          { value: 'existing_wetroom', label: 'Existing wetroom needing rebuild' }
        ],
        required: true
      },
      {
        id: 'drain_style',
        type: 'radio',
        question: 'Which drainage style do you prefer?',
        options: [
          { value: 'linear_channel', label: 'Linear channel drain' },
          { value: 'square_drain', label: 'Square drain' },
          { value: 'existing_drain', label: 'Use existing drain' },
          { value: 'installer_recommendation', label: 'Installer recommendation' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'floor_type',
        type: 'radio',
        question: 'What is the floor structure?',
        options: [
          { value: 'timber_suspended', label: 'Timber / suspended' },
          { value: 'concrete', label: 'Concrete floor' },
          { value: 'apartment', label: 'Apartment floor' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'finish_type',
        type: 'radio',
        question: 'What finishes do you want?',
        options: [
          { value: 'large_tiles', label: 'Large tiles' },
          { value: 'mosaic_tiles', label: 'Mosaic tiles' },
          { value: 'microcement', label: 'Microcement' },
          { value: 'vinyl_safety', label: 'Vinyl safety flooring' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'accessibility',
        type: 'checkbox',
        question: 'Do you need accessibility or safety features?',
        options: [
          { value: 'grab_rails', label: 'Grab rails' },
          { value: 'non_slip', label: 'Non-slip flooring' },
          { value: 'fold_down_seat', label: 'Fold-down seat' },
          { value: 'wide_access', label: 'Wide access entrance' },
          { value: 'none', label: 'No accessibility features' }
        ],
        required: false
      },
      {
        id: 'tanking_scope',
        type: 'radio',
        question: 'How much waterproofing / tanking is needed?',
        options: [
          { value: 'full_room', label: 'Full room waterproofing' },
          { value: 'shower_only', label: 'Shower area only' },
          { value: 'already_waterproofed', label: 'Already waterproofed' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'extra_features',
        type: 'checkbox',
        question: 'Any additional features wanted?',
        options: [
          { value: 'underfloor_heating', label: 'Underfloor heating' },
          { value: 'led_lighting', label: 'LED lighting' },
          { value: 'built_in_niches', label: 'Built-in niches' },
          { value: 'steam_function', label: 'Steam function' },
          { value: 'none', label: 'None' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Installation - Full Kitchen Fit
  {
    microSlug: 'full-kitchen-fit',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'kitchen_state',
        type: 'radio',
        question: 'What is the current state of the kitchen?',
        options: [
          { value: 'old_kitchen_in_place', label: 'Old kitchen still in place' },
          { value: 'partially_removed', label: 'Partially removed' },
          { value: 'stripped_out', label: 'Completely stripped out' },
          { value: 'new_room_extension', label: 'Brand new room / extension' }
        ],
        required: true
      },
      {
        id: 'layout_type',
        type: 'radio',
        question: 'What layout will the new kitchen have?',
        options: [
          { value: 'straight_line', label: 'Straight line / single wall' },
          { value: 'l_shaped', label: 'L-shaped' },
          { value: 'u_shaped', label: 'U-shaped' },
          { value: 'galley', label: 'Galley kitchen' },
          { value: 'island', label: 'Island kitchen' },
          { value: 'not_finalised', label: 'Not finalised yet' }
        ],
        required: true
      },
      {
        id: 'units_required',
        type: 'checkbox',
        question: 'What type of kitchen units are being installed?',
        options: [
          { value: 'base_units', label: 'Base units' },
          { value: 'wall_units', label: 'Wall units' },
          { value: 'tall_units', label: 'Tall units' },
          { value: 'pantry_units', label: 'Pantry units' },
          { value: 'appliance_housings', label: 'Built-in appliance housings' },
          { value: 'island', label: 'Kitchen island' }
        ],
        required: true
      },
      {
        id: 'appliance_fitting',
        type: 'checkbox',
        question: 'Which appliances need fitting?',
        options: [
          { value: 'oven', label: 'Oven' },
          { value: 'hob', label: 'Hob' },
          { value: 'extractor', label: 'Extractor' },
          { value: 'fridge_freezer', label: 'Integrated fridge/freezer' },
          { value: 'dishwasher', label: 'Integrated dishwasher' },
          { value: 'washing_machine', label: 'Washing machine' },
          { value: 'microwave', label: 'Microwave housing' },
          { value: 'wine_cooler', label: 'Wine cooler' }
        ],
        required: false
      },
      {
        id: 'utilities_changes',
        type: 'radio',
        question: 'Will plumbing or electrics need modifications?',
        options: [
          { value: 'major_changes', label: 'Yes – major plumbing & electrical changes' },
          { value: 'some_adjustments', label: 'Yes – some adjustments needed' },
          { value: 'minor_only', label: 'Minor modifications only' },
          { value: 'no_changes', label: 'No changes required' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'worktop_status',
        type: 'radio',
        question: 'What is the worktop situation?',
        options: [
          { value: 'included', label: 'New worktops included' },
          { value: 'purchased', label: 'Worktops already purchased' },
          { value: 'temporarily_old', label: 'Temporarily using old worktops' },
          { value: 'need_advice', label: 'Unsure – need advice' }
        ],
        required: false
      },
      {
        id: 'tiling_and_splashback',
        type: 'radio',
        question: 'What splashback or wall finish is required?',
        options: [
          { value: 'full_tiled', label: 'Full tiled splashback' },
          { value: 'partial_tiles', label: 'Partial tiles' },
          { value: 'acrylic_glass', label: 'Acrylic / glass splashback' },
          { value: 'no_splashback', label: 'No splashback needed' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'additional_features',
        type: 'checkbox',
        question: 'Any additional features to include?',
        options: [
          { value: 'under_cabinet_lighting', label: 'Under-cabinet lighting' },
          { value: 'plug_sockets', label: 'Plug socket installation' },
          { value: 'island_electrics', label: 'Island electrics' },
          { value: 'waste_disposal', label: 'Waste disposal unit' },
          { value: 'boiling_tap', label: 'Boiling water tap' },
          { value: 'none', label: 'None' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Installation - Worktop Installation
  {
    microSlug: 'worktop-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'worktop_material',
        type: 'radio',
        question: 'What type of worktop are you installing?',
        options: [
          { value: 'laminate', label: 'Laminate' },
          { value: 'solid_wood', label: 'Solid wood' },
          { value: 'quartz', label: 'Quartz' },
          { value: 'granite', label: 'Granite' },
          { value: 'marble', label: 'Marble' },
          { value: 'compact_laminate', label: 'Compact laminate' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: true
      },
      {
        id: 'worktop_length',
        type: 'radio',
        question: 'How much worktop length needs installing?',
        options: [
          { value: 'up_to_3m', label: 'Up to 3m' },
          { value: '3m_to_6m', label: '3m to 6m' },
          { value: '6m_to_9m', label: '6m to 9m' },
          { value: '9m_plus', label: '9m+' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: true
      },
      {
        id: 'existing_worktops',
        type: 'radio',
        question: 'Do existing worktops need removing?',
        options: [
          { value: 'yes_remove', label: 'Yes – remove old worktops' },
          { value: 'no_new_only', label: 'No – new install only' },
          { value: 'partially', label: 'Partially' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'cutouts_needed',
        type: 'checkbox',
        question: 'Which cutouts are needed in the worktop?',
        options: [
          { value: 'sink', label: 'Sink cutout' },
          { value: 'hob', label: 'Hob cutout' },
          { value: 'tap_hole', label: 'Tap hole' },
          { value: 'pop_up_sockets', label: 'Pop-up socket holes' },
          { value: 'none', label: 'None' }
        ],
        required: false
      },
      {
        id: 'joint_type',
        type: 'radio',
        question: 'What type of joints are required?',
        options: [
          { value: 'standard_butt', label: 'Standard butt joints' },
          { value: 'masons_mitre', label: "Mason's mitre joints" },
          { value: 'factory_made', label: 'Factory-made joints' },
          { value: 'seamless', label: 'Solid surface seamless joints' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'finish_edges',
        type: 'checkbox',
        question: 'Do you need edging or finishing work?',
        options: [
          { value: 'end_caps', label: 'End caps' },
          { value: 'upstands', label: 'Upstands' },
          { value: 'splashback', label: 'Splashback' },
          { value: 'edge_polishing', label: 'Edge polishing' },
          { value: 'no_edging', label: 'No additional edging' }
        ],
        required: false
      },
      {
        id: 'support_requirements',
        type: 'radio',
        question: 'Will additional support be required?',
        options: [
          { value: 'brackets_needed', label: 'Support brackets needed' },
          { value: 'island_support', label: 'Island support required' },
          { value: 'no_support', label: 'No extra support needed' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'appliance_fitting',
        type: 'checkbox',
        question: 'Any appliances to be fitted alongside the worktop?',
        options: [
          { value: 'sink', label: 'Sink installation' },
          { value: 'hob', label: 'Hob installation' },
          { value: 'extractor', label: 'Extractor ducting' },
          { value: 'appliance_connections', label: 'Washing machine or dishwasher connections' },
          { value: 'none', label: 'No appliance connections' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Fitting and Renovation - Kitchen fitting
  {
    microSlug: 'kitchen-fitting',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'kitchen_state',
        type: 'radio',
        question: 'What is the current state of the kitchen area?',
        options: [
          { value: 'old_installed', label: 'Old kitchen still installed' },
          { value: 'partially_removed', label: 'Partially removed' },
          { value: 'empty', label: 'Fully removed / empty space' },
          { value: 'new_extension', label: 'New extension or newly built room' }
        ],
        required: true
      },
      {
        id: 'unit_types',
        type: 'checkbox',
        question: 'Which kitchen units are being fitted?',
        options: [
          { value: 'base_units', label: 'Base units' },
          { value: 'wall_units', label: 'Wall units' },
          { value: 'tall_units', label: 'Tall units' },
          { value: 'pantry_units', label: 'Pantry units' },
          { value: 'island_units', label: 'Island units' },
          { value: 'appliance_housings', label: 'Integrated appliance housings' }
        ],
        required: true
      },
      {
        id: 'appliances',
        type: 'checkbox',
        question: 'Which appliances need installation?',
        options: [
          { value: 'oven', label: 'Oven' },
          { value: 'hob', label: 'Hob' },
          { value: 'extractor', label: 'Extractor' },
          { value: 'fridge_freezer', label: 'Integrated fridge/freezer' },
          { value: 'dishwasher', label: 'Integrated dishwasher' },
          { value: 'washing_machine', label: 'Washing machine' },
          { value: 'microwave', label: 'Microwave housing' }
        ],
        required: false
      },
      {
        id: 'plumbing_electrics',
        type: 'radio',
        question: 'Will plumbing or electrics need adjusting?',
        options: [
          { value: 'major_adjustments', label: 'Major adjustments needed' },
          { value: 'some_adjustments', label: 'Some adjustments needed' },
          { value: 'minor_only', label: 'Minor adjustments only' },
          { value: 'no_changes', label: 'No changes required' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'worktop_status',
        type: 'radio',
        question: 'Are worktops part of this fitting?',
        options: [
          { value: 'installing_new', label: 'Yes – installing new worktops' },
          { value: 'already_fitted', label: 'Worktops already fitted' },
          { value: 'separately', label: 'Worktops fitted separately' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'splashback',
        type: 'radio',
        question: 'Do you need a splashback installed?',
        options: [
          { value: 'tiled', label: 'Tiled splashback' },
          { value: 'acrylic_glass', label: 'Acrylic or glass' },
          { value: 'upstand', label: 'Matching worktop upstand' },
          { value: 'no_splashback', label: 'No splashback' },
          { value: 'not_sure', label: 'Not sure yet' }
        ],
        required: false
      },
      {
        id: 'additional_features',
        type: 'checkbox',
        question: 'Any extra features to include?',
        options: [
          { value: 'under_cabinet_lighting', label: 'Under-cabinet lighting' },
          { value: 'plug_sockets', label: 'New plug sockets' },
          { value: 'island_electrics', label: 'Island electrics' },
          { value: 'boiling_tap', label: 'Boiling water tap' },
          { value: 'waste_disposal', label: 'Waste disposal unit' },
          { value: 'none', label: 'None' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Fitting and Renovation - Kitchen refurbishment
  {
    microSlug: 'kitchen-refurbishment',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'refurb_level',
        type: 'radio',
        question: 'What level of refurbishment do you need?',
        options: [
          { value: 'light_refresh', label: 'Light refresh' },
          { value: 'mid_level', label: 'Mid-level renovation' },
          { value: 'full_strip_refit', label: 'Full strip-out & refit' },
          { value: 'luxury_upgrade', label: 'Luxury upgrade' },
          { value: 'not_sure', label: 'Not sure yet' }
        ],
        required: true
      },
      {
        id: 'items_to_update',
        type: 'checkbox',
        question: 'Which elements do you want to update?',
        options: [
          { value: 'cabinet_fronts', label: 'Cabinet fronts / doors' },
          { value: 'handles_hardware', label: 'Handles & hardware' },
          { value: 'worktops', label: 'Worktops' },
          { value: 'splashback', label: 'Splashback' },
          { value: 'sink_tap', label: 'Sink & tap' },
          { value: 'appliances', label: 'Appliances' },
          { value: 'flooring', label: 'Flooring' },
          { value: 'lighting', label: 'Lighting' }
        ],
        required: true
      },
      {
        id: 'layout_change',
        type: 'radio',
        question: 'Are you planning any layout changes?',
        options: [
          { value: 'full_new_layout', label: 'Full new layout' },
          { value: 'some_repositioning', label: 'Some repositioning' },
          { value: 'keeping_existing', label: 'Keeping existing layout' },
          { value: 'not_sure', label: 'Not sure yet' }
        ],
        required: false
      },
      {
        id: 'cabinet_condition',
        type: 'radio',
        question: 'What is the condition of the existing cabinets?',
        options: [
          { value: 'good_reuse', label: 'Good – reuse carcasses' },
          { value: 'mixed', label: 'Mixed condition' },
          { value: 'poor_replace', label: 'Poor – replace carcasses' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'appliances_update',
        type: 'checkbox',
        question: 'Are appliances being replaced?',
        options: [
          { value: 'all', label: 'All appliances' },
          { value: 'some', label: 'Some appliances' },
          { value: 'keeping_current', label: 'Keeping current ones' },
          { value: 'not_sure', label: 'Not sure yet' }
        ],
        required: false
      },
      {
        id: 'finishes_preference',
        type: 'radio',
        question: 'Which style or finish are you aiming for?',
        options: [
          { value: 'modern', label: 'Modern' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'traditional', label: 'Traditional' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'scandinavian', label: 'Scandinavian' },
          { value: 'installer_recommendations', label: 'Installer recommendations' }
        ],
        required: false
      },
      {
        id: 'known_issues',
        type: 'checkbox',
        question: 'Are there any known issues?',
        options: [
          { value: 'water_damage', label: 'Water damage' },
          { value: 'loose_units', label: 'Loose units' },
          { value: 'poor_ventilation', label: 'Poor ventilation' },
          { value: 'broken_appliances', label: 'Broken appliances' },
          { value: 'old_utilities', label: 'Old electrics/plumbing' },
          { value: 'no_issues', label: 'No known issues' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Fitting and Renovation - New kitchen installation
  {
    microSlug: 'new-kitchen-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'project_type',
        type: 'radio',
        question: 'What is the context for your new kitchen?',
        options: [
          { value: 'new_build', label: 'New build property' },
          { value: 'extension', label: 'Extension' },
          { value: 'loft_basement', label: 'Loft or basement conversion' },
          { value: 'converting_room', label: 'Converting another room' },
          { value: 'replacing_old', label: 'Replacing old kitchen entirely' }
        ],
        required: true
      },
      {
        id: 'rough_stage',
        type: 'radio',
        question: 'What stage is the room currently at?',
        options: [
          { value: 'stud_walls', label: 'Stud walls only' },
          { value: 'first_fix', label: 'First-fix plumbing & electrics' },
          { value: 'second_fix', label: 'Second-fix ready' },
          { value: 'fully_prepared', label: 'Fully prepared and ready to install' }
        ],
        required: true
      },
      {
        id: 'layout_plan',
        type: 'radio',
        question: 'What layout will the new kitchen have?',
        options: [
          { value: 'straight_line', label: 'Straight line' },
          { value: 'l_shaped', label: 'L-shaped' },
          { value: 'u_shaped', label: 'U-shaped' },
          { value: 'galley', label: 'Galley' },
          { value: 'island', label: 'Island kitchen' },
          { value: 'not_finalised', label: 'Not finalised' }
        ],
        required: false
      },
      {
        id: 'unit_types',
        type: 'checkbox',
        question: 'What units need installing?',
        options: [
          { value: 'base_units', label: 'Base units' },
          { value: 'wall_units', label: 'Wall units' },
          { value: 'tall_units', label: 'Tall units' },
          { value: 'pantry_larder', label: 'Pantry or larder units' },
          { value: 'island_units', label: 'Island units' },
          { value: 'appliance_housings', label: 'Integrated appliance housings' }
        ],
        required: true
      },
      {
        id: 'appliances',
        type: 'checkbox',
        question: 'Which appliances will be installed?',
        options: [
          { value: 'oven', label: 'Oven' },
          { value: 'hob', label: 'Hob' },
          { value: 'extractor', label: 'Extractor' },
          { value: 'fridge_freezer', label: 'Fridge/freezer' },
          { value: 'dishwasher', label: 'Dishwasher' },
          { value: 'washing_machine', label: 'Washing machine' },
          { value: 'wine_cooler', label: 'Wine cooler' },
          { value: 'microwave', label: 'Microwave/combination oven' }
        ],
        required: false
      },
      {
        id: 'utility_changes',
        type: 'radio',
        question: 'Will plumbing/electrical work be required?',
        options: [
          { value: 'major_changes', label: 'Yes – major changes' },
          { value: 'some_adjustments', label: 'Yes – some adjustments' },
          { value: 'minor_only', label: 'Minor changes only' },
          { value: 'no_changes', label: 'No changes needed' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'worktops_needed',
        type: 'radio',
        question: 'Do you need new worktops installed?',
        options: [
          { value: 'supplied_by_me', label: 'Yes – supplied by me' },
          { value: 'supply_install', label: 'Yes – need supply & installation' },
          { value: 'in_place', label: 'Worktops already in place' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'features',
        type: 'checkbox',
        question: 'Any special features to include?',
        options: [
          { value: 'under_cabinet_lighting', label: 'Under-cabinet lighting' },
          { value: 'boiling_tap', label: 'Boiling water tap' },
          { value: 'island_electrics', label: 'Island electrics' },
          { value: 'pull_out_storage', label: 'Pull-out storage' },
          { value: 'smart_features', label: 'Smart kitchen features' },
          { value: 'none', label: 'None' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Fitting and Renovation - Small kitchen updates
  {
    microSlug: 'small-kitchen-updates',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'update_level',
        type: 'radio',
        question: 'What type of small update do you need?',
        options: [
          { value: 'cabinet_doors', label: 'Replace cabinet doors' },
          { value: 'handles_hardware', label: 'Replace handles and hardware' },
          { value: 'sink_tap', label: 'Replace sink & tap' },
          { value: 'worktops', label: 'Replace worktops' },
          { value: 'splashback', label: 'Update splashback' },
          { value: 'minor_repairs', label: 'Minor repairs and adjustments' }
        ],
        required: true
      },
      {
        id: 'units_condition',
        type: 'radio',
        question: 'What is the condition of the existing kitchen units?',
        options: [
          { value: 'good', label: 'Good – only cosmetic changes needed' },
          { value: 'mixed', label: 'Mixed condition' },
          { value: 'poor', label: 'Poor – may need replacements soon' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'appliance_updates',
        type: 'checkbox',
        question: 'Do any appliances need updating?',
        options: [
          { value: 'oven', label: 'Oven' },
          { value: 'hob', label: 'Hob' },
          { value: 'extractor', label: 'Extractor' },
          { value: 'fridge_freezer', label: 'Fridge/freezer' },
          { value: 'dishwasher', label: 'Dishwasher' },
          { value: 'washing_machine', label: 'Washing machine' },
          { value: 'none', label: 'None' }
        ],
        required: false
      },
      {
        id: 'worktop_change',
        type: 'radio',
        question: 'Are you planning to replace worktops?',
        options: [
          { value: 'yes_new', label: 'Yes – new worktops required' },
          { value: 'possibly', label: 'Possibly – need advice' },
          { value: 'no_keeping', label: 'No – keeping current worktops' }
        ],
        required: false
      },
      {
        id: 'splashback_change',
        type: 'radio',
        question: 'Do you want a new splashback?',
        options: [
          { value: 'tiled', label: 'Tiled splashback' },
          { value: 'glass_acrylic', label: 'Glass or acrylic' },
          { value: 'upstand', label: 'Matching worktop upstand' },
          { value: 'no_change', label: 'No splashback change' },
          { value: 'not_sure', label: 'Not sure' }
        ],
        required: false
      },
      {
        id: 'lighting_changes',
        type: 'checkbox',
        question: 'Any lighting updates?',
        options: [
          { value: 'under_cabinet', label: 'Under-cabinet lighting' },
          { value: 'ceiling_lights', label: 'New ceiling lights' },
          { value: 'socket_relocations', label: 'Plug socket relocations' },
          { value: 'no_changes', label: 'No lighting changes' }
        ],
        required: false
      },
      {
        id: 'repair_items',
        type: 'checkbox',
        question: 'Do you need any repairs?',
        options: [
          { value: 'damaged_units', label: 'Damaged units' },
          { value: 'loose_hinges', label: 'Loose doors or hinges' },
          { value: 'water_damage', label: 'Water damage' },
          { value: 'failed_sealant', label: 'Failed sealant' },
          { value: 'worn_flooring', label: 'Worn flooring' },
          { value: 'no_repairs', label: 'No repairs needed' }
        ],
        required: false
      }
    ]
  },

  // Kitchen Worktops, Units & Storage packs
  {
    microSlug: 'kitchen-island-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'island_purpose',
        question: 'What is the main purpose of the kitchen island?',
        type: 'radio',
        required: true,
        options: [
          { value: 'prep-space', label: 'Prep space' },
          { value: 'seating', label: 'Seating' },
          { value: 'cooking-hob', label: 'Cooking (hob)' },
          { value: 'sink-plumbing', label: 'Sink/plumbing' },
          { value: 'storage-only', label: 'Storage only' },
        ]
      },
      {
        id: 'island_size',
        question: 'Approximately what size island do you need?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (up to 1.5m)' },
          { value: 'medium', label: 'Medium (1.5m - 2.5m)' },
          { value: 'large', label: 'Large (2.5m+)' },
        ]
      },
      {
        id: 'services_needed',
        question: 'Which services will the island require?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'plumbing', label: 'Plumbing' },
          { value: 'electrical', label: 'Electrical' },
          { value: 'ventilation', label: 'Ventilation' },
          { value: 'lighting', label: 'Lighting' },
        ]
      },
      {
        id: 'island_material',
        question: 'What material will the island be made from?',
        type: 'radio',
        required: true,
        options: [
          { value: 'wood', label: 'Solid wood' },
          { value: 'mdf', label: 'MDF' },
          { value: 'plywood', label: 'Plywood' },
          { value: 'pre-built', label: 'Pre-built unit' },
        ]
      },
      {
        id: 'worktop_type',
        question: 'What type of worktop will be used?',
        type: 'radio',
        required: false,
        options: [
          { value: 'stone', label: 'Stone (granite/marble)' },
          { value: 'quartz', label: 'Quartz' },
          { value: 'laminate', label: 'Laminate' },
          { value: 'wood', label: 'Solid wood' },
        ]
      },
      {
        id: 'old_island_removal',
        question: 'Does an existing island need removing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'design_drawings',
        question: 'Do you have design drawings or plans?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      }
    ]
  },
  {
    microSlug: 'kitchen-unit-installation',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'unit_type',
        question: 'Which types of kitchen units are being installed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'base', label: 'Base units' },
          { value: 'wall', label: 'Wall units' },
          { value: 'tall', label: 'Tall units' },
          { value: 'corner', label: 'Corner units' },
          { value: 'larder', label: 'Larder units' },
        ]
      },
      {
        id: 'number_of_units',
        question: 'Approximately how many units?',
        type: 'radio',
        required: true,
        options: [
          { value: '1-4', label: '1-4 units' },
          { value: '5-8', label: '5-8 units' },
          { value: '9+', label: '9+ units' },
        ]
      },
      {
        id: 'flatpack_or_built',
        question: 'Are the units flatpack or pre-built?',
        type: 'radio',
        required: true,
        options: [
          { value: 'flatpack', label: 'Flatpack (needs assembly)' },
          { value: 'pre-built', label: 'Pre-built (ready to install)' },
        ]
      },
      {
        id: 'appliance_cabinet',
        question: 'Do you need integrated appliance cabinets?',
        type: 'radio',
        required: false,
        options: [
          { value: 'oven-housing', label: 'Oven housing' },
          { value: 'fridge-freezer', label: 'Fridge/freezer housing' },
          { value: 'dishwasher', label: 'Dishwasher housing' },
          { value: 'none', label: 'None' },
        ]
      },
      {
        id: 'existing_units_removal',
        question: 'Do existing units need removing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'design_drawings',
        question: 'Do you have layout plans or drawings?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      }
    ]
  },
  {
    microSlug: 'pantry-utility-storage',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'storage_type',
        question: 'What kind of storage do you need?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'shelving', label: 'Shelving' },
          { value: 'cupboards', label: 'Cupboards' },
          { value: 'pullouts', label: 'Pull-out units' },
          { value: 'laundry-space', label: 'Laundry space' },
        ]
      },
      {
        id: 'area_size',
        question: 'What is the approximate size of the area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (under 2m²)' },
          { value: 'medium', label: 'Medium (2m² - 4m²)' },
          { value: 'large', label: 'Large (4m²+)' },
        ]
      },
      {
        id: 'material_preference',
        question: 'What material would you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'mdf', label: 'MDF' },
          { value: 'plywood', label: 'Plywood' },
          { value: 'solid-wood', label: 'Solid wood' },
        ]
      },
      {
        id: 'appliance_integration',
        question: 'Which appliances need space or housing?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'washer', label: 'Washing machine' },
          { value: 'dryer', label: 'Dryer' },
          { value: 'fridge', label: 'Fridge' },
          { value: 'freezer', label: 'Freezer' },
        ]
      },
      {
        id: 'design_style',
        question: 'What style are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'modern', label: 'Modern' },
          { value: 'rustic', label: 'Rustic' },
          { value: 'minimalist', label: 'Minimalist' },
        ]
      },
      {
        id: 'layout_plans',
        question: 'Do you have layout plans?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      }
    ]
  },
  {
    microSlug: 'worktop-install-replace',
    categorySlug: 'kitchen-bathroom',
    version: 1,
    questions: [
      {
        id: 'worktop_material',
        question: 'What material is the worktop?',
        type: 'radio',
        required: true,
        options: [
          { value: 'quartz', label: 'Quartz' },
          { value: 'granite', label: 'Granite' },
          { value: 'laminate', label: 'Laminate' },
          { value: 'wood', label: 'Solid wood' },
        ]
      },
      {
        id: 'worktop_length',
        question: 'Approximately how much worktop length?',
        type: 'radio',
        required: true,
        options: [
          { value: '0-3m', label: 'Up to 3m' },
          { value: '3-6m', label: '3m - 6m' },
          { value: '6m+', label: '6m+' },
        ]
      },
      {
        id: 'cutouts_needed',
        question: 'Which cutouts are needed?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'sink', label: 'Sink' },
          { value: 'hob', label: 'Hob' },
          { value: 'taps', label: 'Tap holes' },
        ]
      },
      {
        id: 'edge_finish',
        question: 'What edge finish do you want?',
        type: 'radio',
        required: false,
        options: [
          { value: 'square', label: 'Square edge' },
          { value: 'rounded', label: 'Rounded edge' },
          { value: 'beveled', label: 'Beveled edge' },
        ]
      },
      {
        id: 'existing_worktop_removal',
        question: 'Does an existing worktop need removing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'splashback_requirement',
        question: 'Do you need a splashback installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      }
    ]
  },

  // Construction & Extensions packs
  {
    microSlug: 'adding-new-rooms',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'room_type',
        question: 'What type of room(s) are you adding?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'living-room', label: 'Living room' },
          { value: 'office', label: 'Office' },
          { value: 'utility-storage', label: 'Utility/Storage' },
          { value: 'multiple-rooms', label: 'Multiple rooms' },
        ]
      },
      {
        id: 'extension_position',
        question: 'Where will the new room be located?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rear', label: 'Rear' },
          { value: 'side', label: 'Side' },
          { value: 'front', label: 'Front' },
          { value: 'over-garage', label: 'Over garage' },
          { value: 'loft', label: 'Loft' },
          { value: 'basement', label: 'Basement' },
        ]
      },
      {
        id: 'storeys',
        question: 'How many storeys in the extension?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single-storey', label: 'Single storey' },
          { value: 'double-storey', label: 'Double storey' },
          { value: 'multi-level', label: 'Multi-level' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'not-started', label: 'Not started' },
          { value: 'design-stage', label: 'Design stage' },
          { value: 'planning-submitted', label: 'Planning submitted' },
          { value: 'planning-approved', label: 'Planning approved' },
          { value: 'permitted-development', label: 'Permitted development' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'services_required',
        question: 'What services are needed?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'electrics', label: 'Electrics' },
          { value: 'plumbing', label: 'Plumbing' },
          { value: 'heating-cooling', label: 'Heating/Cooling' },
          { value: 'underfloor-heating', label: 'Underfloor heating' },
          { value: 'ventilation', label: 'Ventilation' },
        ]
      },
      {
        id: 'finish_level',
        question: 'How complete do you want the project?',
        type: 'radio',
        required: true,
        options: [
          { value: 'shell-only', label: 'Shell only' },
          { value: 'plastered-first-fix', label: 'Plastered & first-fix' },
          { value: 'ready-to-decorate', label: 'Ready to decorate' },
          { value: 'turnkey-all-finished', label: 'Turnkey - all finished' },
        ]
      },
      {
        id: 'property_type',
        question: 'What type of property is it?',
        type: 'radio',
        required: false,
        options: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'terraced', label: 'Terraced' },
          { value: 'semi-detached', label: 'Semi-detached' },
          { value: 'detached', label: 'Detached' },
          { value: 'rural-finca', label: 'Rural/Finca' },
          { value: 'other', label: 'Other' },
        ]
      }
    ]
  },
  {
    microSlug: 'conservatories-glass-rooms',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'structure_type',
        question: 'What type of structure do you want?',
        type: 'radio',
        required: true,
        options: [
          { value: 'upvc-conservatory', label: 'uPVC conservatory' },
          { value: 'aluminium-glass-room', label: 'Aluminium glass room' },
          { value: 'orangerie', label: 'Orangerie' },
          { value: 'replace-existing', label: 'Replace existing' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'usage_type',
        question: 'How will the space mainly be used?',
        type: 'radio',
        required: true,
        options: [
          { value: 'summer-room', label: 'Summer room' },
          { value: 'year-round-living', label: 'Year-round living' },
          { value: 'dining-room', label: 'Dining room' },
          { value: 'kitchen-extension', label: 'Kitchen extension' },
          { value: 'home-office', label: 'Home office' },
        ]
      },
      {
        id: 'approx_size',
        question: 'Approximately what size?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-10m2', label: 'Small (up to 10m²)' },
          { value: 'medium-10-20m2', label: 'Medium (10-20m²)' },
          { value: 'large-20m2-plus', label: 'Large (20m²+)' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'base_foundations',
        question: 'Is there an existing base?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new-base-needed', label: 'New base needed' },
          { value: 'use-existing-base', label: 'Use existing base' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'roof_type',
        question: 'What type of roof?',
        type: 'radio',
        required: false,
        options: [
          { value: 'glass', label: 'Glass' },
          { value: 'polycarbonate', label: 'Polycarbonate' },
          { value: 'solid-insulated', label: 'Solid insulated' },
          { value: 'upgrade-existing', label: 'Upgrade existing' },
        ]
      },
      {
        id: 'glazing_performance',
        question: 'What glazing performance level?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard-double', label: 'Standard double glazing' },
          { value: 'solar-control', label: 'Solar control' },
          { value: 'triple-glazed', label: 'Triple glazed' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within-permitted', label: 'Within permitted development' },
          { value: 'need-advice', label: 'Need advice' },
          { value: 'planning-submitted', label: 'Planning submitted' },
          { value: 'planning-approved', label: 'Planning approved' },
        ]
      },
      {
        id: 'finish_level',
        question: 'What scope of work is required?',
        type: 'radio',
        required: false,
        options: [
          { value: 'frames-and-roof-only', label: 'Frames and roof only' },
          { value: 'including-flooring-electrics', label: 'Including flooring & electrics' },
          { value: 'full-finished-room', label: 'Full finished room' },
        ]
      }
    ]
  },
  {
    microSlug: 'garage-conversions',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'garage_type',
        question: 'What type of garage?',
        type: 'radio',
        required: true,
        options: [
          { value: 'integral', label: 'Integral' },
          { value: 'attached', label: 'Attached' },
          { value: 'detached', label: 'Detached' },
          { value: 'double-garage', label: 'Double garage' },
        ]
      },
      {
        id: 'intended_use',
        question: 'What will the converted space be used for?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'home-office', label: 'Home office' },
          { value: 'living-room', label: 'Living room' },
          { value: 'annexe-studio', label: 'Annexe/Studio' },
          { value: 'playroom', label: 'Playroom' },
          { value: 'bathroom-ensuite', label: 'Bathroom/Ensuite' },
          { value: 'utility-laundry', label: 'Utility/Laundry' },
        ]
      },
      {
        id: 'structural_changes',
        question: 'What structural changes are needed?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'replace-garage-door-with-wall-windows', label: 'Replace garage door with wall/windows' },
          { value: 'new-openings-into-house', label: 'New openings into house' },
          { value: 'partition-walls', label: 'Partition walls' },
          { value: 'floor-level-changes', label: 'Floor level changes' },
          { value: 'none-minor-only', label: 'None/minor only' },
        ]
      },
      {
        id: 'insulation_level',
        question: 'What insulation level is required?',
        type: 'radio',
        required: true,
        options: [
          { value: 'building-regs-compliant', label: 'Building regs compliant' },
          { value: 'basic-upgrade', label: 'Basic upgrade' },
          { value: 'not-sure-need-advice', label: 'Not sure - need advice' },
        ]
      },
      {
        id: 'services_required',
        question: 'What services are required?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'electrics-lighting', label: 'Electrics & lighting' },
          { value: 'additional-sockets-data', label: 'Additional sockets/data' },
          { value: 'heating-radiators', label: 'Heating/Radiators' },
          { value: 'underfloor-heating', label: 'Underfloor heating' },
          { value: 'plumbing-bathroom-kitchenette', label: 'Plumbing (bathroom/kitchenette)' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no-planning-needed-believed', label: 'No planning needed (believed)' },
          { value: 'need-advice', label: 'Need advice' },
          { value: 'planning-submitted', label: 'Planning submitted' },
          { value: 'planning-approved', label: 'Planning approved' },
        ]
      },
      {
        id: 'parking_impact',
        question: 'What happens to parking?',
        type: 'radio',
        required: false,
        options: [
          { value: 'driveway-still-available', label: 'Driveway still available' },
          { value: 'street-parking-only', label: 'Street parking only' },
          { value: 'other-parking-arrangements', label: 'Other parking arrangements' },
        ]
      }
    ]
  },
  {
    microSlug: 'home-extensions-single-floor',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'extension_position',
        question: 'Where will the extension be located?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rear', label: 'Rear' },
          { value: 'side', label: 'Side' },
          { value: 'front', label: 'Front' },
          { value: 'wrap-around', label: 'Wrap-around' },
          { value: 'courtyard-infill', label: 'Courtyard infill' },
        ]
      },
      {
        id: 'approx_size',
        question: 'Approximately what size?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-15m2', label: 'Small (up to 15m²)' },
          { value: 'medium-15-30m2', label: 'Medium (15-30m²)' },
          { value: 'large-30m2-plus', label: 'Large (30m²+)' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'room_use',
        question: 'What will the space be used for?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'dining', label: 'Dining' },
          { value: 'living', label: 'Living' },
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'office', label: 'Office' },
          { value: 'utility-storage', label: 'Utility/Storage' },
        ]
      },
      {
        id: 'roof_type',
        question: 'What type of roof?',
        type: 'radio',
        required: true,
        options: [
          { value: 'flat', label: 'Flat' },
          { value: 'pitched', label: 'Pitched' },
          { value: 'hipped', label: 'Hipped' },
          { value: 'part-flat-part-pitched', label: 'Part flat, part pitched' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'not-started', label: 'Not started' },
          { value: 'need-advice', label: 'Need advice' },
          { value: 'plans-prepared-not-submitted', label: 'Plans prepared, not submitted' },
          { value: 'planning-submitted', label: 'Planning submitted' },
          { value: 'planning-approved', label: 'Planning approved' },
          { value: 'believed-permitted-development', label: 'Believed permitted development' },
        ]
      },
      {
        id: 'finish_level',
        question: 'How complete do you want the project?',
        type: 'radio',
        required: true,
        options: [
          { value: 'shell-only', label: 'Shell only' },
          { value: 'plastered-first-fix', label: 'Plastered & first-fix' },
          { value: 'ready-for-kitchen-bathroom', label: 'Ready for kitchen/bathroom' },
          { value: 'turnkey-all-finishes', label: 'Turnkey - all finishes' },
        ]
      },
      {
        id: 'property_type',
        question: 'What type of property is it?',
        type: 'radio',
        required: false,
        options: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'terraced', label: 'Terraced' },
          { value: 'semi-detached', label: 'Semi-detached' },
          { value: 'detached', label: 'Detached' },
          { value: 'rural-finca', label: 'Rural/Finca' },
          { value: 'other', label: 'Other' },
        ]
      }
    ]
  },
  {
    microSlug: 'home-extensions-two-floors',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'extension_position',
        question: 'Where will the two-storey extension be located?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rear', label: 'Rear' },
          { value: 'side', label: 'Side' },
          { value: 'front', label: 'Front' },
          { value: 'wrap-around', label: 'Wrap-around' },
        ]
      },
      {
        id: 'approx_size',
        question: 'Approximately what footprint size?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-20m2', label: 'Small (up to 20m²)' },
          { value: 'medium-20-35m2', label: 'Medium (20-35m²)' },
          { value: 'large-35m2-plus', label: 'Large (35m²+)' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'ground_floor_use',
        question: 'What will the ground floor be used for?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'dining', label: 'Dining' },
          { value: 'living', label: 'Living' },
          { value: 'utility-storage', label: 'Utility/Storage' },
          { value: 'bathroom-wc', label: 'Bathroom/WC' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'first_floor_use',
        question: 'What will the upper floor be used for?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'ensuite-bathroom', label: 'Ensuite bathroom' },
          { value: 'office', label: 'Office' },
          { value: 'studio-living', label: 'Studio/Living' },
          { value: 'storage', label: 'Storage' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'not-started', label: 'Not started' },
          { value: 'need-advice', label: 'Need advice' },
          { value: 'plans-prepared-not-submitted', label: 'Plans prepared, not submitted' },
          { value: 'planning-submitted', label: 'Planning submitted' },
          { value: 'planning-approved', label: 'Planning approved' },
        ]
      },
      {
        id: 'structural_complexity',
        question: 'What is the structural complexity?',
        type: 'radio',
        required: true,
        options: [
          { value: 'simple-add-on', label: 'Simple add-on' },
          { value: 'requires-steel-beams', label: 'Requires steel beams' },
          { value: 'complex-structural-changes', label: 'Complex structural changes' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'finish_level',
        question: 'How complete do you want both floors?',
        type: 'radio',
        required: true,
        options: [
          { value: 'structure-and-shell-only', label: 'Structure and shell only' },
          { value: 'first-fix-and-plaster', label: 'First-fix and plaster' },
          { value: 'ready-for-client-to-fit-kitchens-bathrooms', label: 'Ready for client to fit kitchens/bathrooms' },
          { value: 'turnkey-all-finishes-complete', label: 'Turnkey - all finishes complete' },
        ]
      },
      {
        id: 'property_type',
        question: 'What type of property is it?',
        type: 'radio',
        required: false,
        options: [
          { value: 'terraced', label: 'Terraced' },
          { value: 'semi-detached', label: 'Semi-detached' },
          { value: 'detached', label: 'Detached' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'rural-finca', label: 'Rural/Finca' },
          { value: 'other', label: 'Other' },
        ]
      }
    ]
  },
  {
    microSlug: 'terrace-rooftop-extensions',
    categorySlug: 'construction-extensions',
    version: 1,
    questions: [
      {
        id: 'existing_roof_or_terrace',
        question: 'What currently exists on the roof/terrace?',
        type: 'radio',
        required: true,
        options: [
          { value: 'flat-roof-no-terrace', label: 'Flat roof, no terrace' },
          { value: 'existing-terrace', label: 'Existing terrace' },
          { value: 'partly-built-structure', label: 'Partly built structure' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'structure_type',
        question: 'What type of extension is planned?',
        type: 'radio',
        required: true,
        options: [
          { value: 'lightweight-room', label: 'Lightweight room' },
          { value: 'full-masonry-extension', label: 'Full masonry extension' },
          { value: 'pergola-covered-area', label: 'Pergola/Covered area' },
          { value: 'glazed-room', label: 'Glazed room' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'approx_size',
        question: 'Approximately what size?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-15m2', label: 'Small (up to 15m²)' },
          { value: 'medium-15-30m2', label: 'Medium (15-30m²)' },
          { value: 'large-30m2-plus', label: 'Large (30m²+)' },
          { value: 'not-sure', label: 'Not sure' },
        ]
      },
      {
        id: 'intended_use',
        question: 'How will the rooftop space be used?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'bedroom-suite', label: 'Bedroom suite' },
          { value: 'living-lounge', label: 'Living/Lounge' },
          { value: 'office-studio', label: 'Office/Studio' },
          { value: 'outdoor-entertaining', label: 'Outdoor entertaining' },
          { value: 'wellness-gym', label: 'Wellness/Gym' },
          { value: 'other', label: 'Other' },
        ]
      },
      {
        id: 'access_type',
        question: 'What is the access situation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'internal-staircase-existing', label: 'Internal staircase (existing)' },
          { value: 'internal-staircase-to-be-added', label: 'Internal staircase (to be added)' },
          { value: 'external-staircase', label: 'External staircase' },
          { value: 'ladder-or-hatch', label: 'Ladder or hatch' },
          { value: 'not-planned-yet', label: 'Not planned yet' },
        ]
      },
      {
        id: 'structural_check_status',
        question: 'Has a structural engineer checked load capacity?',
        type: 'radio',
        required: true,
        options: [
          { value: 'engineer-checked-approved', label: 'Engineer checked & approved' },
          { value: 'engineer-engaged-awaiting-report', label: 'Engineer engaged, awaiting report' },
          { value: 'not-checked-yet', label: 'Not checked yet' },
          { value: 'not-sure-if-needed', label: 'Not sure if needed' },
        ]
      },
      {
        id: 'planning_status',
        question: 'What is the planning status?',
        type: 'radio',
        required: true,
        options: [
          { value: 'not-started', label: 'Not started' },
          { value: 'need-advice', label: 'Need advice' },
          { value: 'planning-or-licence-submitted', label: 'Planning/licence submitted' },
          { value: 'planning-or-licence-approved', label: 'Planning/licence approved' },
          { value: 'community-approval-required', label: 'Community approval required' },
        ]
      },
      {
        id: 'finish_level',
        question: 'What scope of work is required?',
        type: 'radio',
        required: true,
        options: [
          { value: 'structure-and-waterproofing-only', label: 'Structure and waterproofing only' },
          { value: 'structure-plus-first-fix', label: 'Structure plus first-fix' },
          { value: 'turnkey-finished-space', label: 'Turnkey finished space' },
        ]
      }
    ]
  },

  // ========================================
  // BRICKWORK, MASONRY & CONCRETE
  // ========================================

  {
    microSlug: 'building-or-repairing-walls',
    categorySlug: 'brickwork-masonry-concrete',
    version: 1,
    questions: [
      {
        id: 'wall_scope',
        question: 'Whether this is a new wall, repair, or alteration',
        type: 'radio',
        required: true,
        options: [
          { value: 'new-wall', label: 'New wall' },
          { value: 'repair-damaged-areas', label: 'Repair damaged areas' },
          { value: 'repointing-only', label: 'Repointing only' },
          { value: 'altering-existing-wall', label: 'Altering existing wall' },
        ],
      },
      {
        id: 'wall_location_type',
        question: 'Internal vs external and whether wall is structural',
        type: 'radio',
        required: true,
        options: [
          { value: 'internal-partition', label: 'Internal partition' },
          { value: 'internal-load-bearing', label: 'Internal load-bearing' },
          { value: 'external-wall', label: 'External wall' },
          { value: 'retaining-wall', label: 'Retaining wall' },
          { value: 'boundary-wall', label: 'Boundary wall' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'wall_material',
        question: 'Main wall material',
        type: 'radio',
        required: true,
        options: [
          { value: 'brick', label: 'Brick' },
          { value: 'concrete-block', label: 'Concrete block' },
          { value: 'stone', label: 'Stone' },
          { value: 'rendered-masonry', label: 'Rendered masonry' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'approx_wall_size',
        question: 'Approx length/height of wall area',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-3m', label: 'Small (up to 3m)' },
          { value: 'medium-3-8m', label: 'Medium (3-8m)' },
          { value: 'large-8m-plus', label: 'Large (8m+)' },
          { value: 'multiple-areas', label: 'Multiple areas' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'damage_type',
        question: 'If repair, what type of issues are present',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'cracks', label: 'Cracks' },
          { value: 'loose-or-missing-bricks', label: 'Loose or missing bricks' },
          { value: 'blown-or-missing-mortar', label: 'Blown or missing mortar' },
          { value: 'movement-or-bowing', label: 'Movement or bowing' },
          { value: 'damp-or-water-ingress', label: 'Damp or water ingress' },
          { value: 'general-cosmetic-repair', label: 'General cosmetic repair' },
        ],
      },
      {
        id: 'finish_required',
        question: 'Finish the client wants on the wall',
        type: 'radio',
        required: false,
        options: [
          { value: 'face-brick-exposed', label: 'Face brick (exposed)' },
          { value: 'to-be-rendered', label: 'To be rendered' },
          { value: 'to-be-plastered', label: 'To be plastered' },
          { value: 'to-be-painted', label: 'To be painted' },
          { value: 'no-finish-required', label: 'No finish required' },
        ],
      },
      {
        id: 'design_or_drawings',
        question: 'Whether drawings or specs exist',
        type: 'radio',
        required: false,
        options: [
          { value: 'no-drawings-needed-simple-wall', label: 'No drawings needed (simple wall)' },
          { value: 'have-architect-or-engineer-drawings', label: 'Have architect/engineer drawings' },
          { value: 'need-help-with-design', label: 'Need help with design' },
        ],
      },
      {
        id: 'access_constraints',
        question: 'Access conditions around the wall area',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access' },
          { value: 'limited-access-narrow', label: 'Limited access (narrow)' },
          { value: 'upper-floor-or-scaffolding-likely', label: 'Upper floor or scaffolding likely' },
          { value: 'shared-boundary-access-issues', label: 'Shared boundary access issues' },
        ],
      },
    ],
  },

  {
    microSlug: 'concrete-bases-paths-floors',
    categorySlug: 'brickwork-masonry-concrete',
    version: 1,
    questions: [
      {
        id: 'concrete_job_type',
        question: 'Type of concrete work required',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'shed-or-outbuilding-base', label: 'Shed or outbuilding base' },
          { value: 'hot-tub-or-pool-plant-base', label: 'Hot tub or pool plant base' },
          { value: 'path-or-patio-slab', label: 'Path or patio slab' },
          { value: 'driveway-slab', label: 'Driveway slab' },
          { value: 'internal-floor-slab', label: 'Internal floor slab' },
          { value: 'garage-or-workshop-floor', label: 'Garage or workshop floor' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'approx_area',
        question: 'Approximate area of concrete work',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-up-to-10m2', label: 'Small (up to 10m²)' },
          { value: 'medium-10-30m2', label: 'Medium (10-30m²)' },
          { value: 'large-30-60m2', label: 'Large (30-60m²)' },
          { value: 'very-large-60m2-plus', label: 'Very large (60m²+)' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'base_preparation',
        question: 'Whether ground is prepared or needs excavation',
        type: 'radio',
        required: true,
        options: [
          { value: 'clear-level-ground-already', label: 'Clear level ground already' },
          { value: 'needs-digging-and-hardcore', label: 'Needs digging and hardcore' },
          { value: 'removal-of-old-slab-required', label: 'Removal of old slab required' },
          { value: 'not-sure-need-advice', label: 'Not sure, need advice' },
        ],
      },
      {
        id: 'thickness_and_strength',
        question: 'Desired slab thickness / strength where known',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard-light-use', label: 'Standard light use' },
          { value: 'heavy-duty-vehicles-or-machinery', label: 'Heavy duty (vehicles or machinery)' },
          { value: 'to-match-engineer-spec', label: 'To match engineer spec' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'reinforcement_required',
        question: 'Whether the slab needs reinforcement',
        type: 'radio',
        required: false,
        options: [
          { value: 'no-reinforcement-needed', label: 'No reinforcement needed' },
          { value: 'steel-mesh', label: 'Steel mesh' },
          { value: 'rebar-cage-or-beams', label: 'Rebar cage or beams' },
          { value: 'to-follow-engineer-spec', label: 'To follow engineer spec' },
          { value: 'not-sure-need-advice', label: 'Not sure, need advice' },
        ],
      },
      {
        id: 'surface_finish',
        question: 'Desired finish on the concrete surface',
        type: 'radio',
        required: false,
        options: [
          { value: 'basic-trowel-finish', label: 'Basic trowel finish' },
          { value: 'brushed-or-non-slip', label: 'Brushed or non-slip' },
          { value: 'power-floated-smooth', label: 'Power floated (smooth)' },
          { value: 'to-be-tiled-or-decked-later', label: 'To be tiled or decked later' },
          { value: 'to-be-resin-or-other-finish', label: 'To be resin or other finish' },
        ],
      },
      {
        id: 'drainage_and_fall',
        question: 'Drainage / falls required for external slabs',
        type: 'radio',
        required: false,
        options: [
          { value: 'simple-fall-away-from-building', label: 'Simple fall away from building' },
          { value: 'link-to-existing-drainage', label: 'Link to existing drainage' },
          { value: 'new-drain-channel-or-gullies', label: 'New drain channel or gullies' },
          { value: 'internal-area-no-drainage-needed', label: 'Internal area (no drainage needed)' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'access_for_concrete',
        question: 'Access for barrow, pump or mixer',
        type: 'radio',
        required: false,
        options: [
          { value: 'vehicle-access-next-to-area', label: 'Vehicle access next to area' },
          { value: 'barrow-access-only', label: 'Barrow access only' },
          { value: 'pump-likely-required', label: 'Pump likely required' },
          { value: 'restricted-access-steps-or-tight-corners', label: 'Restricted access (steps or tight corners)' },
        ],
      },
    ],
  },

  {
    microSlug: 'garden-boundary-walls',
    categorySlug: 'brickwork-masonry-concrete',
    version: 1,
    questions: [
      {
        id: 'wall_purpose',
        question: 'Main purpose of the garden/boundary wall',
        type: 'radio',
        required: true,
        options: [
          { value: 'privacy-screen', label: 'Privacy screen' },
          { value: 'security-boundary', label: 'Security boundary' },
          { value: 'decorative-feature', label: 'Decorative feature' },
          { value: 'retaining-earth', label: 'Retaining earth' },
          { value: 'acoustic-or-wind-break', label: 'Acoustic or wind break' },
        ],
      },
      {
        id: 'wall_scope',
        question: 'Is this a new wall or work on an existing one',
        type: 'radio',
        required: true,
        options: [
          { value: 'new-wall', label: 'New wall' },
          { value: 'extend-or-raise-existing', label: 'Extend or raise existing' },
          { value: 'repair-or-rebuild-damaged', label: 'Repair or rebuild damaged' },
          { value: 'full-replacement', label: 'Full replacement' },
        ],
      },
      {
        id: 'approx_length',
        question: 'Approximate length of the wall',
        type: 'radio',
        required: true,
        options: [
          { value: 'up-to-5m', label: 'Up to 5m' },
          { value: '5-15m', label: '5-15m' },
          { value: '15-30m', label: '15-30m' },
          { value: '30m-plus-or-multiple-sides', label: '30m+ or multiple sides' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        id: 'approx_height',
        question: 'Approximate height of the wall',
        type: 'radio',
        required: true,
        options: [
          { value: 'low-up-to-600mm', label: 'Low (up to 600mm)' },
          { value: 'medium-600mm-to-1_2m', label: 'Medium (600mm to 1.2m)' },
          { value: 'tall-1_2m-to-2m', label: 'Tall (1.2m to 2m)' },
          { value: 'very-tall-over-2m', label: 'Very tall (over 2m)' },
          { value: 'varies-along-boundary', label: 'Varies along boundary' },
        ],
      },
      {
        id: 'wall_material',
        question: 'Preferred material for the boundary wall',
        type: 'radio',
        required: true,
        options: [
          { value: 'brick', label: 'Brick' },
          { value: 'concrete-block-rendered', label: 'Concrete block (rendered)' },
          { value: 'natural-stone', label: 'Natural stone' },
          { value: 'stone-faced-blockwork', label: 'Stone-faced blockwork' },
          { value: 'other-masonry', label: 'Other masonry' },
        ],
      },
      {
        id: 'finish_and_style',
        question: 'Finish/style required for the wall',
        type: 'radio',
        required: false,
        options: [
          { value: 'exposed-brick-or-stone', label: 'Exposed brick or stone' },
          { value: 'smooth-render', label: 'Smooth render' },
          { value: 'textured-or-rustic-render', label: 'Textured or rustic render' },
          { value: 'to-be-painted', label: 'To be painted' },
          { value: 'to-match-existing-wall', label: 'To match existing wall' },
        ],
      },
      {
        id: 'ownership_and_boundaries',
        question: 'Boundary ownership / neighbour agreement context',
        type: 'radio',
        required: false,
        options: [
          { value: 'clearly-my-boundary', label: 'Clearly my boundary' },
          { value: 'shared-boundary-with-neighbour', label: 'Shared boundary with neighbour' },
          { value: 'unsure-who-owns-wall', label: 'Unsure who owns wall' },
          { value: 'neighbour-already-agreed', label: 'Neighbour already agreed' },
        ],
      },
      {
        id: 'planning_or_height_limits',
        question: 'Any planning / community / height constraints',
        type: 'radio',
        required: false,
        options: [
          { value: 'within-standard-height-limits', label: 'Within standard height limits' },
          { value: 'may-exceed-normal-height', label: 'May exceed normal height' },
          { value: 'in-conservation-or-special-area', label: 'In conservation or special area' },
          { value: 'not-sure-need-advice', label: 'Not sure, need advice' },
        ],
      },
    ],
  },

  // ============================================================
  // POOL & SPA - HEATING (7 packs)
  // ============================================================

  // Electric pool heaters
  {
    microSlug: 'electric-pool-heaters',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'indoor', label: 'Indoor pool' },
          { value: 'outdoor', label: 'Outdoor pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'pool_volume',
        question: 'Roughly how big is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'under-20m3', label: 'Small – under 20 m³' },
          { value: '20-50m3', label: 'Medium – 20–50 m³' },
          { value: '50-80m3', label: 'Large – 50–80 m³' },
          { value: 'over-80m3', label: 'Very large – over 80 m³' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-install', label: 'New electric heater installation' },
          { value: 'replace-existing', label: 'Replace an existing heater' },
          { value: 'diagnose-problem', label: 'Diagnose a fault or poor performance' },
          { value: 'relocate', label: 'Relocate / re-site an existing heater' }
        ]
      },
      {
        id: 'power_supply',
        question: 'Do you already have a suitable electrical supply near the plant room?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes-dedicated-supply', label: 'Yes – dedicated pool heater supply already in place' },
          { value: 'yes-but-may-need-upgrade', label: 'Yes – but it may need upgrading' },
          { value: 'no-supply-yet', label: 'No – electrical supply needs to be installed' },
          { value: 'not-sure', label: 'Not sure – need electrician to check' }
        ]
      },
      {
        id: 'plant_location',
        question: 'Where is the plant / equipment located?',
        type: 'radio',
        required: false,
        options: [
          { value: 'indoor-plant-room', label: 'Indoor plant room' },
          { value: 'outdoor-plant-room', label: 'Outdoor plant room / shed' },
          { value: 'open-air-next-to-pool', label: 'Open-air, next to pool' }
        ]
      },
      {
        id: 'control_preference',
        question: 'How would you like to control the heater?',
        type: 'radio',
        required: false,
        options: [
          { value: 'basic-on-off', label: 'Basic on/off and temperature control' },
          { value: 'timer-and-schedules', label: 'Timer and heating schedules' },
          { value: 'smartphone-app', label: 'Smartphone / smart home control if possible' },
          { value: 'no-preference', label: 'No preference – open to advice' }
        ]
      },
      {
        id: 'existing_system_info',
        question: 'Do you already have any pool heating system installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no-heating', label: 'No, there is no heating at the moment' },
          { value: 'electric-heater', label: 'Yes – an existing electric heater' },
          { value: 'heat-pump', label: 'Yes – a heat pump' },
          { value: 'solar-or-other', label: 'Yes – solar or other system' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the work to be done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-1-week', label: 'Urgent – within 1 week' },
          { value: 'soon-1-month', label: 'Soon – within 1 month' },
          { value: 'flexible-3-months', label: 'Flexible – within the next 3 months' },
          { value: 'planning-stage', label: 'Just planning / looking for quotes' }
        ]
      }
    ]
  },

  // Energy efficiency upgrades
  {
    microSlug: 'energy-efficiency-upgrades',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool or spa do you want to improve?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-small-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'current_heating',
        question: 'How is the pool currently heated?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no-heating', label: 'No heating at the moment' },
          { value: 'electric-heater', label: 'Electric heater' },
          { value: 'gas-heater', label: 'Gas boiler / heater' },
          { value: 'heat-pump', label: 'Heat pump' },
          { value: 'solar', label: 'Solar heating' },
          { value: 'not-sure', label: 'Not sure / mixed system' }
        ]
      },
      {
        id: 'upgrade_goals',
        question: 'What are your main goals for the upgrade?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'reduce-running-costs', label: 'Reduce running costs' },
          { value: 'improve-heating-performance', label: 'Improve heating performance' },
          { value: 'automate-and-optimise', label: 'Automate and optimise control' },
          { value: 'environmental-impact', label: 'Lower environmental impact' }
        ]
      },
      {
        id: 'existing_efficiency_measures',
        question: 'Which efficiency measures do you already use?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'thermal-cover', label: 'Thermal pool cover or blanket' },
          { value: 'slatted-or-automatic-cover', label: 'Automatic / slatted cover' },
          { value: 'timers-or-schedules', label: 'Timers / basic heating schedules' },
          { value: 'smart-controls', label: 'Smartphone or smart home controls' },
          { value: 'none', label: 'None of the above' }
        ]
      },
      {
        id: 'open_to_changes',
        question: 'Are you open to changing the heating system type if it saves energy?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes-any-solution', label: 'Yes – open to any efficient solution' },
          { value: 'yes-but-budget-limited', label: 'Yes – but budget is limited' },
          { value: 'prefer-keeping-current-system', label: 'Prefer to keep current system and optimise it' }
        ]
      },
      {
        id: 'monthly_usage_pattern',
        question: 'How often is the pool or spa used?',
        type: 'radio',
        required: false,
        options: [
          { value: 'year-round', label: 'Year-round' },
          { value: 'seasonal-summer', label: 'Seasonal – mainly summer' },
          { value: 'weekends-and-holidays', label: 'Mostly weekends / holidays' },
          { value: 'occasional', label: 'Occasionally' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like to make these upgrades?',
        type: 'radio',
        required: true,
        options: [
          { value: 'before-next-season', label: 'Before the next pool season' },
          { value: 'within-1-2-months', label: 'Within the next 1–2 months' },
          { value: 'flexible', label: 'Flexible – no fixed deadline' },
          { value: 'just-exploring', label: 'Just exploring options and budgets' }
        ]
      }
    ]
  },

  // Gas pool heaters
  {
    microSlug: 'gas-pool-heaters',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        id: 'pool_size',
        question: 'Roughly how big is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'under-20m3', label: 'Small – under 20 m³' },
          { value: '20-50m3', label: 'Medium – 20–50 m³' },
          { value: '50-80m3', label: 'Large – 50–80 m³' },
          { value: 'over-80m3', label: 'Very large – over 80 m³' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-install', label: 'New gas heater installation' },
          { value: 'replace-existing', label: 'Replace an existing gas heater' },
          { value: 'service-maintenance', label: 'Service and safety check' },
          { value: 'fault-diagnosis', label: 'Diagnose a fault or error' }
        ]
      },
      {
        id: 'gas_supply',
        question: 'What type of gas supply do you have available?',
        type: 'radio',
        required: true,
        options: [
          { value: 'mains-gas', label: 'Mains gas' },
          { value: 'bottled-lpg', label: 'Bottled gas (LPG)' },
          { value: 'tank-lpg', label: 'Buried or surface LPG tank' },
          { value: 'no-gas-yet', label: 'No gas supply yet' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'flue_and_venting',
        question: 'Do you already have a suitable flue or venting route?',
        type: 'radio',
        required: false,
        options: [
          { value: 'existing-flue-ok', label: 'Yes – existing flue / vent can be reused' },
          { value: 'needs-new-flue', label: 'No – a new flue / vent is needed' },
          { value: 'outdoor-unit-no-flue-needed', label: 'Heater will be outdoors – minimal flue required' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'access_to_plant_area',
        question: 'How easy is access to the heater / plant area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-vehicle-access', label: 'Easy vehicle and person access' },
          { value: 'narrow-or-steps', label: 'Narrow paths or steps' },
          { value: 'very-restricted', label: 'Very restricted – tight access' }
        ]
      },
      {
        id: 'timing',
        question: 'When do you need this work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-1-week', label: 'Urgent – within 1 week' },
          { value: 'soon-1-month', label: 'Soon – within 1 month' },
          { value: 'before-next-season', label: 'Before the next pool season' },
          { value: 'planning-only', label: 'Just planning / budget quotes' }
        ]
      }
    ]
  },

  // Heat pump installation
  {
    microSlug: 'heat-pump-installation',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_or_spa_type',
        question: 'Is this for a pool, spa, or both?',
        type: 'radio',
        required: true,
        options: [
          { value: 'swimming-pool', label: 'Swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'both', label: 'Both pool and spa' }
        ]
      },
      {
        id: 'pool_size',
        question: 'Roughly how big is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'under-20m3', label: 'Small – under 20 m³' },
          { value: '20-50m3', label: 'Medium – 20–50 m³' },
          { value: '50-80m3', label: 'Large – 50–80 m³' },
          { value: 'over-80m3', label: 'Very large – over 80 m³' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-install', label: 'New heat pump installation' },
          { value: 'replace-existing', label: 'Replace an existing heat pump' },
          { value: 'add-second-unit', label: 'Add a second unit to existing system' }
        ]
      },
      {
        id: 'existing_heating',
        question: 'What heating do you currently have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'none', label: 'No heating at the moment' },
          { value: 'electric-heater', label: 'Electric heater' },
          { value: 'gas-heater', label: 'Gas heater' },
          { value: 'existing-heat-pump', label: 'Existing heat pump' },
          { value: 'other', label: 'Other / unsure' }
        ]
      },
      {
        id: 'power_and_location',
        question: 'Do you already know where the heat pump can be positioned?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes-clear-space-near-plant', label: 'Yes – clear outdoor space near plant room' },
          { value: 'yes-but-far-from-plant', label: 'Yes – but it is further away from plant room' },
          { value: 'no-need-advice', label: 'No – need advice on best location' }
        ]
      },
      {
        id: 'noise_sensitivity',
        question: 'Is noise from the heat pump a concern?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no-neighbours-close', label: 'No – no close neighbours' },
          { value: 'some-neighbours', label: 'Yes – some neighbours nearby' },
          { value: 'very-sensitive', label: 'Yes – very noise sensitive area' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the heat pump work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-2-weeks', label: 'Urgent – within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'before-season', label: 'Before the next pool season' },
          { value: 'planning-only', label: 'Just planning and comparing options' }
        ]
      }
    ]
  },

  // Pool blankets and covers
  {
    microSlug: 'pool-blankets-covers',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool do you need a cover for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'in-ground', label: 'In-ground pool' },
          { value: 'above-ground', label: 'Above-ground pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        id: 'pool_shape',
        question: 'What shape is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'kidney-freeform', label: 'Kidney / freeform' },
          { value: 'round-oval', label: 'Round / oval' },
          { value: 'other-irregular', label: 'Other / very irregular shape' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-cover-supply-install', label: 'Supply and install a new cover' },
          { value: 'replace-old-cover', label: 'Replace an old or damaged cover' },
          { value: 'size-and-cut-to-fit', label: 'Measure, cut and fit a new blanket to existing reel' },
          { value: 'advice-only', label: 'Advice on best type of cover' }
        ]
      },
      {
        id: 'cover_type_preference',
        question: 'Do you have a preferred type of cover?',
        type: 'radio',
        required: false,
        options: [
          { value: 'thermal-blanket', label: 'Thermal blanket (bubble cover)' },
          { value: 'automatic-slatted', label: 'Automatic / slatted cover' },
          { value: 'safety-cover', label: 'Safety cover (for children / pets)' },
          { value: 'winter-cover', label: 'Winter debris cover' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'existing_reel_or_system',
        question: 'Do you already have a reel or cover system installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'manual-reel', label: 'Yes – manual reel system' },
          { value: 'automatic-system', label: 'Yes – automatic cover system' },
          { value: 'no-system-yet', label: 'No – no system yet' }
        ]
      },
      {
        id: 'safety_priority',
        question: 'Is child and pet safety a main priority?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-main-priority', label: 'Yes – main priority' },
          { value: 'some-importance', label: 'Somewhat important' },
          { value: 'no-more-for-heat-and-cleanliness', label: 'No – mainly for heat retention and cleanliness' }
        ]
      },
      {
        id: 'timing',
        question: 'When do you need the cover work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-2-weeks', label: 'Urgent – within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'before-winter', label: 'Before the winter season' },
          { value: 'before-summer', label: 'Before the summer season' }
        ]
      }
    ]
  },

  // Pool heating repairs
  {
    microSlug: 'pool-heating-repairs',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool heating system do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'electric-heater', label: 'Electric heater' },
          { value: 'gas-heater', label: 'Gas heater' },
          { value: 'heat-pump', label: 'Heat pump' },
          { value: 'solar', label: 'Solar heating' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'issue_main_symptom',
        question: 'What is the main issue you\'re experiencing?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'no-heating', label: 'System not heating at all' },
          { value: 'poor-heating', label: 'Water heats very slowly or not enough' },
          { value: 'error-codes', label: 'Error codes or warning lights' },
          { value: 'leaks', label: 'Leaks around the heater or pipework' },
          { value: 'unusual-noise', label: 'Unusual noise from the unit' },
          { value: 'tripping-electrics', label: 'Tripping electrics / breakers' }
        ]
      },
      {
        id: 'system_age',
        question: 'Roughly how old is the heating system?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-3-years', label: 'Under 3 years old' },
          { value: '3-7-years', label: '3–7 years old' },
          { value: 'over-7-years', label: 'Over 7 years old' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'recent_work_or_changes',
        question: 'Has any recent work or change been done to the pool or electrics/gas?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-recent-work', label: 'Yes – recent work was done' },
          { value: 'no-changes', label: 'No – no changes' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'system_access',
        question: 'How easy is access to the heater / plant area for repairs?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access' },
          { value: 'narrow-or-steps', label: 'Narrow access or steps' },
          { value: 'very-restricted', label: 'Very restricted access' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the repair?',
        type: 'radio',
        required: true,
        options: [
          { value: 'system-down-urgent', label: 'System down – very urgent' },
          { value: 'soon-within-1-week', label: 'Soon – within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'not-urgent', label: 'Not urgent – just investigating' }
        ]
      }
    ]
  },

  // Solar pool heating
  {
    microSlug: 'solar-pool-heating',
    subcategorySlug: 'heating',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        id: 'pool_size',
        question: 'Roughly how big is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'under-20m3', label: 'Small – under 20 m³' },
          { value: '20-50m3', label: 'Medium – 20–50 m³' },
          { value: '50-80m3', label: 'Large – 50–80 m³' },
          { value: 'over-80m3', label: 'Very large – over 80 m³' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-solar-install', label: 'New solar heating installation' },
          { value: 'upgrade-existing-system', label: 'Upgrade or expand an existing solar system' },
          { value: 'repair-existing-system', label: 'Repair an existing solar heating system' }
        ]
      },
      {
        id: 'panel_location',
        question: 'Where could the solar panels be installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'roof-house', label: 'On the house roof' },
          { value: 'roof-garage-outbuilding', label: 'On a garage / outbuilding' },
          { value: 'ground-mounted-frame', label: 'On a ground-mounted frame' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'sun_exposure',
        question: 'How much direct sun does the proposed panel area get?',
        type: 'radio',
        required: false,
        options: [
          { value: 'all-day-sun', label: 'Sun for most of the day' },
          { value: 'morning-or-afternoon', label: 'Mainly morning or afternoon sun' },
          { value: 'partly-shaded', label: 'Partly shaded' },
          { value: 'heavily-shaded', label: 'Heavily shaded' }
        ]
      },
      {
        id: 'integration_with_existing',
        question: 'Do you want solar to work with an existing heater?',
        type: 'radio',
        required: false,
        options: [
          { value: 'solar-primary-backup-existing', label: 'Yes – solar as main heat, existing as backup' },
          { value: 'solar-add-on', label: 'Yes – add solar to help reduce costs' },
          { value: 'solar-only', label: 'No – solar only' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the solar work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'before-next-season', label: 'Before the next pool season' },
          { value: 'within-2-months', label: 'Within the next 2 months' },
          { value: 'flexible', label: 'Flexible – no fixed deadline' },
          { value: 'early-planning', label: 'Early planning stage only' }
        ]
      }
    ]
  },

  // ============================================================
  // POOL & SPA - CONSTRUCTION (5 packs)
  // ============================================================

  // Concrete and tiled pools
  {
    microSlug: 'concrete-tiled-pools',
    subcategorySlug: 'construction',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_shape',
        question: 'What shape will the pool be?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'square', label: 'Square' },
          { value: 'kidney-freeform', label: 'Kidney / freeform' },
          { value: 'custom-shape', label: 'Custom design' }
        ]
      },
      {
        id: 'dimensions',
        question: 'What is the approximate size of the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-4-6m', label: 'Small (4–6 metres)' },
          { value: 'medium-6-10m', label: 'Medium (6–10 metres)' },
          { value: 'large-10-15m', label: 'Large (10–15 metres)' },
          { value: 'very-large-15m-plus', label: 'Very large (15m+)' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'finish_type',
        question: 'What type of finish do you prefer?',
        type: 'radio',
        required: true,
        options: [
          { value: 'tiles', label: 'Tiles' },
          { value: 'mosaic', label: 'Mosaic tile finish' },
          { value: 'microcement', label: 'Microcement / polished render' },
          { value: 'other', label: 'Other / open to suggestion' }
        ]
      },
      {
        id: 'pool_features',
        question: 'Would you like any special features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'infinity-edge', label: 'Infinity edge' },
          { value: 'beach-entry', label: 'Beach entry' },
          { value: 'steps-or-benches', label: 'Integrated steps or benches' },
          { value: 'lighting', label: 'Underwater lighting' },
          { value: 'waterfall', label: 'Waterfall or feature wall' },
          { value: 'spa-integration', label: 'Built-in spa or hot tub' }
        ]
      },
      {
        id: 'site_conditions',
        question: 'What best describes your site conditions?',
        type: 'radio',
        required: true,
        options: [
          { value: 'flat-easy-access', label: 'Flat site with easy access' },
          { value: 'sloped-or-uneven', label: 'Sloped or uneven terrain' },
          { value: 'tight-access', label: 'Tight access for machinery' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'design_stage',
        question: 'What stage are you at in the design process?',
        type: 'radio',
        required: true,
        options: [
          { value: 'ideas-stage', label: 'Just exploring ideas' },
          { value: 'concept-ready', label: 'Have a rough idea / sketches' },
          { value: 'full-plans-ready', label: 'Architect plans / technical drawings ready' }
        ]
      },
      {
        id: 'timeline',
        question: 'When would you like to begin construction?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: '3-6-months', label: 'In 3–6 months' },
          { value: 'planning-stage', label: 'Just planning for now' }
        ]
      }
    ]
  },

  // New pool installation
  {
    microSlug: 'new-pool-installation',
    subcategorySlug: 'construction',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool are you looking to install?',
        type: 'radio',
        required: true,
        options: [
          { value: 'concrete-tiled', label: 'Concrete & tiled pool' },
          { value: 'prefab-fibreglass', label: 'Prefab / fibreglass pool' },
          { value: 'liner-pool', label: 'Liner pool' },
          { value: 'plunge', label: 'Plunge / compact pool' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'pool_size',
        question: 'What approximate size of pool would you like?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (4–6m)' },
          { value: 'medium', label: 'Medium (6–10m)' },
          { value: 'large', label: 'Large (10–15m)' },
          { value: 'very-large', label: 'Very large (15m+)' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'location',
        question: 'Where will the pool be installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'private-garden', label: 'Private garden' },
          { value: 'villa-or-urbanisation', label: 'Villa / urbanisation' },
          { value: 'roof-terrace', label: 'Roof terrace (structural check needed)' },
          { value: 'indoor', label: 'Indoors' }
        ]
      },
      {
        id: 'features',
        question: 'Would you like any special features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'steps-bench', label: 'Built-in steps or bench' },
          { value: 'lighting', label: 'Underwater lighting' },
          { value: 'heating', label: 'Heating system' },
          { value: 'automation', label: 'Automatic dosing / automation' },
          { value: 'waterfall', label: 'Waterfall or feature wall' }
        ]
      },
      {
        id: 'design_status',
        question: 'Do you already have design plans?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no-plans', label: 'No plans – need full design' },
          { value: 'concept', label: 'Concept sketches' },
          { value: 'architect-drawings', label: 'Architect / engineer drawings ready' }
        ]
      },
      {
        id: 'timeline',
        question: 'When would you like to begin the installation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: '3-6-months', label: '3–6 months' },
          { value: 'planning-stage', label: 'Just planning / budgeting' }
        ]
      }
    ]
  },

  // Plunge and small pools
  {
    microSlug: 'plunge-small-pools',
    subcategorySlug: 'construction',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_style',
        question: 'What style of plunge pool are you interested in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'prefab-fibreglass', label: 'Prefab / fibreglass unit' },
          { value: 'concrete-custom', label: 'Concrete custom-built' },
          { value: 'above-ground', label: 'Above-ground plunge pool' },
          { value: 'cold-plunge', label: 'Cold plunge / ice bath style' }
        ]
      },
      {
        id: 'size',
        question: 'What size plunge pool are you looking for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-2-3m', label: 'Small (2–3m)' },
          { value: 'medium-3-4m', label: 'Medium (3–4m)' },
          { value: 'large-4m-plus', label: 'Large (4m+)' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'installation_location',
        question: 'Where will the plunge pool be installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'garden', label: 'Garden' },
          { value: 'patio-terrace', label: 'Patio / terrace' },
          { value: 'roof', label: 'Roof terrace (structural inspection required)' },
          { value: 'indoor', label: 'Indoors' }
        ]
      },
      {
        id: 'features',
        question: 'Would you like any special features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'heating', label: 'Heating system' },
          { value: 'cooling-chiller', label: 'Cooling chiller' },
          { value: 'lighting', label: 'LED lighting' },
          { value: 'jets', label: 'Jets / hydromassage' }
        ]
      },
      {
        id: 'design_stage',
        question: 'What stage of planning are you at?',
        type: 'radio',
        required: true,
        options: [
          { value: 'exploring', label: 'Exploring options' },
          { value: 'have-ideas', label: 'Have some ideas' },
          { value: 'ready-to-build', label: 'Ready to build / install' }
        ]
      },
      {
        id: 'timeline',
        question: 'When would you like installation to start?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: '3-6-months', label: 'In 3–6 months' },
          { value: 'planning', label: 'Just planning for now' }
        ]
      }
    ]
  },

  // Pool renovation and refurbishment
  {
    microSlug: 'pool-renovation-refurbishment',
    subcategorySlug: 'construction',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool needs renovation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'concrete-tiled', label: 'Concrete & tiled pool' },
          { value: 'fibreglass', label: 'Fibreglass pool' },
          { value: 'liner-pool', label: 'Liner pool' },
          { value: 'plunge', label: 'Plunge pool' }
        ]
      },
      {
        id: 'renovation_needs',
        question: 'What areas need renovation or repair?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'leaks', label: 'Leak detection & repair' },
          { value: 'tile-replacement', label: 'Tile replacement or re-grouting' },
          { value: 'surface-refinish', label: 'Resurfacing or microcement' },
          { value: 'cracks', label: 'Structural cracks' },
          { value: 'equipment-upgrade', label: 'Pump / filter / electrical upgrades' },
          { value: 'lighting-repair', label: 'Lighting upgrade or repair' }
        ]
      },
      {
        id: 'condition_level',
        question: 'How would you describe the current condition of the pool?',
        type: 'radio',
        required: false,
        options: [
          { value: 'fair', label: 'Fair – minor wear' },
          { value: 'poor', label: 'Poor – visible damage' },
          { value: 'very-poor', label: 'Very poor – major work needed' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'features',
        question: 'Would you like to add any upgrades?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'new-steps', label: 'New steps or bench' },
          { value: 'infinity-edge', label: 'Add an infinity edge' },
          { value: 'automation', label: 'Automation / salt chlorination' },
          { value: 'heating', label: 'Add or upgrade heating system' },
          { value: 'lighting', label: 'LED lighting' }
        ]
      },
      {
        id: 'design_stage',
        question: 'Do you have renovation plans or drawings?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no', label: 'No plans yet' },
          { value: 'basic-idea', label: 'Have a rough idea' },
          { value: 'full-drawings', label: 'Full drawings / specifications ready' }
        ]
      },
      {
        id: 'timeline',
        question: 'When would you like the renovation to start?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-2-months', label: 'Within 1–2 months' },
          { value: 'before-season', label: 'Before the next pool season' },
          { value: 'planning', label: 'Just planning / budgeting' }
        ]
      }
    ]
  },

  // Prefab and fibreglass pools
  {
    microSlug: 'prefab-fibreglass-pools',
    subcategorySlug: 'construction',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_size',
        question: 'What size pool are you considering?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small-4-6m', label: 'Small 4–6m' },
          { value: 'medium-6-9m', label: 'Medium 6–9m' },
          { value: 'large-9-12m', label: 'Large 9–12m' },
          { value: 'very-large-12m-plus', label: 'Very large 12m+' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'shape',
        question: 'Which shape do you prefer?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'round-oval', label: 'Round / oval' },
          { value: 'freeform', label: 'Freeform / organic shape' }
        ]
      },
      {
        id: 'site_conditions',
        question: 'What best describes your site conditions?',
        type: 'radio',
        required: true,
        options: [
          { value: 'flat-easy-access', label: 'Flat site with easy crane access' },
          { value: 'tight-access', label: 'Tight access – crane may be required' },
          { value: 'sloped', label: 'Sloped terrain' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'features',
        question: 'Would you like additional options?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'lighting', label: 'LED lighting' },
          { value: 'salt-system', label: 'Salt chlorination' },
          { value: 'heat-pump', label: 'Heat pump installation' },
          { value: 'automation', label: 'Automation / dosing system' }
        ]
      },
      {
        id: 'design_stage',
        question: 'Do you have pool plans?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no-plans', label: 'No plans yet' },
          { value: 'basic-idea', label: 'Have ideas, need guidance' },
          { value: 'ready', label: 'Full plans ready' }
        ]
      },
      {
        id: 'timeline',
        question: 'When would you like installation to begin?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: '3-6-months', label: 'In 3–6 months' },
          { value: 'planning', label: 'Just planning/budgeting' }
        ]
      }
    ]
  },

  // ==================== POOL & SPA - EQUIPMENT ====================

  // Filter Replacement
  {
    microSlug: 'filter-replacement',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool or spa is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'filter_type',
        question: 'What type of filter do you currently have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'sand-filter', label: 'Sand filter' },
          { value: 'glass-media-filter', label: 'Glass media filter' },
          { value: 'cartridge-filter', label: 'Cartridge filter' },
          { value: 'diatomaceous-earth', label: 'DE (diatomaceous earth) filter' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'job_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'replace-like-for-like', label: 'Replace existing filter like-for-like' },
          { value: 'upgrade-filter-type', label: 'Upgrade to a better / newer filter type' },
          { value: 'relocate-filter', label: 'Relocate filter within plant area' },
          { value: 'pipework-changes', label: 'Adjust or replace pipework around the filter' }
        ]
      },
      {
        id: 'reason_for_replacement',
        question: 'Why are you replacing the filter?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'poor-filtration', label: 'Water not staying clear / poor filtration' },
          { value: 'cracked-or-damaged', label: 'Filter body cracked or leaking' },
          { value: 'old-and-worn-out', label: 'Old unit near end of life' },
          { value: 'system-upgrade', label: 'General system upgrade' }
        ]
      },
      {
        id: 'plant_access',
        question: 'How easy is access to the filter / plant room?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access, good working space' },
          { value: 'narrow-or-low', label: 'Narrow / low ceiling or restricted space' },
          { value: 'very-restricted', label: 'Very restricted – tight space' }
        ]
      },
      {
        id: 'system_age',
        question: 'Roughly how old is the existing filtration system?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-5-years', label: 'Under 5 years' },
          { value: '5-10-years', label: '5–10 years' },
          { value: 'over-10-years', label: 'Over 10 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'urgency',
        question: 'How soon do you need the filter replacement?',
        type: 'radio',
        required: true,
        options: [
          { value: 'system-down-urgent', label: 'System down – urgent' },
          { value: 'within-1-week', label: 'Within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'planning-only', label: 'Just planning / comparing quotes' }
        ]
      }
    ]
  },

  // Pump Repair
  {
    microSlug: 'pump-repair',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What is the pump connected to?',
        type: 'radio',
        required: true,
        options: [
          { value: 'swimming-pool', label: 'Swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'pool-and-spa', label: 'Combined pool and spa system' },
          { value: 'water-feature', label: 'Water feature / fountain' }
        ]
      },
      {
        id: 'main_issue',
        question: 'What issues are you experiencing with the pump?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'not-starting', label: 'Pump will not start' },
          { value: 'tripping-electrics', label: 'Trips electrics / breaker' },
          { value: 'low-flow', label: 'Very low flow / poor circulation' },
          { value: 'noisy', label: 'Unusual noise from pump' },
          { value: 'leaking', label: 'Leaks around pump or seals' },
          { value: 'overheating', label: 'Pump overheating / very hot' }
        ]
      },
      {
        id: 'pump_age',
        question: 'Roughly how old is the pump?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-3-years', label: 'Under 3 years' },
          { value: '3-7-years', label: '3–7 years' },
          { value: 'over-7-years', label: 'Over 7 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'pump_type',
        question: 'Do you know what type of pump you have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'single-speed', label: 'Standard single-speed pump' },
          { value: 'variable-speed', label: 'Variable-speed / inverter pump' },
          { value: 'booster-or-feature-pump', label: 'Booster / feature pump' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'recent_changes',
        question: 'Has anything changed recently in the system?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'new-filter', label: 'New filter fitted' },
          { value: 'pipework-changed', label: 'Pipework or valves modified' },
          { value: 'electrics-work', label: 'Recent electrical work' },
          { value: 'no-changes', label: 'No changes – issue developed over time' }
        ]
      },
      {
        id: 'access',
        question: 'How easy is access to the pump for repair or replacement?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access, good working space' },
          { value: 'tight-access', label: 'Tight / awkward access' },
          { value: 'below-ground-pit', label: 'Below-ground pit or chamber' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the pump repair?',
        type: 'radio',
        required: true,
        options: [
          { value: 'system-down-urgent', label: 'System not running – very urgent' },
          { value: 'soon-1-week', label: 'Soon – within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'investigation-only', label: 'Investigation / quote only' }
        ]
      }
    ]
  },

  // ==================== POOL & SPA - MAINTENANCE ====================

  // Chemical Balance
  {
    microSlug: 'chemical-balance',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool or spa is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'water_issue',
        question: 'What issues are you noticing with the water?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'cloudy', label: 'Cloudy water' },
          { value: 'green-algae', label: 'Green or algae growth' },
          { value: 'strong-chlorine-smell', label: 'Strong chlorine smell / eye irritation' },
          { value: 'staining-or-scale', label: 'Staining or scale build-up' },
          { value: 'low-or-no-chlorine', label: 'Low or zero chlorine' },
          { value: 'other', label: 'Other or unsure' }
        ]
      },
      {
        id: 'treatment_type',
        question: 'How is the water currently treated?',
        type: 'radio',
        required: true,
        options: [
          { value: 'manual-chlorine', label: 'Manual chlorine dosing' },
          { value: 'salt-chlorinator', label: 'Salt chlorinator system' },
          { value: 'bromine', label: 'Bromine' },
          { value: 'mineral-or-ozone', label: 'Mineral / ozone / alternative system' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'testing',
        question: 'Do you regularly test the water?',
        type: 'radio',
        required: false,
        options: [
          { value: 'test-strips', label: 'Yes – with test strips' },
          { value: 'test-kit', label: 'Yes – with a liquid test kit' },
          { value: 'shop-testing', label: 'Occasionally – shop or professional testing' },
          { value: 'no-testing', label: 'No – rarely or never' }
        ]
      },
      {
        id: 'service_scope',
        question: 'What kind of help do you need?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'one-off-balance', label: 'One-off visit to balance the water' },
          { value: 'shock-and-recover', label: 'Shock treatment and recovery from algae or heavy use' },
          { value: 'set-up-chemical-plan', label: 'Set up a dosing schedule and product plan' },
          { value: 'ongoing-checks', label: 'Regular testing and balancing service' }
        ]
      },
      {
        id: 'pool_coverage',
        question: 'Is the pool normally covered when not in use?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no-cover', label: 'No cover' },
          { value: 'thermal-blanket', label: 'Thermal blanket / bubble cover' },
          { value: 'automatic-cover', label: 'Automatic or slatted cover' },
          { value: 'winter-cover', label: 'Winter debris cover' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the chemical balance issue?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-cant-use-pool', label: 'Urgent – pool can\'t be used' },
          { value: 'soon-1-week', label: 'Soon – within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'planning-ongoing-service', label: 'Planning regular ongoing service' }
        ]
      }
    ]
  },

  // Pool Cleaning
  {
    microSlug: 'pool-cleaning',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool needs cleaning?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'service_frequency',
        question: 'Are you looking for a one-off clean or regular service?',
        type: 'radio',
        required: true,
        options: [
          { value: 'one-off', label: 'One-off clean' },
          { value: 'weekly', label: 'Weekly cleaning' },
          { value: 'fortnightly', label: 'Every 2 weeks' },
          { value: 'monthly', label: 'Monthly cleaning' },
          { value: 'holiday-only', label: 'Only when the property is occupied / holiday lets' }
        ]
      },
      {
        id: 'current_condition',
        question: 'What is the current condition of the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'clean-needs-maintenance', label: 'Fairly clean – just needs regular maintenance' },
          { value: 'some-debris', label: 'Some leaves and surface debris' },
          { value: 'dirty-floor-walls', label: 'Dirty floor and walls, needs vacuum and brush' },
          { value: 'very-dirty-or-green', label: 'Very dirty / green pool recovery' }
        ]
      },
      {
        id: 'tasks_required',
        question: 'Which tasks would you like included?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'skim-and-net', label: 'Skim surface and remove debris' },
          { value: 'vacuum-and-brush', label: 'Vacuum floor and brush walls' },
          { value: 'clean-baskets', label: 'Clean skimmer and pump baskets' },
          { value: 'backwash-filter', label: 'Backwash and rinse filter' },
          { value: 'check-chemicals', label: 'Test and adjust chemical levels' }
        ]
      },
      {
        id: 'equipment_on_site',
        question: 'What cleaning equipment do you already have on site?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'manual-vacuum', label: 'Manual vacuum and hose' },
          { value: 'robot-cleaner', label: 'Robotic cleaner' },
          { value: 'nets-and-brushes', label: 'Nets and brushes' },
          { value: 'none', label: 'None / very little equipment' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to the pool area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-direct-access', label: 'Easy, direct access' },
          { value: 'stairs-or-slopes', label: 'Access via stairs or slopes' },
          { value: 'gated-or-restricted', label: 'Gated / restricted access (keys needed)' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the first cleaning visit?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-3-days', label: 'Urgent – within 3 days' },
          { value: 'within-1-week', label: 'Within 1 week' },
          { value: 'within-2-weeks', label: 'Within 2 weeks' },
          { value: 'date-flexible', label: 'Flexible – no fixed date' }
        ]
      }
    ]
  },

  // Filter Cleaning and Replacement
  {
    microSlug: 'filter-cleaning-replacement',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool or spa is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'filter_type',
        question: 'What type of filter do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'sand-filter', label: 'Sand filter' },
          { value: 'glass-media', label: 'Glass media filter' },
          { value: 'cartridge-filter', label: 'Cartridge filter' },
          { value: 'de-filter', label: 'DE (diatomaceous earth) filter' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'service_scope',
        question: 'What do you need help with?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'deep-clean', label: 'Deep clean / backwash and rinse' },
          { value: 'media-change', label: 'Change sand / glass media' },
          { value: 'cartridge-replacement', label: 'Replace filter cartridges' },
          { value: 'inspection-and-service', label: 'Inspect and service filter and valves' }
        ]
      },
      {
        id: 'current_issue',
        question: 'Are you having any problems with filtration right now?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'poor-flow', label: 'Poor flow / low pressure' },
          { value: 'high-pressure', label: 'Very high pressure reading' },
          { value: 'dirty-water', label: 'Water stays dirty / cloudy' },
          { value: 'leaks', label: 'Leaks around filter or multi-port valve' },
          { value: 'no-issues', label: 'No major issues – routine maintenance' }
        ]
      },
      {
        id: 'system_age',
        question: 'Roughly how old is the filter unit?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-5-years', label: 'Under 5 years' },
          { value: '5-10-years', label: '5–10 years' },
          { value: 'over-10-years', label: 'Over 10 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to the filter / plant area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access, good working space' },
          { value: 'tight-or-low', label: 'Tight or low-height space' },
          { value: 'below-ground-pit', label: 'Below-ground pit / chamber' }
        ]
      },
      {
        id: 'urgency',
        question: 'How soon do you need this work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-system-affected', label: 'Urgent – filtration not working properly' },
          { value: 'within-1-week', label: 'Within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'routine-planned', label: 'Routine / planned maintenance' }
        ]
      }
    ]
  },

  // One-off Deep Clean
  {
    microSlug: 'one-off-deep-clean',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool or spa needs a deep clean?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'current_condition',
        question: 'What best describes the current condition?',
        type: 'radio',
        required: true,
        options: [
          { value: 'normal-dirty', label: 'Normal dirt and debris' },
          { value: 'lots-of-debris', label: 'Heavy leaves / debris build-up' },
          { value: 'green-algae', label: 'Green with algae' },
          { value: 'very-neglected', label: 'Very neglected – hasn\'t been cleaned for a long time' }
        ]
      },
      {
        id: 'deep_clean_scope',
        question: 'What would you like included in the deep clean?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'drain-and-clean', label: 'Fully drain and clean pool shell' },
          { value: 'vacuum-and-brush', label: 'Vacuum floor and brush walls' },
          { value: 'tile-line-clean', label: 'Tile line and scale cleaning' },
          { value: 'cover-clean', label: 'Clean pool cover' },
          { value: 'equipment-check', label: 'Basic check of pump and filter' }
        ]
      },
      {
        id: 'water_status',
        question: 'Is the pool currently full of water?',
        type: 'radio',
        required: true,
        options: [
          { value: 'full', label: 'Yes – full of water' },
          { value: 'partially-drained', label: 'Partially drained' },
          { value: 'empty', label: 'Empty' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to the pool area for equipment and hoses?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-direct', label: 'Easy, direct garden access' },
          { value: 'via-steps', label: 'Access via steps or narrow paths' },
          { value: 'restricted', label: 'Restricted / gated access' }
        ]
      },
      {
        id: 'chemicals_included',
        question: 'Do you want chemicals included as part of the service?',
        type: 'radio',
        required: false,
        options: [
          { value: 'include-chemicals', label: 'Yes – include chemicals' },
          { value: 'i-provide-chemicals', label: 'No – I will provide chemicals' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the deep clean carried out?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-3-days', label: 'Urgent – within 3 days' },
          { value: 'within-1-week', label: 'Within 1 week' },
          { value: 'within-2-weeks', label: 'Within 2 weeks' },
          { value: 'flexible', label: 'Flexible – no fixed date' }
        ]
      }
    ]
  },

  // Pool Cover Repair and Replacement
  {
    microSlug: 'pool-cover-repair-replacement',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'cover_type',
        question: 'What type of pool cover do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'thermal-blanket', label: 'Thermal blanket / bubble cover' },
          { value: 'automatic-slatted', label: 'Automatic / slatted cover' },
          { value: 'safety-cover', label: 'Safety cover' },
          { value: 'winter-cover', label: 'Winter debris cover' },
          { value: 'other-or-unknown', label: 'Other / not sure' }
        ]
      },
      {
        id: 'service_type',
        question: 'Do you need repair, replacement, or both?',
        type: 'radio',
        required: true,
        options: [
          { value: 'repair-only', label: 'Repair existing cover' },
          { value: 'replace-cover', label: 'Replace with a new cover' },
          { value: 'advise-best-option', label: 'Need advice on repair vs replacement' }
        ]
      },
      {
        id: 'cover_issues',
        question: 'What issues are you experiencing with the cover?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'tears-or-holes', label: 'Tears, holes or broken slats' },
          { value: 'mechanism-problem', label: 'Automatic mechanism not working properly' },
          { value: 'stiff-or-heavy', label: 'Cover is very stiff / heavy to move' },
          { value: 'unsafe-or-worn', label: 'Cover is old / unsafe' }
        ]
      },
      {
        id: 'reel_or_system',
        question: 'Do you have a reel or cover system already installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'manual-reel', label: 'Manual reel' },
          { value: 'automatic-system', label: 'Automatic motorised system' },
          { value: 'no-system', label: 'No reel or system' }
        ]
      },
      {
        id: 'pool_shape',
        question: 'What shape is the pool?',
        type: 'radio',
        required: true,
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'round-oval', label: 'Round / oval' },
          { value: 'freeform', label: 'Freeform / irregular' }
        ]
      },
      {
        id: 'safety_priority',
        question: 'Is child and pet safety a key priority?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-high-priority', label: 'Yes – high priority' },
          { value: 'moderate', label: 'Moderately important' },
          { value: 'no-mainly-heat-clean', label: 'No – mainly for heat retention / cleanliness' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the cover work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-2-weeks', label: 'Urgent – within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'before-winter', label: 'Before winter' },
          { value: 'before-summer', label: 'Before summer' }
        ]
      }
    ]
  },

  // Pump Servicing
  {
    microSlug: 'pump-servicing',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What is the pump connected to?',
        type: 'radio',
        required: true,
        options: [
          { value: 'swimming-pool', label: 'Swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'pool-and-spa', label: 'Combined pool and spa' },
          { value: 'water-feature', label: 'Water feature / fountain' }
        ]
      },
      {
        id: 'service_reason',
        question: 'Why are you requesting pump servicing?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'routine-service', label: 'Routine annual service' },
          { value: 'noisy', label: 'Pump is noisy' },
          { value: 'reduced-flow', label: 'Flow seems reduced' },
          { value: 'overheating', label: 'Pump overheating' },
          { value: 'small-leaks', label: 'Small leaks around pump or unions' }
        ]
      },
      {
        id: 'pump_age',
        question: 'Roughly how old is the pump?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-3-years', label: 'Under 3 years' },
          { value: '3-7-years', label: '3–7 years' },
          { value: 'over-7-years', label: 'Over 7 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'pump_type',
        question: 'Do you know what type of pump you have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'single-speed', label: 'Single-speed pump' },
          { value: 'variable-speed', label: 'Variable-speed / inverter pump' },
          { value: 'booster-pump', label: 'Booster / feature pump' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'service_scope',
        question: 'What would you like included in the service?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'inspection-and-clean', label: 'Inspect, clean strainer and impeller' },
          { value: 'seal-check-replacement', label: 'Check / replace seals if needed' },
          { value: 'check-electrics', label: 'Check electrics and connections' },
          { value: 'performance-test', label: 'Performance and pressure test' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to the pump area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-access', label: 'Easy access, good space' },
          { value: 'tight-access', label: 'Tight or awkward access' },
          { value: 'below-ground-pit', label: 'Below-ground pit or chamber' }
        ]
      },
      {
        id: 'urgency',
        question: 'How soon do you need the service?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-1-week', label: 'Urgent – within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'routine-next-2-months', label: 'Routine – within 2 months' }
        ]
      }
    ]
  },

  // Regular Pool Cleaning
  {
    microSlug: 'regular-pool-cleaning',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'pool_type',
        question: 'What type of pool needs regular cleaning?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' },
          { value: 'plunge-pool', label: 'Plunge / small pool' }
        ]
      },
      {
        id: 'use_pattern',
        question: 'How is the pool mainly used?',
        type: 'radio',
        required: true,
        options: [
          { value: 'private-family', label: 'Private family use' },
          { value: 'holiday-rental', label: 'Holiday rental / guests' },
          { value: 'hotel-or-community', label: 'Hotel / community pool' }
        ]
      },
      {
        id: 'service_frequency',
        question: 'How often would you like cleaning visits?',
        type: 'radio',
        required: true,
        options: [
          { value: 'once-weekly', label: 'Once per week' },
          { value: 'twice-weekly', label: 'Twice per week (peak season)' },
          { value: 'fortnightly', label: 'Every 2 weeks' },
          { value: 'custom', label: 'Custom schedule (discuss with pro)' }
        ]
      },
      {
        id: 'included_tasks',
        question: 'Which tasks should be included in regular visits?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'skim-and-net', label: 'Skim and net the surface' },
          { value: 'vacuum-and-brush', label: 'Vacuum floor and brush walls' },
          { value: 'clean-baskets', label: 'Clean skimmer and pump baskets' },
          { value: 'backwash-filter', label: 'Backwash and rinse filter' },
          { value: 'test-and-dose-chemicals', label: 'Test and adjust chemicals' }
        ]
      },
      {
        id: 'chemicals_option',
        question: 'How should chemicals be handled?',
        type: 'radio',
        required: true,
        options: [
          { value: 'pro-supplies-chemicals', label: 'Professional supplies chemicals' },
          { value: 'client-supplies-chemicals', label: 'I supply the chemicals' },
          { value: 'mixed', label: 'Mix of both (depending on product)' }
        ]
      },
      {
        id: 'access_and_keys',
        question: 'How will cleaners access the pool area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'owner-present', label: 'Owner / staff present for visits' },
          { value: 'keys-or-code', label: 'Keys or gate code provided' },
          { value: 'key-safe', label: 'Key safe on site' }
        ]
      },
      {
        id: 'start_date',
        question: 'When would you like regular cleaning to start?',
        type: 'radio',
        required: true,
        options: [
          { value: 'start-immediately', label: 'Start immediately' },
          { value: 'start-next-week', label: 'Start from next week' },
          { value: 'start-next-month', label: 'Start from next month' },
          { value: 'before-season', label: 'Start before the next season' }
        ]
      }
    ]
  },

  // Skimmer and Drain Maintenance
  {
    microSlug: 'skimmer-drain-maintenance',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'system_type',
        question: 'What type of pool is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        id: 'components',
        question: 'Which components need attention?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'skimmers', label: 'Skimmers' },
          { value: 'main-drain', label: 'Main drain' },
          { value: 'overflow-channel', label: 'Overflow channel / gutter' },
          { value: 'balance-tank', label: 'Balance tank' }
        ]
      },
      {
        id: 'issues',
        question: 'What issues are you experiencing?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'poor-suction', label: 'Poor suction from skimmer or drain' },
          { value: 'blockages', label: 'Blockages or reduced flow' },
          { value: 'air-in-system', label: 'Air in system / bubbles at returns' },
          { value: 'broken-covers-or-baskets', label: 'Broken covers or baskets' },
          { value: 'leaks', label: 'Suspected leaks in skimmer or drain' }
        ]
      },
      {
        id: 'drain_and_safety',
        question: 'Are you concerned about drain safety or compliance?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-safety-check', label: 'Yes – need safety check / upgrades' },
          { value: 'no-just-maintenance', label: 'No – just maintenance and cleaning' },
          { value: 'not-sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'system_age',
        question: 'How old is the pool and circulation system?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-10-years', label: 'Under 10 years' },
          { value: '10-20-years', label: '10–20 years' },
          { value: 'over-20-years', label: 'Over 20 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to skimmers, drains and balance tank?',
        type: 'radio',
        required: false,
        options: [
          { value: 'good-access', label: 'Good, easy access' },
          { value: 'limited-access', label: 'Limited / awkward access' },
          { value: 'under-decking-or-tiles', label: 'Under decking / tiles or hidden' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is this maintenance?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-system-not-working', label: 'Urgent – system not working properly' },
          { value: 'soon-1-2-weeks', label: 'Soon – within 1–2 weeks' },
          { value: 'routine', label: 'Routine maintenance' }
        ]
      }
    ]
  },

  // Spring Opening and Winterizing
  {
    microSlug: 'spring-opening-winterizing',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'service_type',
        question: 'Do you need spring opening, winterizing, or both?',
        type: 'radio',
        required: true,
        options: [
          { value: 'spring-opening', label: 'Spring opening / start-up' },
          { value: 'winterizing', label: 'Winterizing / closing the pool' },
          { value: 'both', label: 'Both opening and closing services' }
        ]
      },
      {
        id: 'pool_type',
        question: 'What type of pool or spa is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor swimming pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        id: 'cover_status',
        question: 'Do you already have a pool cover installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'thermal-blanket', label: 'Thermal blanket / bubble cover' },
          { value: 'winter-cover', label: 'Winter debris cover' },
          { value: 'automatic-cover', label: 'Automatic cover' },
          { value: 'no-cover', label: 'No cover currently' }
        ]
      },
      {
        id: 'tasks_required',
        question: 'Which tasks would you like included?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'remove-or-fit-cover', label: 'Remove or fit pool cover' },
          { value: 'clean-and-balance-water', label: 'Clean and balance water' },
          { value: 'system-startup-shutdown', label: 'Start up / shut down pump and filtration' },
          { value: 'blow-out-lines', label: 'Blow out / protect pipework (where applicable)' },
          { value: 'equipment-check', label: 'Check equipment and report issues' }
        ]
      },
      {
        id: 'chemical_handling',
        question: 'How should chemicals be handled for this service?',
        type: 'radio',
        required: true,
        options: [
          { value: 'pro-supply-chemicals', label: 'Professional supplies all chemicals' },
          { value: 'client-supply-chemicals', label: 'I will supply the chemicals' },
          { value: 'mix-depending-on-products', label: 'Mix of both, depending on product' }
        ]
      },
      {
        id: 'previous_issues',
        question: 'Have you had any issues in previous seasons?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'algae-after-winter', label: 'Algae or dirty water after winter' },
          { value: 'frozen-or-damaged-pipes', label: 'Frozen / damaged pipes or equipment' },
          { value: 'cover-damage', label: 'Cover damage over winter' },
          { value: 'no-major-issues', label: 'No major issues previously' }
        ]
      },
      {
        id: 'timing',
        question: 'Roughly when do you want this service done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'early-season', label: 'Early in the season' },
          { value: 'standard-season', label: 'Around normal opening/closing time' },
          { value: 'late-season', label: 'Late in the season' },
          { value: 'date-flexible', label: 'Flexible on timing' }
        ]
      }
    ]
  },

  // ==================== POOL & SPA - SPAS ====================

  // Hot Tub Installation
  {
    microSlug: 'hot-tub-installation',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'tub_type',
        question: 'What type of hot tub are you installing?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable above-ground spa' },
          { value: 'in-ground-spa', label: 'In-ground / built-in spa' },
          { value: 'swim-spa', label: 'Swim spa' },
          { value: 'inflatable', label: 'Inflatable spa' },
          { value: 'not-purchased-yet', label: 'Not purchased yet – need advice' }
        ]
      },
      {
        id: 'location',
        question: 'Where will the hot tub be located?',
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-terrace-garden', label: 'Outdoor terrace or garden' },
          { value: 'roof-terrace', label: 'Roof terrace (structural check may be needed)' },
          { value: 'indoor-room', label: 'Indoors (spa room, enclosure, etc.)' }
        ]
      },
      {
        id: 'base_prepared',
        question: 'Do you already have a suitable base prepared?',
        type: 'radio',
        required: true,
        options: [
          { value: 'existing-concrete-slab', label: 'Yes – level concrete slab' },
          { value: 'existing-tiles-or-decking', label: 'Yes – tiles or decking (unsure if strong enough)' },
          { value: 'no-base-yet', label: 'No – base still needs to be prepared' },
          { value: 'not-sure-need-advice', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'access',
        question: 'How is access for delivering and positioning the hot tub?',
        type: 'radio',
        required: true,
        options: [
          { value: 'wide-straight-access', label: 'Wide, straight access from street' },
          { value: 'narrow-or-steps', label: 'Narrow paths / steps / tight corners' },
          { value: 'crane-likely', label: 'Crane likely required to lift into place' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'electrical_status',
        question: 'Is the electrical supply for the hot tub already in place?',
        type: 'radio',
        required: true,
        options: [
          { value: 'dedicated-supply-ready', label: 'Yes – dedicated hot tub supply ready' },
          { value: 'basic-outdoor-socket-only', label: 'Only a standard outdoor socket nearby' },
          { value: 'no-supply-yet', label: 'No – electrical work still needed' },
          { value: 'not-sure', label: 'Not sure – need an electrician to check' }
        ]
      },
      {
        id: 'cover_and_accessories',
        question: 'Do you also need help with any of the following?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'steps-or-handrails', label: 'Steps or handrails' },
          { value: 'cover-lifter', label: 'Cover lifter' },
          { value: 'pergola-or-structure', label: 'Pergola / shelter / privacy screens' },
          { value: 'chemical-starter-pack', label: 'Chemical starter setup and instructions' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the hot tub installation done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within-2-weeks', label: 'Within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'planning-only', label: 'Just planning / budgeting for now' }
        ]
      }
    ]
  },

  // Hot Tub Repair
  {
    microSlug: 'hot-tub-repair',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'tub_type',
        question: 'What type of hot tub do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable above-ground spa' },
          { value: 'in-ground-spa', label: 'In-ground / built-in spa' },
          { value: 'swim-spa', label: 'Swim spa' },
          { value: 'inflatable', label: 'Inflatable spa' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'main_issues',
        question: 'What issues are you experiencing?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'not-heating', label: 'Water not heating properly' },
          { value: 'jets-not-working', label: 'Jets not working or weak' },
          { value: 'pump-noise', label: 'Loud or unusual pump noise' },
          { value: 'control-panel-errors', label: 'Error codes / control panel issues' },
          { value: 'leaks', label: 'Leaks around the spa' },
          { value: 'tripping-electrics', label: 'Spa trips electrics / breaker' }
        ]
      },
      {
        id: 'age',
        question: 'Roughly how old is the hot tub?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-3-years', label: 'Under 3 years' },
          { value: '3-7-years', label: '3–7 years' },
          { value: 'over-7-years', label: 'Over 7 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'brand_known',
        question: 'Do you know the brand or model?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-can-provide', label: 'Yes – I can provide brand/model' },
          { value: 'no-badge-or-label', label: 'No badge or label visible' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'recent_work',
        question: 'Has any recent work or changes been made to the spa or electrics?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'new-electrics', label: 'New electrical work' },
          { value: 'moved-or-relocated', label: 'Spa recently moved / relocated' },
          { value: 'no-recent-changes', label: 'No recent changes – issue developed over time' }
        ]
      },
      {
        id: 'access',
        question: 'How is access to the spa cabinet and equipment?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-all-sides', label: 'Easy access to all sides' },
          { value: 'one-side-only', label: 'Mainly one side accessible' },
          { value: 'built-in-limited-access', label: 'Built-in with limited access panels' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the repair?',
        type: 'radio',
        required: true,
        options: [
          { value: 'cannot-use-at-all', label: 'Cannot use at all – very urgent' },
          { value: 'still-usable-but-issues', label: 'Still usable but with issues' },
          { value: 'not-urgent', label: 'Not urgent – just want it checked' }
        ]
      }
    ]
  },

  // Jacuzzi Installation and Repair
  {
    microSlug: 'jacuzzi-installation-repair',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'service_type',
        question: 'Do you need installation, repair, or both?',
        type: 'radio',
        required: true,
        options: [
          { value: 'installation', label: 'New Jacuzzi installation' },
          { value: 'repair', label: 'Repair of existing Jacuzzi' },
          { value: 'both', label: 'Advice on replacing vs repairing' }
        ]
      },
      {
        id: 'jacuzzi_type',
        question: 'What type of Jacuzzi system is it?',
        type: 'radio',
        required: true,
        options: [
          { value: 'built-in-bath-jets', label: 'Built-in bath with jets (indoor bathroom)' },
          { value: 'outdoor-spa', label: 'Outdoor Jacuzzi spa' },
          { value: 'hotel-or-commercial', label: 'Hotel / commercial Jacuzzi' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'issues_if_repair',
        question: 'If repair, what issues are you having?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'jets-not-working', label: 'Jets not working or weak' },
          { value: 'pump-noise', label: 'Loud pump or vibration' },
          { value: 'leaks', label: 'Leaks around bath or pipework' },
          { value: 'controls-or-timers', label: 'Controls / timer not working' },
          { value: 'electrical-issues', label: 'Electrical trip / no power' }
        ]
      },
      {
        id: 'installation_location',
        question: 'If installation, where will the Jacuzzi be located?',
        type: 'radio',
        required: false,
        options: [
          { value: 'indoor-bathroom', label: 'Indoor bathroom' },
          { value: 'spa-room', label: 'Indoor spa / wellness room' },
          { value: 'outdoor-terrace', label: 'Outdoor terrace / garden' }
        ]
      },
      {
        id: 'access_panels',
        question: 'Is there good access to pumps and pipework?',
        type: 'radio',
        required: false,
        options: [
          { value: 'good-access-panels', label: 'Yes – access panels are available' },
          { value: 'limited-access', label: 'Limited or awkward access' },
          { value: 'no-access', label: 'No access currently (may need creating)' }
        ]
      },
      {
        id: 'age',
        question: 'Roughly how old is the existing Jacuzzi system?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-5-years', label: 'Under 5 years' },
          { value: '5-10-years', label: '5–10 years' },
          { value: 'over-10-years', label: 'Over 10 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the work to be done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent-2-weeks', label: 'Urgent – within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'flexible', label: 'Flexible – no fixed deadline' }
        ]
      }
    ]
  },

  // Spa Cover Replacement
  {
    microSlug: 'spa-cover-replacement',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'spa_type',
        question: 'What type of spa or hot tub is the cover for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable above-ground spa' },
          { value: 'in-ground-spa', label: 'In-ground spa' },
          { value: 'swim-spa', label: 'Swim spa' },
          { value: 'inflatable', label: 'Inflatable spa' }
        ]
      },
      {
        id: 'service_type',
        question: 'Do you need a direct replacement or an upgrade?',
        type: 'radio',
        required: true,
        options: [
          { value: 'like-for-like', label: 'Like-for-like replacement' },
          { value: 'upgrade-insulation', label: 'Upgrade to better insulation / quality' },
          { value: 'need-advice', label: 'Need advice on best option' }
        ]
      },
      {
        id: 'main_issues',
        question: 'What issues do you have with the current cover?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'heavy-waterlogged', label: 'Very heavy / waterlogged' },
          { value: 'torn-or-cracked', label: 'Torn or cracked vinyl' },
          { value: 'broken-straps', label: 'Broken straps / clips' },
          { value: 'poor-insulation', label: 'Poor heat retention' }
        ]
      },
      {
        id: 'shape',
        question: 'What shape is the spa?',
        type: 'radio',
        required: true,
        options: [
          { value: 'square', label: 'Square' },
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'round', label: 'Round' },
          { value: 'other', label: 'Other / custom shape' }
        ]
      },
      {
        id: 'safety_priority',
        question: 'Is safety and security a key priority for the new cover?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes-high-priority', label: 'Yes – child / pet safety is very important' },
          { value: 'medium', label: 'Medium priority' },
          { value: 'mainly-insulation', label: 'Mainly for insulation and keeping debris out' }
        ]
      },
      {
        id: 'extras',
        question: 'Do you also need help with any of the following?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'cover-lifter', label: 'Cover lifter installation' },
          { value: 'steps-or-handrail', label: 'Steps or handrail' },
          { value: 'old-cover-disposal', label: 'Removal and disposal of old cover' }
        ]
      },
      {
        id: 'timing',
        question: 'When would you like the new cover supplied and fitted?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within-2-weeks', label: 'Within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'flexible', label: 'Flexible – no fixed date' }
        ]
      }
    ]
  },

  // Spa Jets and Plumbing
  {
    microSlug: 'spa-jets-plumbing',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'spa_type',
        question: 'What type of spa do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable spa' },
          { value: 'in-ground-spa', label: 'In-ground / built-in spa' },
          { value: 'swim-spa', label: 'Swim spa' },
          { value: 'bath-jets', label: 'Jacuzzi bath with jets' }
        ]
      },
      {
        id: 'jet_issues',
        question: 'What problems are you having with jets or plumbing?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'jets-not-working', label: 'Some or all jets not working' },
          { value: 'weak-pressure', label: 'Weak pressure from jets' },
          { value: 'air-or-gurgling', label: 'Gurgling / air in system' },
          { value: 'visible-leaks', label: 'Visible leaks under or around spa' },
          { value: 'water-loss', label: 'Losing water – suspected plumbing leak' }
        ]
      },
      {
        id: 'spa_access',
        question: 'How is access to pipework and equipment?',
        type: 'radio',
        required: false,
        options: [
          { value: 'good-all-sides', label: 'Good access to all sides' },
          { value: 'one-side-only', label: 'Mainly one side accessible' },
          { value: 'built-in-limited', label: 'Built-in with limited access hatches' }
        ]
      },
      {
        id: 'age',
        question: 'Roughly how old is the spa and plumbing?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-5-years', label: 'Under 5 years' },
          { value: '5-10-years', label: '5–10 years' },
          { value: 'over-10-years', label: 'Over 10 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'work_scope',
        question: 'What kind of help do you think you need?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'diagnostic-only', label: 'Diagnostic visit and advice' },
          { value: 'jet-replacement', label: 'Jet body / fitting replacement' },
          { value: 'pipe-repairs', label: 'Pipe or union repairs' },
          { value: 're-plumbing-section', label: 'Re-plumbing part of the system' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is this work?',
        type: 'radio',
        required: true,
        options: [
          { value: 'spa-out-of-use', label: 'Spa out of use – very urgent' },
          { value: 'still-usable', label: 'Still usable but not ideal' },
          { value: 'non-urgent', label: 'Non-urgent / planning repairs' }
        ]
      }
    ]
  },

  // Spa Servicing and Maintenance
  {
    microSlug: 'spa-servicing-maintenance',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'spa_type',
        question: 'What type of spa or hot tub do you have?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable spa' },
          { value: 'in-ground-spa', label: 'In-ground spa' },
          { value: 'swim-spa', label: 'Swim spa' }
        ]
      },
      {
        id: 'service_frequency',
        question: 'What kind of servicing are you looking for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'one-off-service', label: 'One-off service' },
          { value: 'regular-monthly', label: 'Regular monthly service' },
          { value: 'seasonal', label: 'Seasonal opening/closing service' }
        ]
      },
      {
        id: 'tasks_required',
        question: 'Which tasks would you like included?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'drain-and-refill', label: 'Drain, clean and refill spa' },
          { value: 'clean-shell-and-cover', label: 'Clean spa shell and cover' },
          { value: 'filter-clean-or-replace', label: 'Clean or replace filters' },
          { value: 'check-jets-and-pumps', label: 'Check jets, pumps and controls' },
          { value: 'test-and-balance-water', label: 'Test and balance water chemistry' }
        ]
      },
      {
        id: 'usage_pattern',
        question: 'How is the spa typically used?',
        type: 'radio',
        required: false,
        options: [
          { value: 'private-home', label: 'Private home use' },
          { value: 'holiday-rental', label: 'Holiday rental / guests' },
          { value: 'hotel-or-spa', label: 'Hotel / spa business' }
        ]
      },
      {
        id: 'chemicals_option',
        question: 'How would you like to handle chemicals?',
        type: 'radio',
        required: true,
        options: [
          { value: 'pro-supplies', label: 'Professional supplies chemicals' },
          { value: 'client-supplies', label: 'I supply the chemicals' },
          { value: 'mixed', label: 'Mix of both' }
        ]
      },
      {
        id: 'access',
        question: 'How will the technician access the spa?',
        type: 'radio',
        required: false,
        options: [
          { value: 'owner-present', label: 'Owner / staff present' },
          { value: 'keys-or-code', label: 'Keys / gate code / key safe' }
        ]
      },
      {
        id: 'start_date',
        question: 'When would you like the first service visit?',
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: 'within-2-weeks', label: 'Within 2 weeks' },
          { value: 'within-1-month', label: 'Within 1 month' }
        ]
      }
    ]
  },

  // Spa Water Treatment
  {
    microSlug: 'spa-water-treatment',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'spa_type',
        question: 'What type of spa or hot tub is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'portable-spa', label: 'Portable spa' },
          { value: 'in-ground-spa', label: 'In-ground spa' },
          { value: 'swim-spa', label: 'Swim spa' }
        ]
      },
      {
        id: 'water_issues',
        question: 'What issues are you noticing with the spa water?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'cloudy', label: 'Cloudy water' },
          { value: 'foaming', label: 'Foaming' },
          { value: 'strong-smell', label: 'Strong chemical smell or irritation' },
          { value: 'algae-or-biofilm', label: 'Algae or biofilm in pipes' },
          { value: 'staining-or-scale', label: 'Staining or scale' }
        ]
      },
      {
        id: 'treatment_method',
        question: 'How is the spa currently treated?',
        type: 'radio',
        required: true,
        options: [
          { value: 'chlorine', label: 'Chlorine' },
          { value: 'bromine', label: 'Bromine' },
          { value: 'salt-system', label: 'Salt / salt chlorinator' },
          { value: 'alternative-system', label: 'Ozone / UV / other system' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'service_scope',
        question: 'What help do you need with water treatment?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'one-off-recovery', label: 'One-off water recovery and balance' },
          { value: 'pipework-flush', label: 'Pipework flush and disinfection' },
          { value: 'setup-chemical-plan', label: 'Set up a clear chemical routine' },
          { value: 'regular-testing', label: 'Regular testing and balancing visits' }
        ]
      },
      {
        id: 'testing',
        question: 'How do you currently test the water?',
        type: 'radio',
        required: false,
        options: [
          { value: 'test-strips', label: 'Test strips' },
          { value: 'test-kit', label: 'Liquid test kit' },
          { value: 'shop-testing', label: 'Occasional shop / professional tests' },
          { value: 'no-regular-testing', label: 'No regular testing' }
        ]
      },
      {
        id: 'cover_usage',
        question: 'Is the spa normally covered when not in use?',
        type: 'radio',
        required: false,
        options: [
          { value: 'always-covered', label: 'Yes – almost always covered' },
          { value: 'sometimes-covered', label: 'Sometimes covered' },
          { value: 'rarely-covered', label: 'Rarely or never covered' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the water treatment issue?',
        type: 'radio',
        required: true,
        options: [
          { value: 'cant-use-spa', label: 'Spa can\'t be used – urgent' },
          { value: 'soon-1-week', label: 'Soon – within 1 week' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'planning-ongoing-service', label: 'Planning ongoing maintenance' }
        ]
      }
    ]
  },

  // Hot Tub Electrical Work
  {
    microSlug: 'hot-tub-electrical-work',
    categorySlug: 'pool-spa',
    version: 1,
    questions: [
      {
        id: 'service_type',
        question: 'What type of electrical work do you need for the hot tub?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new-supply', label: 'New dedicated electrical supply' },
          { value: 'upgrade-supply', label: 'Upgrade existing supply / breaker' },
          { value: 'connect-and-commission', label: 'Connect and commission new spa' },
          { value: 'fault-finding', label: 'Fault finding / repair (tripping, no power etc.)' }
        ]
      },
      {
        id: 'tub_type',
        question: 'What type of hot tub is this for?',
        type: 'radio',
        required: true,
        options: [
          { value: '13a-plug-and-play', label: 'Plug-and-play (standard plug)' },
          { value: 'hard-wired-spa', label: 'Hard-wired spa (dedicated circuit)' },
          { value: 'swim-spa', label: 'Swim spa' },
          { value: 'in-ground-spa', label: 'In-ground spa' }
        ]
      },
      {
        id: 'electrical_panel_distance',
        question: 'Roughly how far is the hot tub from the main electrical panel?',
        type: 'radio',
        required: false,
        options: [
          { value: 'under-10m', label: 'Under 10 metres' },
          { value: '10-25m', label: '10–25 metres' },
          { value: 'over-25m', label: 'Over 25 metres' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        id: 'existing-electrics',
        question: 'What is currently in place near the hot tub location?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no-electrics-nearby', label: 'No electrics nearby' },
          { value: 'standard-outdoor-socket', label: 'Standard outdoor socket' },
          { value: 'dedicated-cable-present', label: 'Dedicated cable already run to area' },
          { value: 'old-spa-supply', label: 'Old spa / pool supply that may be reused' }
        ]
      },
      {
        id: 'property_type',
        question: 'What type of property is this?',
        type: 'radio',
        required: false,
        options: [
          { value: 'private-villa', label: 'Private villa / house' },
          { value: 'apartment', label: 'Apartment' },
          { value: 'hotel-or-tourist', label: 'Hotel / tourist accommodation' }
        ]
      },
      {
        id: 'access_and_permits',
        question: 'Is there anything that might affect electrical access or permissions?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'shared-building', label: 'Shared building / community rules' },
          { value: 'limited-panel-access', label: 'Limited access to main electrical panel' },
          { value: 'none', label: 'Nothing special – normal access' }
        ]
      },
      {
        id: 'urgency',
        question: 'How urgent is the electrical work?',
        type: 'radio',
        required: true,
        options: [
          { value: 'need-before-delivery', label: 'Need supply ready before spa delivery' },
          { value: 'spa-already-on-site', label: 'Spa already on site – need connection soon' },
          { value: 'fault-no-power', label: 'Fault – spa has no power / tripping' },
          { value: 'planning', label: 'Planning stage only' }
        ]
      }
    ]
  },

  // ==========================================
  // POOL-SPA: Water Treatment Subcategory
  // ==========================================
  {
    microSlug: 'algae-removal-prevention',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor swimming pool' },
          { value: 'indoor-pool', label: 'Indoor pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'green', label: 'Green algae' },
          { value: 'yellow-mustard', label: 'Yellow / mustard algae' },
          { value: 'black', label: 'Black algae' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'light', label: 'Light algae on walls or floor' },
          { value: 'moderate', label: 'Moderate algae – water slightly green' },
          { value: 'severe', label: 'Severe – water fully green or opaque' },
          { value: 'extreme', label: 'Extreme – heavy buildup, not usable' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'running-normally', label: 'Yes – running normally' },
          { value: 'limited-hours', label: 'Running limited hours' },
          { value: 'not-running', label: 'Not running / broken' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'lack-of-chemicals', label: 'Low chlorine / sanitiser levels' },
          { value: 'poor-filtration', label: 'Poor circulation or filtration' },
          { value: 'hot-weather', label: 'Hot weather and heavy use' },
          { value: 'cover-left-on', label: 'Cover left on for long periods' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'shock-treatment', label: 'Full shock treatment' },
          { value: 'vacuum-and-clean', label: 'Vacuum and brush surfaces' },
          { value: 'chemical-balance', label: 'Chemical testing and balancing' },
          { value: 'ongoing-prevention', label: 'Set up ongoing prevention routine' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent – pool unsafe to use' },
          { value: 'within-1-week', label: 'Within 1 week' },
          { value: 'planning', label: 'Planning ahead' }
        ]
      }
    ]
  },

  {
    microSlug: 'cloudy-discoloured-water-treatment',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'cloudy', label: 'Cloudy / milky water' },
          { value: 'brown', label: 'Brown or rusty water' },
          { value: 'greenish', label: 'Greenish water (early algae)' },
          { value: 'white-scale', label: 'White scale or calcium flakes' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor pool' },
          { value: 'indoor-pool', label: 'Indoor pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'heavy-rain', label: 'Heavy rain' },
          { value: 'dust-or-sahara', label: 'Dust storm / Saharan dust' },
          { value: 'pool-overflow', label: 'Pool overflowed' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'yes', label: 'Yes – running normally' },
          { value: 'on-off', label: 'Intermittent / stopped for a while' },
          { value: 'not-working', label: 'Not working properly' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'clarifier-floc', label: 'Clarifier / floc treatment' },
          { value: 'chemical-balance', label: 'Chemical analysis and balance' },
          { value: 'filter-clean', label: 'Filter clean / backwash' },
          { value: 'shock-treatment', label: 'Shock treatment if needed' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'pool-unusable', label: 'Pool unusable – urgent' },
          { value: 'soon', label: 'Soon – within a week' },
          { value: 'planning', label: 'Planning ahead' }
        ]
      }
    ]
  },

  {
    microSlug: 'filtration-system-installation',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'new-install', label: 'New installation' },
          { value: 'upgrade-existing', label: 'Upgrading existing system' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor pool' },
          { value: 'indoor-pool', label: 'Indoor pool' },
          { value: 'spa-or-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'sand-filter', label: 'Sand filter' },
          { value: 'glass-media', label: 'Glass media filter' },
          { value: 'cartridge-filter', label: 'Cartridge filter' },
          { value: 'de-filter', label: 'DE diatomaceous earth filter' },
          { value: 'need-advice', label: 'Not sure – need advice' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'filter-only', label: 'Filter only' },
          { value: 'pump-and-filter', label: 'Pump and filter together' },
          { value: 'need-assessment', label: 'Need professional assessment' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'ready', label: 'Yes – fully ready' },
          { value: 'space-but-needs-adjustments', label: 'Space available but may need adjustments' },
          { value: 'not-built-yet', label: 'Plant room not built yet' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: 'within-1-month', label: 'Within 1 month' },
          { value: 'planning', label: 'Planning stage' }
        ]
      }
    ]
  },

  {
    microSlug: 'filtration-system-upgrades',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'poor-clarity', label: 'Water clarity issues' },
          { value: 'pump-struggles', label: 'Pump struggling to maintain flow' },
          { value: 'high-energy-use', label: 'Reduce energy consumption' },
          { value: 'old-equipment', label: 'Old or noisy equipment' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'sand', label: 'Sand filter' },
          { value: 'cartridge', label: 'Cartridge filter' },
          { value: 'glass-media', label: 'Glass media' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'convert-to-glass-media', label: 'Convert sand to glass media' },
          { value: 'larger-filter', label: 'Install a larger filter' },
          { value: 'multiport-valve-upgrade', label: 'Replace multiport valve' },
          { value: 'complete-system-overhaul', label: 'Complete system overhaul' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, evaluate pump also' },
          { value: 'no', label: 'No, filter only' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-month', label: 'Within 1 month' },
          { value: 'planning', label: 'Just planning costs' }
        ]
      }
    ]
  },

  {
    microSlug: 'salt-chlorinator-systems',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'new-install', label: 'New installation' },
          { value: 'upgrade-existing', label: 'Upgrade existing system' },
          { value: 'repair', label: 'Repair a salt system' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor pool' },
          { value: 'indoor-pool', label: 'Indoor pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'working', label: 'Still working but ageing' },
          { value: 'weak-output', label: 'Weak chlorine output' },
          { value: 'needs-cleaning', label: 'Calcium buildup / needs cleaning' },
          { value: 'not-working', label: 'Not working at all' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'under-3', label: 'Under 3 years' },
          { value: '3-7', label: '3–7 years' },
          { value: 'over-7', label: 'Over 7 years' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'self-cleaning', label: 'Self-cleaning cell' },
          { value: 'wifi-control', label: 'WiFi / app control' },
          { value: 'reverse-polarity', label: 'Reverse polarity (anti-scale)' },
          { value: 'high-output', label: 'High output for large pools' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent – pool cannot stay untreated' },
          { value: '1-month', label: 'Within 1 month' },
          { value: 'planning', label: 'Planning stage' }
        ]
      }
    ]
  },

  {
    microSlug: 'water-chemistry-balancing',
    categorySlug: 'pool-spa',
    subcategorySlug: 'water-treatment',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'outdoor-pool', label: 'Outdoor pool' },
          { value: 'indoor-pool', label: 'Indoor pool' },
          { value: 'spa-hot-tub', label: 'Spa / hot tub' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'irritation', label: 'Skin or eye irritation' },
          { value: 'strong-smell', label: 'Strong chlorine or chemical smell' },
          { value: 'cloudy', label: 'Cloudy or dull water' },
          { value: 'scale', label: 'Calcium scale' },
          { value: 'rust-stains', label: 'Rust or metal stains' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'test-strips', label: 'Test strips' },
          { value: 'liquid-kit', label: 'Liquid test kit' },
          { value: 'digital-tester', label: 'Digital tester' },
          { value: 'no-testing', label: 'No regular testing' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'full-lab-test', label: 'Full lab-style analysis' },
          { value: 'chemical-adjustments', label: 'Adjust pH, chlorine, alk, CYA, hardness etc.' },
          { value: 'ongoing-maintenance', label: 'Regular chemistry visits' },
          { value: 'education', label: 'Teach me how to maintain the chemistry myself' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'pro-supplies', label: 'Professional supplies chemicals' },
          { value: 'client-supplies', label: 'I supply the chemicals' },
          { value: 'mixed', label: 'Mix of both' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'cant-use-water', label: 'Very urgent – pool not safe to use' },
          { value: 'soon', label: 'Soon – within a week' },
          { value: 'routine', label: 'Routine check-up' }
        ]
      }
    ]
  },

  // ==========================================
  // PAINTING-DECORATING: Exterior Subcategory
  // ==========================================
  {
    microSlug: 'anti-damp-exterior-treatment',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'house-detached', label: 'Detached house or villa' },
          { value: 'house-semi-terraced', label: 'Semi-detached / terraced house' },
          { value: 'apartment-building', label: 'Apartment building / block' },
          { value: 'commercial', label: 'Commercial building' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'main-walls', label: 'Main exterior walls' },
          { value: 'lower-walls-plinth', label: 'Lower walls / plinth areas' },
          { value: 'chimneys', label: 'Chimneys' },
          { value: 'parapets-terraces', label: 'Parapets and terrace walls' },
          { value: 'other-areas', label: 'Other localised problem areas' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'flaking-paint', label: 'Flaking or blistering paint' },
          { value: 'damp-patches', label: 'Damp patches on exterior' },
          { value: 'damp-inside', label: 'Moisture showing inside the property' },
          { value: 'cracks', label: 'Cracks where water is getting in' },
          { value: 'mould-algae', label: 'Mould or algae on the walls' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'ground-floor-only', label: 'Ground floor only' },
          { value: 'up-to-2-storeys', label: 'Up to 2 storeys' },
          { value: '3-storeys-plus', label: '3 storeys or higher' },
          { value: 'mixed', label: 'Mixed heights around the building' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'easy-ladder', label: 'Easy ladder access around the property' },
          { value: 'scaffolding-in-place', label: 'Scaffolding already in place' },
          { value: 'boom-lift-possible', label: 'Space for cherry picker / boom lift' },
          { value: 'no-access-yet', label: 'No access arranged yet' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'survey-and-diagnosis', label: 'Survey and diagnose damp issues' },
          { value: 'crack-repair', label: 'Repair cracks and problem areas' },
          { value: 'full-waterproof-coating', label: 'Apply full waterproof / anti-damp coating' },
          { value: 'localised-treatment', label: 'Localised treatment only' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      }
    ]
  },

  {
    microSlug: 'exterior-house-repainting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'detached', label: 'Detached house / villa' },
          { value: 'semi-terraced', label: 'Semi-detached / terraced house' },
          { value: 'townhouse', label: 'Townhouse / row house' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'single-storey', label: 'Single storey' },
          { value: 'two-storey', label: 'Two storeys' },
          { value: 'three-plus', label: 'Three storeys or more' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'render-walls', label: 'Render / stucco walls' },
          { value: 'block-brick', label: 'Block / brick walls' },
          { value: 'wood-cladding', label: 'Timber cladding' },
          { value: 'eaves-soffits', label: 'Eaves, soffits and fascias' },
          { value: 'other-elements', label: 'Other exterior elements' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'good-light-wear', label: 'Generally good – light wear' },
          { value: 'peeling-flaking', label: 'Peeling or flaking in areas' },
          { value: 'heavy-failures', label: 'Heavy failures – bare areas showing' },
          { value: 'first-paint', label: 'Never painted before' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'basic-prep', label: 'Basic prep – light sanding and touch-ups' },
          { value: 'standard-prep', label: 'Standard prep – fill cracks, scrape loose paint' },
          { value: 'full-prep', label: 'Full prep – more extensive repairs and sealing' },
          { value: 'need-advice', label: 'Need the professional to advise' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'standard-masonry', label: 'Standard masonry paint' },
          { value: 'elastomeric', label: 'High performance / elastomeric coating' },
          { value: 'eco-natural', label: 'Eco / natural paints' },
          { value: 'no-preference', label: 'No preference – need advice' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'same-colour', label: 'Same or very similar colour' },
          { value: 'new-colours-chosen', label: 'New colours already chosen' },
          { value: 'need-colour-advice', label: 'Need help choosing colours' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap-weather-permitting', label: 'As soon as possible (weather permitting)' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible on dates' }
        ]
      }
    ]
  },

  {
    microSlug: 'exterior-metal-railings',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'balcony-railings', label: 'Balcony railings' },
          { value: 'stair-railings', label: 'Stair railings / handrails' },
          { value: 'gates-fences', label: 'Gates and metal fences' },
          { value: 'grilles-bars', label: 'Window bars / security grilles' },
          { value: 'other-metalwork', label: 'Other exterior metalwork' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'mostly-sound', label: 'Mostly sound – light wear' },
          { value: 'some-rust', label: 'Some rust and flaking paint' },
          { value: 'heavily-rusted', label: 'Heavily rusted or bare metal in places' },
          { value: 'unpainted', label: 'New / unpainted metal' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'ground-level', label: 'Ground level, easy access' },
          { value: 'first-floor-balcony', label: 'First floor balcony / raised areas' },
          { value: 'multi-storey', label: 'Higher levels / multi-storey' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'satin', label: 'Satin finish' },
          { value: 'gloss', label: 'High gloss' },
          { value: 'matt', label: 'Matt finish' },
          { value: 'no-preference', label: 'No preference' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'black-or-dark', label: 'Black / dark tone' },
          { value: 'white-or-light', label: 'White / light tone' },
          { value: 'colour-match', label: 'Match existing colour' },
          { value: 'need-advice', label: 'Need help choosing' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'light-prep', label: 'Light sand and repaint' },
          { value: 'rust-treatment', label: 'Rust treatment and priming' },
          { value: 'full-prep', label: 'Full preparation and protection system' },
          { value: 'unsure', label: 'Unsure – need recommendation' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'soon', label: 'Soon – within a few weeks' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible' }
        ]
      }
    ]
  },

  {
    microSlug: 'exterior-wood-windows-doors',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'window-frames', label: 'Exterior window frames' },
          { value: 'shutters', label: 'Wooden shutters' },
          { value: 'front-door', label: 'Front door' },
          { value: 'patio-doors', label: 'Patio / balcony doors' },
          { value: 'garage-doors', label: 'Garage doors' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'painted', label: 'Painted' },
          { value: 'stained-varnished', label: 'Stain / varnish' },
          { value: 'oiled', label: 'Oiled finish' },
          { value: 'bare-or-weathered', label: 'Bare / heavily weathered' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'good-minor-wear', label: 'Good – minor wear' },
          { value: 'peeling-flaking', label: 'Peeling, flaking or faded' },
          { value: 'damaged-soft-areas', label: 'Some damage / soft or rotten areas' },
          { value: 'unsure-needs-check', label: 'Unsure – need a professional to assess' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'opaque-paint', label: 'Opaque paint' },
          { value: 'semi-transparent-stain', label: 'Semi-transparent stain' },
          { value: 'clear-varnish', label: 'Clear varnish' },
          { value: 'match-existing', label: 'Match existing finish' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'same-colour', label: 'Same colour as now' },
          { value: 'new-colour', label: 'New colour chosen' },
          { value: 'need-samples', label: 'Need samples and advice' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'ground-floor-only', label: 'Ground floor only' },
          { value: 'mix-ground-first', label: 'Mix of ground and first floor' },
          { value: 'higher-levels', label: 'Higher levels needing ladders / scaffolding' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible timing' }
        ]
      }
    ]
  },

  {
    microSlug: 'facade-repainting-render',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'house', label: 'House / villa' },
          { value: 'apartment-block', label: 'Apartment block' },
          { value: 'commercial-building', label: 'Commercial building' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'standard-cement', label: 'Standard cement render' },
          { value: 'monocapa', label: 'Monocapa / monocouche' },
          { value: 'insulated-render', label: 'Insulated render system' },
          { value: 'not-sure', label: 'Not sure' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'sound-minor-cracks', label: 'Mostly sound – minor hairline cracks' },
          { value: 'cracking-flaking', label: 'Cracking and flaking in places' },
          { value: 'significant-damage', label: 'Significant damage or hollow areas' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'cleaning-only', label: 'Cleaning and light prep only' },
          { value: 'fill-hairline-cracks', label: 'Fill hairline cracks' },
          { value: 'repair-damaged-areas', label: 'Repair damaged / hollow sections' },
          { value: 'anti-damp-treatment', label: 'Anti-damp treatment before painting' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'single-elevation', label: 'One side / elevation only' },
          { value: 'two-or-three-sides', label: 'Two or three sides' },
          { value: 'entire-building', label: 'Entire building' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'ground-ladder', label: 'Ground / ladder access' },
          { value: 'scaffolding-ready', label: 'Scaffolding already in place' },
          { value: 'mechanical-access-needed', label: 'Likely need lift / scaffolding arranged' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap-weather-permitting', label: 'As soon as possible (weather permitting)' },
          { value: 'off-season', label: 'Prefer off-season / quieter period' },
          { value: 'flexible', label: 'Flexible' }
        ]
      }
    ]
  },

  {
    microSlug: 'fence-painting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'timber-panels', label: 'Timber panels' },
          { value: 'timber-post-rail', label: 'Timber post and rail' },
          { value: 'metal', label: 'Metal fence' },
          { value: 'mixed', label: 'Mixed materials' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'up-to-20m', label: 'Up to 20m' },
          { value: '20-50m', label: '20–50m' },
          { value: '50-100m', label: '50–100m' },
          { value: 'over-100m', label: 'Over 100m' },
          { value: 'not-sure', label: 'Not sure – need estimate on site' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'bare-untreated', label: 'Bare timber / untreated' },
          { value: 'stain', label: 'Wood stain or oil' },
          { value: 'paint', label: 'Painted finish' },
          { value: 'mixed-or-unknown', label: 'Mixed / not sure' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'good-minor-wear', label: 'Good – minor wear only' },
          { value: 'weathered', label: 'Weathered but sound' },
          { value: 'damaged-panels', label: 'Some damaged / rotten panels' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'stain-or-oil', label: 'Stain / oil to show wood grain' },
          { value: 'solid-colour', label: 'Solid colour paint' },
          { value: 'match-existing', label: 'Match existing colour' },
          { value: 'need-advice', label: 'Need advice' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'one-side-only', label: 'Only one side accessible' },
          { value: 'both-sides', label: 'Both sides accessible' },
          { value: 'mixed', label: 'Mixed – some sections only one side' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'soon', label: 'Soon – within a few weeks' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible' }
        ]
      }
    ]
  },

  {
    microSlug: 'house-exterior',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'exterior',
    version: 1,
    questions: [
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'detached', label: 'Detached house / villa' },
          { value: 'semi-terraced', label: 'Semi-detached / terraced house' },
          { value: 'townhouse', label: 'Townhouse / row house' },
          { value: 'small-building', label: 'Small apartment / commercial building' }
        ]
      },
      {
        type: 'checkbox',
        required: true,
        options: [
          { value: 'walls', label: 'Exterior walls' },
          { value: 'woodwork', label: 'Woodwork (doors, windows, shutters)' },
          { value: 'metalwork', label: 'Metalwork (railings, gates, grilles)' },
          { value: 'fascias-eaves', label: 'Fascias, eaves and soffits' },
          { value: 'other', label: 'Other exterior elements' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'light-wear', label: 'Light wear – mainly refresh' },
          { value: 'mixed-condition', label: 'Mixed – some areas peeling / flaking' },
          { value: 'poor-condition', label: 'Poor – heavy peeling, bare areas' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'basic', label: 'Basic – light sanding and spot repairs' },
          { value: 'standard', label: 'Standard – fill cracks, treat problem areas' },
          { value: 'high', label: 'High – more detailed repair and protection' },
          { value: 'unsure', label: 'Not sure – need recommendation' }
        ]
      },
      {
        type: 'radio',
        required: false,
        options: [
          { value: 'keep-similar', label: 'Keep a similar colour scheme' },
          { value: 'change-colours', label: 'Change colours completely' },
          { value: 'need-help', label: 'Need help choosing colours' }
        ]
      },
      {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'good-access-all-sides', label: 'Good access all around' },
          { value: 'tight-on-one-side', label: 'Tight access on one side' },
          { value: 'needs-scaffolding', label: 'Likely needs scaffolding / lift' }
        ]
      },
      {
        type: 'radio',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: 'Within 1–3 months' },
          { value: 'flexible', label: 'Flexible on start date' }
        ]
      }
    ]
  },

  // ============================================================
  // PAINTING & DECORATING - INTERIOR
  // ============================================================

  {
    microSlug: 'cabinet-painting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'cabinets_location',
        question: 'Where are the cabinets you want painted?',
        type: 'radio',
        required: true,
        options: [
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'bedroom', label: 'Bedroom / wardrobes' },
          { value: 'multiple_areas', label: 'Multiple areas' }
        ]
      },
      {
        id: 'cabinets_quantity',
        question: 'Roughly how many cabinet doors and drawer fronts need painting?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small set (up to 10 fronts)' },
          { value: 'medium', label: 'Medium (10–20 fronts)' },
          { value: 'large', label: 'Large (20–35 fronts)' },
          { value: 'very_large', label: 'Very large (35+ fronts)' }
        ]
      },
      {
        id: 'current_cabinet_finish',
        question: 'What is the current finish on the cabinets?',
        type: 'radio',
        required: true,
        options: [
          { value: 'unpainted_wood', label: 'Unpainted wood' },
          { value: 'painted', label: 'Already painted' },
          { value: 'laminate_mdf', label: 'Laminate / MDF' },
          { value: 'high_gloss', label: 'High gloss' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'cabinet_condition',
        question: 'What condition are the cabinets in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'good', label: 'Good, just changing colour' },
          { value: 'minor_chips', label: 'Minor chips and wear' },
          { value: 'heavy_wear', label: 'Heavy wear or peeling paint' },
          { value: 'water_damage', label: 'Some water damage / swelling' }
        ]
      },
      {
        id: 'cabinet_finish_preference',
        question: 'What type of paint finish do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_eggshell', label: 'Standard durable eggshell / satin' },
          { value: 'high_gloss_finish', label: 'High gloss finish' },
          { value: 'eco_low_odor', label: 'Eco / low-odour paints' },
          { value: 'no_preference', label: 'No preference – follow professional advice' }
        ]
      },
      {
        id: 'hardware_changes',
        question: 'Do you also need handles or hardware changed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'keep_existing', label: 'Keep existing hardware' },
          { value: 'supply_own', label: 'I\'ll supply new handles' },
          { value: 'supply_and_fit', label: 'I\'d like the professional to supply and fit' },
          { value: 'not_sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'cabinet_timing',
        question: 'When would you like the cabinet painting done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'As soon as possible' },
          { value: 'two_weeks', label: 'Within the next 2 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on dates' }
        ]
      },
      {
        id: 'cabinet_additional_info',
        question: 'Anything else the professional should know about your cabinets?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'feature-wall-accent',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'feature_space_type',
        question: 'Where is the feature wall or accent area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'living_room', label: 'Living room' },
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'hallway', label: 'Hallway / entrance' },
          { value: 'kitchen_dining', label: 'Kitchen / dining' },
          { value: 'other_room', label: 'Other room' }
        ]
      },
      {
        id: 'feature_wall_size',
        question: 'Roughly how big is the feature wall or area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (up to 6 m²)' },
          { value: 'medium', label: 'Medium (6–12 m²)' },
          { value: 'large', label: 'Large (12–20 m²)' },
          { value: 'very_large', label: 'Very large (20 m²+)' }
        ]
      },
      {
        id: 'feature_design_type',
        question: 'What kind of feature or accent are you looking for?',
        type: 'radio',
        required: true,
        options: [
          { value: 'solid_colour', label: 'Solid colour feature wall' },
          { value: 'geometric_or_pattern', label: 'Geometric / pattern design' },
          { value: 'texture_effect', label: 'Textured / special effect finish' },
          { value: 'mural_or_art', label: 'Mural / artistic design' },
          { value: 'not_sure', label: 'Not sure – need ideas' }
        ]
      },
      {
        id: 'existing_wall_condition',
        question: 'What is the current condition of the wall?',
        type: 'radio',
        required: true,
        options: [
          { value: 'good', label: 'Good – ready to paint' },
          { value: 'minor_defects', label: 'Minor cracks / small holes' },
          { value: 'needs_repair', label: 'Visible damage – needs repair' },
          { value: 'new_plaster', label: 'Newly plastered' }
        ]
      },
      {
        id: 'colour_palette',
        question: 'Do you already have colours or a palette in mind?',
        type: 'radio',
        required: false,
        options: [
          { value: 'colours_chosen', label: 'Yes, colours are chosen' },
          { value: 'need_help_matching', label: 'Rough idea – need help matching' },
          { value: 'no_idea', label: 'No idea – want suggestions' }
        ]
      },
      {
        id: 'feature_paint_supplied',
        question: 'Will you supply the paint and materials?',
        type: 'radio',
        required: false,
        options: [
          { value: 'client_supplies', label: 'I will supply paint and materials' },
          { value: 'pro_supplies', label: 'I\'d like the professional to supply everything' },
          { value: 'mixed', label: 'A mix (I have some items already)' }
        ]
      },
      {
        id: 'feature_timing',
        question: 'When would you like the feature wall completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'this_week', label: 'This week if possible' },
          { value: 'two_weeks', label: 'Within the next 2 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      },
      {
        id: 'feature_additional_info',
        question: 'Describe any inspiration, references or ideas you already have.',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'furniture-upcycling',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'furniture_types',
        question: 'What type of furniture do you want to upcycle or paint?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'tables_desks', label: 'Tables / desks' },
          { value: 'chairs_stools', label: 'Chairs / stools' },
          { value: 'wardrobes_drawers', label: 'Wardrobes / drawers' },
          { value: 'sideboards_cabinets', label: 'Sideboards / cabinets' },
          { value: 'other_items', label: 'Other items' }
        ]
      },
      {
        id: 'furniture_quantity',
        question: 'How many pieces of furniture are there in total?',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_piece', label: '1 piece' },
          { value: 'two_three', label: '2–3 pieces' },
          { value: 'four_six', label: '4–6 pieces' },
          { value: 'seven_plus', label: '7 or more pieces' }
        ]
      },
      {
        id: 'furniture_material',
        question: 'What is the main material of the furniture?',
        type: 'radio',
        required: true,
        options: [
          { value: 'solid_wood', label: 'Solid wood' },
          { value: 'veneer', label: 'Veneer / plywood' },
          { value: 'laminate', label: 'Laminate' },
          { value: 'mixed_materials', label: 'Mixed materials' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'furniture_finish_goal',
        question: 'What style or finish are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_colour', label: 'Solid colour repaint' },
          { value: 'distressed_vintage', label: 'Distressed / vintage look' },
          { value: 'stain_varnish', label: 'Wood stain and varnish' },
          { value: 'special_effects', label: 'Special effects / artistic finish' },
          { value: 'undecided', label: 'Undecided – open to ideas' }
        ]
      },
      {
        id: 'furniture_condition',
        question: 'What condition is the furniture currently in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'good', label: 'Good condition, just changing look' },
          { value: 'minor_wear', label: 'Minor scratches / wear' },
          { value: 'damaged', label: 'Damaged – needs repairs' }
        ]
      },
      {
        id: 'work_location',
        question: 'Where should the upcycling work take place?',
        type: 'radio',
        required: false,
        options: [
          { value: 'on_site', label: 'At my property' },
          { value: 'workshop', label: 'Taken away to a workshop' },
          { value: 'either', label: 'Either is fine' }
        ]
      },
      {
        id: 'furniture_timing',
        question: 'When would you like the furniture project completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within 1 week)' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'month_plus', label: 'In the next month or so' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      },
      {
        id: 'furniture_additional_info',
        question: 'Share any photos, inspiration or special requirements.',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'room-painting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'room_type',
        question: 'What type of room needs painting?',
        type: 'radio',
        required: true,
        options: [
          { value: 'living_room', label: 'Living room' },
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'hallway', label: 'Hallway / corridor' },
          { value: 'other', label: 'Other room' }
        ]
      },
      {
        id: 'room_size',
        question: 'Roughly how big is the room?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (up to 10 m²)' },
          { value: 'medium', label: 'Medium (10–20 m²)' },
          { value: 'large', label: 'Large (20–30 m²)' },
          { value: 'very_large', label: 'Very large (30 m²+)' }
        ]
      },
      {
        id: 'surfaces_to_paint',
        question: 'Which surfaces need painting in this room?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'walls', label: 'Walls' },
          { value: 'ceiling', label: 'Ceiling' },
          { value: 'woodwork', label: 'Woodwork (doors, frames, skirting)' },
          { value: 'radiators', label: 'Radiators / heaters' },
          { value: 'built_in_units', label: 'Built-in units / wardrobes' }
        ]
      },
      {
        id: 'room_current_condition',
        question: 'What is the current condition of the surfaces?',
        type: 'radio',
        required: true,
        options: [
          { value: 'good', label: 'Good – light preparation only' },
          { value: 'minor_cracks', label: 'Minor cracks / small holes' },
          { value: 'significant_defects', label: 'Significant cracks or flaking paint' },
          { value: 'new_plaster', label: 'Newly plastered surfaces' }
        ]
      },
      {
        id: 'colour_status',
        question: 'Do you already have paint colours chosen?',
        type: 'radio',
        required: false,
        options: [
          { value: 'colours_ready', label: 'Yes, colours are chosen' },
          { value: 'need_advice', label: 'Rough idea – need help finalising' },
          { value: 'no_idea', label: 'No, I\'d like suggestions' }
        ]
      },
      {
        id: 'paint_and_materials',
        question: 'Who will provide the paint and materials?',
        type: 'radio',
        required: false,
        options: [
          { value: 'client_supplies', label: 'I will supply the paint' },
          { value: 'pro_supplies', label: 'I\'d like the professional to supply everything' },
          { value: 'mixed', label: 'A mix of both' }
        ]
      },
      {
        id: 'room_access',
        question: 'Is there anything that might affect access or working conditions?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'furniture_present', label: 'Room is full of furniture' },
          { value: 'high_ceiling', label: 'High ceilings (over 3 m)' },
          { value: 'occupied_space', label: 'Room will be in use during works' },
          { value: 'no_issues', label: 'No particular issues' }
        ]
      },
      {
        id: 'room_timing',
        question: 'When would you like this room painted?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within 1 week)' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      },
      {
        id: 'room_additional_info',
        question: 'Anything else the professional should know about this room?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'full-flat-repaint',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'property_size',
        question: 'What size is the flat or apartment?',
        type: 'radio',
        required: true,
        options: [
          { value: 'studio_1bed', label: 'Studio or 1 bedroom' },
          { value: 'two_bed', label: '2 bedrooms' },
          { value: 'three_bed', label: '3 bedrooms' },
          { value: 'four_plus_bed', label: '4+ bedrooms' }
        ]
      },
      {
        id: 'areas_to_include',
        question: 'Which areas should be included in the repaint?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'living_areas', label: 'Living / dining areas' },
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'bathrooms', label: 'Bathrooms' },
          { value: 'hallways', label: 'Hallways / corridors' },
          { value: 'woodwork', label: 'Woodwork (doors, frames, skirting)' },
          { value: 'ceilings', label: 'Ceilings' }
        ]
      },
      {
        id: 'flat_condition',
        question: 'What best describes the condition of the existing paintwork?',
        type: 'radio',
        required: true,
        options: [
          { value: 'light_refresh', label: 'Generally good – light refresh' },
          { value: 'wear_and_marks', label: 'Visible wear, marks and scuffs' },
          { value: 'cracks_and_flaking', label: 'Cracks, flaking or peeling paint' },
          { value: 'mixed_condition', label: 'Mixed – some rooms worse than others' }
        ]
      },
      {
        id: 'colour_change_scope',
        question: 'Are you keeping similar colours or changing schemes completely?',
        type: 'radio',
        required: false,
        options: [
          { value: 'similar_colours', label: 'Similar colours, freshen up' },
          { value: 'new_colours', label: 'New colours throughout' },
          { value: 'mixed', label: 'Mix of both' },
          { value: 'need_advice', label: 'Need advice on colours' }
        ]
      },
      {
        id: 'flat_occupied',
        question: 'Will the flat be occupied during the works?',
        type: 'radio',
        required: true,
        options: [
          { value: 'occupied_full_time', label: 'Yes, occupied full-time' },
          { value: 'partly_occupied', label: 'Partly occupied' },
          { value: 'empty', label: 'No, the flat will be empty' }
        ]
      },
      {
        id: 'access_parking',
        question: 'How is access and parking to the property?',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy_access', label: 'Easy access and parking' },
          { value: 'limited_parking', label: 'Limited parking / loading' },
          { value: 'upper_floor_no_lift', label: 'Upper floor, no lift' },
          { value: 'upper_floor_with_lift', label: 'Upper floor, with lift' }
        ]
      },
      {
        id: 'flat_timing',
        question: 'When would you like the repaint to start?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within_week', label: 'Within the next week' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'next_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on dates' }
        ]
      },
      {
        id: 'flat_additional_info',
        question: 'Share any floor plans, deadlines (e.g. move-in dates) or special details.',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'single-room-repaint',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'single_room_type',
        question: 'What type of room are you repainting?',
        type: 'radio',
        required: true,
        options: [
          { value: 'living_room', label: 'Living room' },
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'office', label: 'Home office / study' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'single_room_size',
        question: 'Roughly what size is the room?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small', label: 'Small (up to 10 m²)' },
          { value: 'medium', label: 'Medium (10–20 m²)' },
          { value: 'large', label: 'Large (20–30 m²)' },
          { value: 'very_large', label: 'Very large (30 m²+)' }
        ]
      },
      {
        id: 'single_room_surfaces',
        question: 'Which surfaces are included in this repaint?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'walls', label: 'Walls' },
          { value: 'ceiling', label: 'Ceiling' },
          { value: 'woodwork', label: 'Woodwork (doors, frames, skirting)' },
          { value: 'radiator', label: 'Radiator / heater' }
        ]
      },
      {
        id: 'single_room_condition',
        question: 'What condition are the surfaces currently in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'light_marks', label: 'Light marks and scuffs only' },
          { value: 'minor_repairs', label: 'Needs minor filling and repairs' },
          { value: 'major_repairs', label: 'Cracks, flaking or damaged areas' },
          { value: 'new_plaster', label: 'New plaster that has not been painted' }
        ]
      },
      {
        id: 'single_room_colour_plan',
        question: 'What are your plans for colours in this room?',
        type: 'radio',
        required: false,
        options: [
          { value: 'same_colour', label: 'Keep similar colour' },
          { value: 'new_colour', label: 'Change to a new colour' },
          { value: 'feature_wall', label: 'Include a feature wall' },
          { value: 'need_advice', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'single_room_furniture',
        question: 'What is the situation with furniture in the room?',
        type: 'radio',
        required: false,
        options: [
          { value: 'empty', label: 'Room will be empty' },
          { value: 'some_furniture', label: 'Some furniture, can be moved around' },
          { value: 'full_room', label: 'Full room – limited space to move items' }
        ]
      },
      {
        id: 'single_room_timing',
        question: 'When would you like this repaint done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within a few days)' },
          { value: 'two_weeks', label: 'Within the next 2 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible' }
        ]
      },
      {
        id: 'single_room_notes',
        question: 'Any special details (e.g. mould, stains, pets, children\'s room)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'stairwell-hallway-painting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'hall_stair_type',
        question: 'What areas are included in this job?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'entrance_hall', label: 'Entrance hall' },
          { value: 'corridors', label: 'Corridors / landings' },
          { value: 'stairs', label: 'Staircase walls' },
          { value: 'balustrade', label: 'Balustrade / handrail' },
          { value: 'doors_frames', label: 'Doors and frames off the hallway' }
        ]
      },
      {
        id: 'hall_stair_levels',
        question: 'How many levels or floors does the stairwell/hallway cover?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_level', label: 'Single level' },
          { value: 'two_levels', label: 'Two levels' },
          { value: 'three_plus_levels', label: 'Three or more levels' }
        ]
      },
      {
        id: 'hall_stair_height',
        question: 'Are there any particularly high or difficult-to-reach areas?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_height', label: 'No, standard ceiling height' },
          { value: 'double_height', label: 'Yes, double-height spaces' },
          { value: 'awkward_access', label: 'Yes, awkward areas over stairs' }
        ]
      },
      {
        id: 'hall_stair_condition',
        question: 'What condition are the existing surfaces in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'light_wear', label: 'Light wear and scuffs' },
          { value: 'cracks_and_dents', label: 'Cracks and dents that need filling' },
          { value: 'flaking_or_peeling', label: 'Flaking or peeling paint' },
          { value: 'new_plaster', label: 'New surfaces, not painted yet' }
        ]
      },
      {
        id: 'hall_stair_surfaces',
        question: 'Which surfaces should be included?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'walls', label: 'Walls' },
          { value: 'ceilings', label: 'Ceilings' },
          { value: 'woodwork', label: 'Woodwork (frames, skirting, handrails)' },
          { value: 'radiators', label: 'Radiators' }
        ]
      },
      {
        id: 'hall_stair_traffic',
        question: 'Is this a high-traffic area that needs extra-durable paint?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_high_traffic', label: 'Yes, high-traffic area' },
          { value: 'normal_use', label: 'Normal use' },
          { value: 'low_use', label: 'Low use' }
        ]
      },
      {
        id: 'hall_stair_timing',
        question: 'When would you like the stairwell/hallway painting done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within 1 week)' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'next_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible' }
        ]
      },
      {
        id: 'hall_stair_notes',
        question: 'Any special access, safety or timing considerations?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'touch-up-minor-repairs',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'interior',
    version: 1,
    questions: [
      {
        id: 'touchup_areas',
        question: 'Which areas need touch-ups or minor repairs?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'walls', label: 'Walls' },
          { value: 'ceilings', label: 'Ceilings' },
          { value: 'woodwork', label: 'Woodwork (doors, frames, skirting)' },
          { value: 'radiators', label: 'Radiators / heaters' },
          { value: 'other', label: 'Other painted surfaces' }
        ]
      },
      {
        id: 'touchup_defect_types',
        question: 'What kind of defects need attention?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'scuffs_marks', label: 'Scuffs and surface marks' },
          { value: 'small_holes', label: 'Small holes (e.g. picture hooks)' },
          { value: 'hairline_cracks', label: 'Hairline cracks' },
          { value: 'flaking_paint', label: 'Flaking or peeling paint' },
          { value: 'stains', label: 'Stains (e.g. water marks)' }
        ]
      },
      {
        id: 'touchup_approx_areas',
        question: 'Roughly how many areas or rooms are affected?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_room', label: 'One room / area' },
          { value: 'two_three_rooms', label: 'Two or three rooms' },
          { value: 'whole_property', label: 'Several rooms / whole property' }
        ]
      },
      {
        id: 'paint_available',
        question: 'Do you already have matching paint available for touch-ups?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes_exact', label: 'Yes, exact paint is available' },
          { value: 'yes_similar', label: 'Yes, similar paint is available' },
          { value: 'no_paint', label: 'No, paint needs to be supplied' }
        ]
      },
      {
        id: 'touchup_finish_level',
        question: 'What level of finish are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'quick_neat', label: 'Quick and neat improvement' },
          { value: 'blend_in', label: 'Blended to match existing as best as possible' },
          { value: 'like_new', label: 'As close to \'like new\' as possible' }
        ]
      },
      {
        id: 'touchup_access',
        question: 'Is there anything that may affect access or working conditions?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'furniture_present', label: 'Rooms are full of furniture' },
          { value: 'high_ceiling', label: 'Some high or awkward areas' },
          { value: 'occupied', label: 'Property occupied during works' },
          { value: 'no_issues', label: 'No particular access issues' }
        ]
      },
      {
        id: 'touchup_timing',
        question: 'When do you need the touch-ups and repairs completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (next 2–3 days)' },
          { value: 'week', label: 'Within 1 week' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'flexible', label: 'Flexible' }
        ]
      },
      {
        id: 'touchup_notes',
        question: 'Describe any key areas (e.g. stains from leaks, damage from tenants, etc.).',
        type: 'text',
        required: false
      }
    ]
  },

  // ============================================================
  // PAINTING & DECORATING - SPECIALIST
  // ============================================================

  {
    microSlug: 'ceiling-texturing',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'ceiling_area_size',
        question: 'Roughly how large is the ceiling area to be textured?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_room', label: 'Small room (up to 10 m²)' },
          { value: 'medium_room', label: 'Medium room (10–20 m²)' },
          { value: 'large_room', label: 'Large room (20–35 m²)' },
          { value: 'multiple_rooms', label: 'Multiple rooms / whole property' }
        ]
      },
      {
        id: 'ceiling_height',
        question: 'What is the approximate ceiling height?',
        type: 'radio',
        required: true,
        options: [
          { value: 'standard', label: 'Standard (up to 2.7 m)' },
          { value: 'high', label: 'High (2.7–3.5 m)' },
          { value: 'very_high', label: 'Very high (over 3.5 m)' }
        ]
      },
      {
        id: 'ceiling_current_finish',
        question: 'What is the current ceiling finish?',
        type: 'radio',
        required: true,
        options: [
          { value: 'smooth_painted', label: 'Smooth painted ceiling' },
          { value: 'old_texture', label: 'Old textured finish' },
          { value: 'bare_plaster', label: 'Bare plaster / boards' },
          { value: 'stained_or_damaged', label: 'Stained or damaged areas' }
        ]
      },
      {
        id: 'texture_style',
        question: 'What type of texture are you interested in?',
        type: 'radio',
        required: false,
        options: [
          { value: 'light_subtle', label: 'Light, subtle texture' },
          { value: 'medium_texture', label: 'Medium texture' },
          { value: 'heavy_texture', label: 'Heavy / strong texture' },
          { value: 'unsure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'old_texture_removal',
        question: 'Do you need any existing textured ceiling removed or skimmed first?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no_existing_texture', label: 'No, it\'s already smooth' },
          { value: 'cover_existing', label: 'No, just texture over existing' },
          { value: 'remove_existing', label: 'Yes, remove / skim old texture first' },
          { value: 'not_sure', label: 'Not sure – need professional opinion' }
        ]
      },
      {
        id: 'ceiling_access',
        question: 'Is access to the ceiling straightforward?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'clear_room', label: 'Room can be cleared' },
          { value: 'furniture_present', label: 'Furniture will remain in place' },
          { value: 'limited_space', label: 'Limited space for ladders / platforms' },
          { value: 'staircase_area', label: 'Ceiling over stairs / difficult access' }
        ]
      },
      {
        id: 'ceiling_texturing_timing',
        question: 'When would you like the ceiling texturing done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'As soon as possible' },
          { value: 'two_weeks', label: 'Within the next 2 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      },
      {
        id: 'ceiling_texturing_notes',
        question: 'Any special details (e.g. cracks, previous leaks, decorative features)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'decorative-faux-finishes',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'faux_area_type',
        question: 'Where do you want the decorative or faux finish applied?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'feature_wall', label: 'Feature wall' },
          { value: 'full_room', label: 'Full room' },
          { value: 'multiple_rooms', label: 'Multiple rooms' },
          { value: 'ceilings', label: 'Ceilings' },
          { value: 'furniture', label: 'Furniture or built-in units' }
        ]
      },
      {
        id: 'faux_area_size',
        question: 'Roughly how large is the total area to be finished?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_10', label: 'Up to 10 m²' },
          { value: '10_to_25', label: '10–25 m²' },
          { value: '25_to_50', label: '25–50 m²' },
          { value: '50_plus', label: 'More than 50 m²' }
        ]
      },
      {
        id: 'faux_finish_type',
        question: 'Which type of decorative finish are you interested in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'marble_effect', label: 'Marble / stone effect' },
          { value: 'metallic_effect', label: 'Metallic / pearlescent finish' },
          { value: 'concrete_effect', label: 'Concrete / industrial effect' },
          { value: 'aged_distressed', label: 'Aged / distressed look' },
          { value: 'other_or_unsure', label: 'Other / not sure, need ideas' }
        ]
      },
      {
        id: 'faux_reference_material',
        question: 'Do you have reference images or a specific style in mind?',
        type: 'radio',
        required: false,
        options: [
          { value: 'have_photos', label: 'Yes, I have photos or links' },
          { value: 'rough_idea', label: 'Rough idea, need help refining' },
          { value: 'no_idea', label: 'No, I\'d like creative suggestions' }
        ]
      },
      {
        id: 'faux_surface_condition',
        question: 'What condition are the existing surfaces in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'smooth_good', label: 'Smooth and in good condition' },
          { value: 'minor_defects', label: 'Minor cracks / small repairs needed' },
          { value: 'damaged', label: 'Damaged – needs more preparation' },
          { value: 'new_plaster', label: 'New plaster, not yet painted' }
        ]
      },
      {
        id: 'faux_gloss_level',
        question: 'What kind of sheen or finish do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'matt', label: 'Matt / very low sheen' },
          { value: 'satin', label: 'Soft sheen / satin' },
          { value: 'high_gloss', label: 'High gloss / polished look' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'faux_timing',
        question: 'When would you like the decorative finish completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'specific_deadline', label: 'By a specific date (event, opening, etc.)' },
          { value: 'two_weeks', label: 'Within the next 2 weeks' },
          { value: 'month', label: 'Within the next month' },
          { value: 'flexible', label: 'Timing is flexible' }
        ]
      },
      {
        id: 'faux_notes',
        question: 'Share any themes, colours or inspirations the professional should know about.',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'epoxy-garage-floor',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'floor_area_type',
        question: 'Where is the floor you want coated?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_garage', label: 'Single garage' },
          { value: 'double_garage', label: 'Double garage' },
          { value: 'multi_bay_garage', label: 'Multi-bay / larger garage' },
          { value: 'indoor_floor', label: 'Indoor room or utility space' },
          { value: 'commercial', label: 'Workshop / commercial space' }
        ]
      },
      {
        id: 'floor_area_size',
        question: 'Approximate size of the floor area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_20', label: 'Up to 20 m²' },
          { value: '20_to_40', label: '20–40 m²' },
          { value: '40_to_80', label: '40–80 m²' },
          { value: '80_plus', label: 'More than 80 m²' }
        ]
      },
      {
        id: 'existing_floor_material',
        question: 'What is the existing floor surface made of?',
        type: 'radio',
        required: true,
        options: [
          { value: 'concrete_good', label: 'Concrete in good condition' },
          { value: 'concrete_worn', label: 'Concrete with oil stains / wear' },
          { value: 'painted_floor', label: 'Previously painted floor' },
          { value: 'tiles', label: 'Tiles' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'floor_damage_level',
        question: 'What best describes the current condition of the floor?',
        type: 'radio',
        required: true,
        options: [
          { value: 'mostly_smooth', label: 'Mostly smooth, minor marks' },
          { value: 'cracks_and_pits', label: 'Cracks / small pits that need repair' },
          { value: 'heavy_damage', label: 'Heavily damaged or uneven' }
        ]
      },
      {
        id: 'coating_type_preference',
        question: 'What type of coating are you considering?',
        type: 'radio',
        required: false,
        options: [
          { value: 'basic_epoxy', label: 'Standard epoxy coating' },
          { value: 'high_build_epoxy', label: 'High-build / industrial epoxy' },
          { value: 'decorative_flakes', label: 'Decorative flake or quartz finish' },
          { value: 'not_sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'usage_type',
        question: 'How will this floor mainly be used?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'car_parking', label: 'Parking vehicles' },
          { value: 'workshop', label: 'Workshop / tools' },
          { value: 'storage', label: 'Storage area' },
          { value: 'living_space', label: 'Living / hobby space' },
          { value: 'heavy_industrial', label: 'Heavy commercial or industrial use' }
        ]
      },
      {
        id: 'floor_timing',
        question: 'When would you like the floor coating done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within_two_weeks', label: 'Within the next 2 weeks' },
          { value: 'within_month', label: 'Within the next month' },
          { value: 'after_month', label: 'In more than a month' },
          { value: 'flexible', label: 'Flexible' }
        ]
      },
      {
        id: 'floor_notes',
        question: 'Any details about oil spills, moisture issues or vehicle type (e.g. bikes, vans)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'limewash-natural-paint',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'limewash_area_type',
        question: 'Where do you want limewash or natural paints applied?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'interior_walls', label: 'Interior walls' },
          { value: 'interior_ceilings', label: 'Interior ceilings' },
          { value: 'exterior_walls', label: 'Exterior walls / façades' },
          { value: 'feature_areas', label: 'Feature walls / specific areas' }
        ]
      },
      {
        id: 'substrate_type',
        question: 'What are the walls currently made or finished from?',
        type: 'radio',
        required: true,
        options: [
          { value: 'plaster', label: 'Plaster' },
          { value: 'stone_or_brick', label: 'Stone or brick' },
          { value: 'render', label: 'Cement or lime render' },
          { value: 'drywall', label: 'Plasterboard / drywall' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'existing_paint_type',
        question: 'Is there existing paint or coating on the surface?',
        type: 'radio',
        required: true,
        options: [
          { value: 'bare_surface', label: 'No, it\'s bare' },
          { value: 'breathable_paint', label: 'Yes, breathable / mineral paint' },
          { value: 'standard_emulsion', label: 'Yes, standard emulsion / acrylic' },
          { value: 'glossy_or_sealed', label: 'Yes, glossy or sealed paint' }
        ]
      },
      {
        id: 'limewash_style',
        question: 'What kind of limewash or natural finish do you want?',
        type: 'radio',
        required: false,
        options: [
          { value: 'soft_mottled', label: 'Soft, mottled limewash look' },
          { value: 'solid_colour', label: 'More solid, even coverage' },
          { value: 'textured', label: 'Slightly textured, rustic finish' },
          { value: 'not_sure', label: 'Not sure – need guidance' }
        ]
      },
      {
        id: 'eco_priority',
        question: 'How important are eco and low-VOC materials for this project?',
        type: 'radio',
        required: false,
        options: [
          { value: 'top_priority', label: 'Top priority – fully natural products' },
          { value: 'prefer_eco', label: 'Prefer eco where possible' },
          { value: 'no_strong_preference', label: 'No strong preference' }
        ]
      },
      {
        id: 'damp_issues',
        question: 'Are there any known damp or breathability issues in these walls?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no_issues', label: 'No, no damp issues' },
          { value: 'some_damp', label: 'Yes, some damp / condensation' },
          { value: 'serious_damp', label: 'Yes, serious damp problems' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'limewash_timing',
        question: 'When would you like the limewash or natural painting done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'soon', label: 'Soon (within 2 weeks)' },
          { value: 'within_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible, no fixed deadline' }
        ]
      },
      {
        id: 'limewash_notes',
        question: 'Any architectural features (arches, thick walls, old finca, etc.) or special requests?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'microcement-polished',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'microcement_area_type',
        question: 'Where do you want microcement or polished coating applied?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'floors', label: 'Floors' },
          { value: 'walls', label: 'Walls' },
          { value: 'bathroom', label: 'Bathroom / shower area' },
          { value: 'worktops', label: 'Worktops / counters' },
          { value: 'stairs', label: 'Stairs' }
        ]
      },
      {
        id: 'microcement_area_size',
        question: 'Approximate total area to be finished with microcement?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_10', label: 'Up to 10 m²' },
          { value: '10_to_25', label: '10–25 m²' },
          { value: '25_to_50', label: '25–50 m²' },
          { value: '50_plus', label: 'More than 50 m²' }
        ]
      },
      {
        id: 'existing_surface_microcement',
        question: 'What is the existing surface like where microcement will be applied?',
        type: 'radio',
        required: true,
        options: [
          { value: 'tiles', label: 'Tiles' },
          { value: 'concrete', label: 'Concrete / screed' },
          { value: 'plasterboard', label: 'Plaster / plasterboard' },
          { value: 'existing_microcement', label: 'Existing microcement / similar finish' },
          { value: 'mixed_or_unsure', label: 'Mixed surfaces / not sure' }
        ]
      },
      {
        id: 'wet_area_involved',
        question: 'Will any of these areas be exposed to regular water (showers, outdoors, etc.)?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes_shower', label: 'Yes, in a shower / wet room' },
          { value: 'yes_outdoor', label: 'Yes, outdoor / semi-outdoor area' },
          { value: 'no_dry_area', label: 'No, only dry interior areas' }
        ]
      },
      {
        id: 'microcement_style',
        question: 'What look or style are you aiming for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'minimal_concrete', label: 'Minimal, concrete look' },
          { value: 'warm_tonal', label: 'Warm, soft-toned finish' },
          { value: 'high_polish', label: 'High polish, reflective finish' },
          { value: 'rustic', label: 'Rustic / textured feel' },
          { value: 'undecided', label: 'Not decided yet' }
        ]
      },
      {
        id: 'microcement_traffic_level',
        question: 'What level of use or traffic will these surfaces have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'light_domestic', label: 'Light domestic use' },
          { value: 'busy_family', label: 'Busy family / pets' },
          { value: 'commercial', label: 'Commercial / high-traffic use' }
        ]
      },
      {
        id: 'microcement_timing',
        question: 'When do you want the microcement / polished finish completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within_month', label: 'Within the next month' },
          { value: 'one_two_months', label: 'Within 1–2 months' },
          { value: 'flexible', label: 'Flexible on timing' }
        ]
      },
      {
        id: 'microcement_notes',
        question: 'Any important details (underfloor heating, existing cracks, design photos)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'spray-painting',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'spray_items_type',
        question: 'What items or surfaces need spray painting?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'radiators', label: 'Radiators / heaters' },
          { value: 'furniture', label: 'Furniture' },
          { value: 'doors_frames', label: 'Doors / frames' },
          { value: 'metalwork', label: 'Metalwork (railings, gates, etc.)' },
          { value: 'other', label: 'Other items' }
        ]
      },
      {
        id: 'spray_quantity',
        question: 'Roughly how many items or surfaces are there in total?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_job', label: 'Small job (1–3 items)' },
          { value: 'medium_job', label: 'Medium (4–8 items)' },
          { value: 'large_job', label: 'Large (9–15 items)' },
          { value: 'very_large_job', label: 'Very large (15+ items)' }
        ]
      },
      {
        id: 'spray_location',
        question: 'Where should the spray painting work be done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'on_site', label: 'On site at my property' },
          { value: 'off_site_workshop', label: 'Taken away to a workshop' },
          { value: 'mixed', label: 'A mix of both' },
          { value: 'not_sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'spray_surface_material',
        question: 'What are the main materials to be sprayed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'wood', label: 'Wood' },
          { value: 'metal', label: 'Metal' },
          { value: 'mdf', label: 'MDF / engineered board' },
          { value: 'plastic', label: 'Plastic' },
          { value: 'other', label: 'Other materials' }
        ]
      },
      {
        id: 'spray_finish_preference',
        question: 'What type of finish do you want?',
        type: 'radio',
        required: false,
        options: [
          { value: 'matt', label: 'Matt' },
          { value: 'satin', label: 'Satin / eggshell' },
          { value: 'gloss', label: 'High gloss' },
          { value: 'special', label: 'Special finish (metallic, textured, etc.)' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'old_finish_preparation',
        question: 'What preparation is required before spraying?',
        type: 'radio',
        required: true,
        options: [
          { value: 'clean_new', label: 'New items, just light prep' },
          { value: 'light_sanding', label: 'Existing finish, minor sanding' },
          { value: 'heavy_prep', label: 'Old, chipped or flaky paint to be removed' },
          { value: 'not_sure', label: 'Not sure – need assessment' }
        ]
      },
      {
        id: 'spray_timing',
        question: 'When do you need the spray painting completed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within 1 week)' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'within_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible timing' }
        ]
      },
      {
        id: 'spray_notes',
        question: 'Any special details (colour matching, brand preferences, heat-resistant paints)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'wallpaper-installation',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'wallpaper_area_scope',
        question: 'What do you need wallpapered?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_feature_wall', label: 'Single feature wall' },
          { value: 'one_room', label: 'One full room' },
          { value: 'multiple_rooms', label: 'Multiple rooms / areas' },
          { value: 'staircase_hall', label: 'Staircase / hall area' }
        ]
      },
      {
        id: 'wallpaper_type',
        question: 'What type of wallpaper are you using or considering?',
        type: 'radio',
        required: true,
        options: [
          { value: 'standard_paper', label: 'Standard wallpaper' },
          { value: 'vinyl', label: 'Vinyl / washable' },
          { value: 'non_woven', label: 'Non-woven / paste-the-wall' },
          { value: 'textured_or_fabric', label: 'Textured / fabric / special' },
          { value: 'not_chosen', label: 'Not chosen yet' }
        ]
      },
      {
        id: 'wallpaper_supplied',
        question: 'Have you already purchased the wallpaper?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes_supplied', label: 'Yes, I have all wallpaper ready' },
          { value: 'partly_supplied', label: 'Yes, but not sure if it\'s enough' },
          { value: 'no_need_supply', label: 'No, I\'d like the professional to supply' }
        ]
      },
      {
        id: 'wall_condition_for_paper',
        question: 'What is the current condition of the walls?',
        type: 'radio',
        required: true,
        options: [
          { value: 'smooth_painted', label: 'Smooth and recently painted' },
          { value: 'minor_defects', label: 'Minor imperfections / small repairs needed' },
          { value: 'old_paper', label: 'Old wallpaper needs to be removed first' },
          { value: 'rough_or_damaged', label: 'Rough / damaged, may need lining' }
        ]
      },
      {
        id: 'pattern_complexity',
        question: 'What kind of pattern or design will be installed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'plain_or_subtle', label: 'Plain or subtle pattern' },
          { value: 'medium_pattern', label: 'Patterned, not heavily matched' },
          { value: 'complex_pattern', label: 'Strong pattern that needs precise matching' },
          { value: 'mural_or_scene', label: 'Mural / scene-based wallpaper' }
        ]
      },
      {
        id: 'wallpaper_obstacles',
        question: 'Are there any tricky areas or obstacles?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'many_sockets_switches', label: 'Lots of sockets / switches' },
          { value: 'built_in_units', label: 'Built-in units / shelves' },
          { value: 'windows_doors', label: 'Many windows or doors' },
          { value: 'stairs_access', label: 'Over stairs or high access areas' },
          { value: 'no_major_obstacles', label: 'No major obstacles' }
        ]
      },
      {
        id: 'wallpaper_timing',
        question: 'When do you need the wallpaper installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'within_week', label: 'Within 1 week' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'within_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible on dates' }
        ]
      },
      {
        id: 'wallpaper_notes',
        question: 'Any special instructions (brand, pattern repeat, murals, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },

  {
    microSlug: 'wallpaper-removal-install',
    categorySlug: 'painting-decorating',
    subcategorySlug: 'specialist',
    version: 1,
    questions: [
      {
        id: 'wallpaper_job_scope',
        question: 'What do you need help with?',
        type: 'radio',
        required: true,
        options: [
          { value: 'remove_only', label: 'Remove old wallpaper only' },
          { value: 'remove_and_paint', label: 'Remove wallpaper and repaint walls' },
          { value: 'remove_and_new_paper', label: 'Remove wallpaper and install new wallpaper' }
        ]
      },
      {
        id: 'rooms_with_wallpaper',
        question: 'How many rooms or areas have wallpaper to remove?',
        type: 'radio',
        required: true,
        options: [
          { value: 'single_room', label: 'One room / feature wall' },
          { value: 'two_rooms', label: 'Two rooms' },
          { value: 'three_four_rooms', label: 'Three–four rooms' },
          { value: 'whole_property', label: 'Most of the property' }
        ]
      },
      {
        id: 'wallpaper_age_type',
        question: 'Do you know the type or age of the existing wallpaper?',
        type: 'radio',
        required: false,
        options: [
          { value: 'modern_paper', label: 'Modern wallpaper (last 10 years)' },
          { value: 'older_paper', label: 'Older wallpaper (10+ years)' },
          { value: 'multiple_layers', label: 'Several layers of wallpaper' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'wall_condition_after_removal',
        question: 'Are you aware of any damage or issues behind the wallpaper?',
        type: 'radio',
        required: false,
        options: [
          { value: 'no_known_issues', label: 'No known issues' },
          { value: 'some_damp_or_mould', label: 'Possible damp or mould' },
          { value: 'cracks_or_patches', label: 'Cracks / previous patches' },
          { value: 'not_sure', label: 'Not sure until paper is removed' }
        ]
      },
      {
        id: 'new_finish_choice',
        question: 'What finish do you want after removal?',
        type: 'radio',
        required: true,
        options: [
          { value: 'smooth_painted_walls', label: 'Smooth painted walls' },
          { value: 'new_wallpaper', label: 'New wallpaper' },
          { value: 'undecided', label: 'Undecided – want options' }
        ]
      },
      {
        id: 'new_wallpaper_status',
        question: 'If installing new wallpaper, have you chosen and purchased it?',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_have_paper', label: 'Yes, wallpaper is ready' },
          { value: 'not_yet', label: 'Not yet, need advice' },
          { value: 'not_installing_new', label: 'Not installing new wallpaper' }
        ]
      },
      {
        id: 'wallpaper_removal_timing',
        question: 'When do you need the wallpaper removal and follow-up work done?',
        type: 'radio',
        required: true,
        options: [
          { value: 'urgent', label: 'Urgent (within 1 week)' },
          { value: 'two_three_weeks', label: 'Within 2–3 weeks' },
          { value: 'within_month', label: 'Within the next month' },
          { value: 'flexible', label: 'Flexible timing' }
        ]
      },
      {
        id: 'wallpaper_removal_notes',
        question: 'Any special considerations (occupied property, children, pets, access, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },

  // ===== FLOORS, DOORS & WINDOWS =====
  {
    microSlug: 'exterior-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'ext_door_project_type',
        question: 'What type of exterior door project is this?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_opening', label: 'New opening in a wall' },
          { value: 'replace_existing', label: 'Replace an existing exterior door' },
          { value: 'additional_door', label: 'Add an extra exterior door' }
        ]
      },
      {
        id: 'ext_door_locations',
        question: 'Where will the exterior doors be installed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'front_entrance', label: 'Front entrance' },
          { value: 'back_entrance', label: 'Back door / garden access' },
          { value: 'side_entrance', label: 'Side entrance' },
          { value: 'terrace_balcony', label: 'Terrace / balcony access' }
        ]
      },
      {
        id: 'ext_door_quantity',
        question: 'How many exterior doors are involved?',
        type: 'radio',
        required: true,
        options: [
          { value: 'one', label: '1 door' },
          { value: 'two', label: '2 doors' },
          { value: 'three_four', label: '3–4 doors' },
          { value: 'five_plus', label: '5 or more doors' }
        ]
      },
      {
        id: 'ext_door_style',
        question: 'What style of exterior door are you considering?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'single_leaf', label: 'Single door' },
          { value: 'double_leaf', label: 'Double door (French style)' },
          { value: 'with_glass', label: 'Door with glass panels' },
          { value: 'solid', label: 'Solid door (no glass)' }
        ]
      },
      {
        id: 'ext_door_material_preference',
        question: 'What material do you prefer for the exterior doors?',
        type: 'radio',
        required: false,
        options: [
          { value: 'timber', label: 'Timber / wood' },
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'steel', label: 'Steel / reinforced' },
          { value: 'no_preference', label: 'No strong preference' }
        ]
      },
      {
        id: 'ext_door_security_level',
        question: 'What level of security is important for these doors?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard', label: 'Standard residential security' },
          { value: 'high_security', label: 'High-security, reinforced door' },
          { value: 'sound_insulation', label: 'Good sound and thermal insulation' }
        ]
      },
      {
        id: 'ext_door_existing_frame',
        question: 'Will the existing door frames be reused or replaced?',
        type: 'radio',
        required: true,
        options: [
          { value: 'keep_frame', label: 'Keep existing frames if possible' },
          { value: 'replace_frame', label: 'Replace frames with new' },
          { value: 'not_sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'ext_door_notes',
        question: 'Any special requirements (e.g. step-free access, specific locks, design style)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'interior-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'int_door_scope',
        question: 'What do you need for your interior doors?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_doors_only', label: 'Install new doors on existing frames' },
          { value: 'doors_and_frames', label: 'New doors and new frames' },
          { value: 'adjust_or_rehang', label: 'Adjust, trim or rehang existing doors' }
        ]
      },
      {
        id: 'int_door_quantity',
        question: 'How many interior doors are involved?',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 doors' },
          { value: 'three_five', label: '3–5 doors' },
          { value: 'six_ten', label: '6–10 doors' },
          { value: 'ten_plus', label: 'More than 10 doors' }
        ]
      },
      {
        id: 'int_door_locations',
        question: 'Where in the property are these doors?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'bathrooms', label: 'Bathrooms' },
          { value: 'living_areas', label: 'Living / dining areas' },
          { value: 'corridors', label: 'Corridors / hallways' },
          { value: 'closets_storage', label: 'Closets / storage rooms' }
        ]
      },
      {
        id: 'int_door_style',
        question: 'What style of interior doors do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'flush_plain', label: 'Flush / plain doors' },
          { value: 'panelled', label: 'Panelled doors' },
          { value: 'glass_panel_doors', label: 'Doors with glass panels' },
          { value: 'sliding_pocket', label: 'Sliding / pocket doors' },
          { value: 'not_sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'int_door_material',
        question: 'What material are you considering for the doors?',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_wood', label: 'Solid wood' },
          { value: 'engineered_wood', label: 'Engineered / semi-solid' },
          { value: 'hollow_core', label: 'Hollow-core / lightweight' },
          { value: 'glass_metal', label: 'Glass and metal combination' },
          { value: 'open_to_advice', label: 'Open to professional advice' }
        ]
      },
      {
        id: 'int_door_hardware',
        question: 'Do you also need handles, locks or other hardware supplied and fitted?',
        type: 'radio',
        required: true,
        options: [
          { value: 'reuse_existing', label: 'Reuse existing hardware' },
          { value: 'client_supplies_new', label: 'I will supply new hardware' },
          { value: 'pro_supply_and_fit', label: "I'd like the professional to supply and fit" }
        ]
      },
      {
        id: 'int_door_frame_condition',
        question: 'What condition are the existing frames and openings in?',
        type: 'radio',
        required: false,
        options: [
          { value: 'good_condition', label: 'Good condition, no repairs needed' },
          { value: 'minor_repairs', label: 'Minor repairs / filling needed' },
          { value: 'needs_replacement', label: 'Some frames need replacing' },
          { value: 'not_sure', label: 'Not sure – need assessment' }
        ]
      },
      {
        id: 'int_door_notes',
        question: 'Any special requirements (soundproofing, soft-close, child safety, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'bifold-large-sliding-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'large_door_type',
        question: 'What type of system are you interested in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'bifold', label: 'Bifold doors' },
          { value: 'sliding', label: 'Sliding doors' },
          { value: 'lift_slide', label: 'Lift-and-slide doors' },
          { value: 'unsure', label: 'Not sure – open to advice' }
        ]
      },
      {
        id: 'large_door_opening_status',
        question: 'Is this for an existing opening or a new structural opening?',
        type: 'radio',
        required: true,
        options: [
          { value: 'existing_opening', label: 'Use an existing opening' },
          { value: 'enlarge_opening', label: 'Enlarge an existing opening' },
          { value: 'new_opening', label: 'Create a new opening in a wall' }
        ]
      },
      {
        id: 'large_door_opening_width',
        question: 'What is the approximate width of the opening?',
        type: 'radio',
        required: false,
        options: [
          { value: 'up_to_2_5m', label: 'Up to 2.5 m wide' },
          { value: '2_5_to_4m', label: '2.5–4 m wide' },
          { value: '4_to_6m', label: '4–6 m wide' },
          { value: 'over_6m', label: 'More than 6 m wide' },
          { value: 'unknown', label: 'Not sure of measurements' }
        ]
      },
      {
        id: 'large_door_access_type',
        question: 'Where will these doors lead to?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'garden_terrace', label: 'Garden / terrace' },
          { value: 'pool_area', label: 'Pool area' },
          { value: 'balcony', label: 'Balcony' },
          { value: 'patio', label: 'Patio / outdoor lounge' }
        ]
      },
      {
        id: 'large_door_material',
        question: 'What material are you considering for the system?',
        type: 'radio',
        required: false,
        options: [
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'timber', label: 'Timber / wood' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'mixed', label: 'Mixed / clad system' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'large_door_performance',
        question: 'Which performance factors are most important to you?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'thermal_insulation', label: 'Thermal insulation (energy efficiency)' },
          { value: 'sound_insulation', label: 'Sound reduction' },
          { value: 'security', label: 'High security and locking' },
          { value: 'low_threshold', label: 'Low threshold / step-free access' }
        ]
      },
      {
        id: 'large_door_existing_flooring',
        question: 'What type of flooring meets the door area inside and outside?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'interior_tiles', label: 'Interior tiles' },
          { value: 'wood_floor', label: 'Wood / laminate flooring' },
          { value: 'polished_concrete', label: 'Polished concrete' },
          { value: 'exterior_tiles', label: 'Exterior tiles / terrace' },
          { value: 'other_surface', label: 'Other surfaces' }
        ]
      },
      {
        id: 'large_door_notes',
        question: 'Any structural details (beams, lintels) or design ideas the professional should know?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'front-door-installation',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'front_door_scope',
        question: 'What do you need for your front door?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_door_existing_frame', label: 'New door in existing frame' },
          { value: 'new_door_and_frame', label: 'New door and frame' },
          { value: 'relocate_entrance', label: 'Change or relocate the entrance position' }
        ]
      },
      {
        id: 'front_door_size_known',
        question: 'Do you know the approximate size of the current opening?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_size', label: 'Standard size door' },
          { value: 'wider_or_taller', label: 'Wider / taller than standard' },
          { value: 'double_door', label: 'Double front door' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'front_door_style',
        question: 'What style of front door are you looking for?',
        type: 'radio',
        required: false,
        options: [
          { value: 'modern_minimal', label: 'Modern / minimal' },
          { value: 'traditional', label: 'Traditional / classic' },
          { value: 'rustic', label: 'Rustic / finca style' },
          { value: 'glass_panels', label: 'With glass for light' },
          { value: 'solid_secure', label: 'Solid, highly secure door' }
        ]
      },
      {
        id: 'front_door_material',
        question: 'Preferred material for the front door?',
        type: 'radio',
        required: false,
        options: [
          { value: 'timber', label: 'Timber / wood' },
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'steel_security', label: 'Steel / security door' },
          { value: 'composite', label: 'Composite' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'front_door_security_features',
        question: 'Which security features are important to you?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'multi_point_lock', label: 'Multi-point locking system' },
          { value: 'security_cylinder', label: 'High-security cylinder / key system' },
          { value: 'spyhole_viewer', label: 'Spyhole / viewer' },
          { value: 'digital_lock', label: 'Digital / keyless entry' }
        ]
      },
      {
        id: 'front_door_surrounds',
        question: 'Do you also need work around the entrance area?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'side_panels', label: 'Side glass panels' },
          { value: 'top_light', label: 'Top light / transom window' },
          { value: 'render_or_cladding', label: 'Render or cladding around door' },
          { value: 'steps_or_ramp', label: 'Steps or access ramp' },
          { value: 'no_extra_work', label: 'No extra work needed' }
        ]
      },
      {
        id: 'front_door_notes',
        question: 'Any special requests (colour, branding, security grade, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'garage-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'garage_door_job_type',
        question: 'What type of garage door work do you need?',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_install', label: 'New garage door installation' },
          { value: 'replacement', label: 'Replacement of existing door' },
          { value: 'repair_service', label: 'Repair or service of existing door' }
        ]
      },
      {
        id: 'garage_door_style',
        question: 'What style of garage door are you considering?',
        type: 'radio',
        required: false,
        options: [
          { value: 'up_and_over', label: 'Up-and-over' },
          { value: 'sectional', label: 'Sectional' },
          { value: 'roller', label: 'Roller door' },
          { value: 'side_hinged', label: 'Side-hinged doors' },
          { value: 'not_sure', label: 'Not sure – need advice' }
        ]
      },
      {
        id: 'garage_door_automation',
        question: 'Do you want the garage door to be automated?',
        type: 'radio',
        required: true,
        options: [
          { value: 'manual', label: 'Manual operation' },
          { value: 'automated_new', label: 'New electric motor / automatic' },
          { value: 'upgrade_existing_motor', label: 'Upgrade or replace existing motor' }
        ]
      },
      {
        id: 'garage_opening_size',
        question: 'What best describes the garage size?',
        type: 'radio',
        required: false,
        options: [
          { value: 'single_bay', label: 'Single-bay garage' },
          { value: 'double_bay', label: 'Double-bay garage' },
          { value: 'multi_bay', label: 'Multi-bay / larger opening' },
          { value: 'not_sure', label: 'Not sure, needs measuring' }
        ]
      },
      {
        id: 'garage_security_insulation',
        question: 'What are your priorities for the new or repaired door?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'basic_security', label: 'Basic security' },
          { value: 'high_security', label: 'High security / anti-break-in' },
          { value: 'insulated', label: 'Good insulation / temperature control' },
          { value: 'quiet_operation', label: 'Quiet operation' }
        ]
      },
      {
        id: 'garage_existing_condition',
        question: 'What is the condition of the existing frame and opening?',
        type: 'radio',
        required: false,
        options: [
          { value: 'good_condition', label: 'Good, no visible damage' },
          { value: 'minor_repair', label: 'Minor repairs needed to frame / walls' },
          { value: 'major_repair', label: 'Significant cracks / movement' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'garage_door_notes',
        question: 'Any special requirements (remote controls, keypad, integration with gate, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'patio-balcony-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'patio_door_project_type',
        question: 'What kind of patio or balcony door project is this?',
        type: 'radio',
        required: true,
        options: [
          { value: 'replace_existing', label: 'Replace existing door set' },
          { value: 'upgrade_single_to_double', label: 'Upgrade single door to wider opening' },
          { value: 'new_opening', label: 'Create a new opening for patio doors' }
        ]
      },
      {
        id: 'patio_door_style',
        question: 'Which style are you leaning towards?',
        type: 'radio',
        required: false,
        options: [
          { value: 'french_doors', label: 'French doors' },
          { value: 'sliding_doors', label: 'Sliding doors' },
          { value: 'tilt_and_slide', label: 'Tilt-and-slide' },
          { value: 'single_with_side_light', label: 'Single door with side light' },
          { value: 'no_preference', label: 'No preference yet' }
        ]
      },
      {
        id: 'patio_door_balcony_level',
        question: 'Where are the doors located?',
        type: 'radio',
        required: true,
        options: [
          { value: 'ground_floor', label: 'Ground floor / garden' },
          { value: 'upper_floor_balcony', label: 'Upper-floor balcony' },
          { value: 'roof_terrace', label: 'Roof terrace access' }
        ]
      },
      {
        id: 'patio_door_material',
        question: 'Preferred material for patio or balcony doors?',
        type: 'radio',
        required: false,
        options: [
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'timber', label: 'Timber / wood' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'mixed', label: 'Mixed system' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'patio_door_glazing',
        question: 'What glazing and performance features are important?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'double_glazing', label: 'Double glazing' },
          { value: 'triple_glazing', label: 'Triple glazing' },
          { value: 'solar_control', label: 'Solar control / UV reduction' },
          { value: 'safety_glass', label: 'Safety / laminated glass' }
        ]
      },
      {
        id: 'patio_door_threshold',
        question: 'Do you need a low or flush threshold at the door?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_step', label: 'Standard step is fine' },
          { value: 'low_threshold', label: 'Low threshold for easier access' },
          { value: 'fully_flush', label: 'Fully flush / wheelchair-friendly if possible' }
        ]
      },
      {
        id: 'patio_door_existing_condition',
        question: 'What is the condition of the current door and surrounding area?',
        type: 'radio',
        required: false,
        options: [
          { value: 'works_but_tired', label: 'Works but looks tired' },
          { value: 'drafts_or_leaks', label: 'Drafts, water leaks or sticking' },
          { value: 'damaged_or_rotten', label: 'Damaged / rotten frames' },
          { value: 'empty_opening', label: 'Just an opening, no door currently' }
        ]
      },
      {
        id: 'patio_door_notes',
        question: 'Any special considerations (child safety, pets, insect screens, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'security-reinforced-doors',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'sec_door_location',
        question: 'Where will the security or reinforced door be installed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'main_entrance', label: 'Main entrance' },
          { value: 'secondary_entrance', label: 'Secondary / side entrance' },
          { value: 'apartment_entrance', label: 'Apartment entrance door' },
          { value: 'internal_secure_room', label: 'Internal secure room / storage' }
        ]
      },
      {
        id: 'sec_door_purpose',
        question: 'What is the main purpose of the reinforced door?',
        type: 'radio',
        required: true,
        options: [
          { value: 'burglary_protection', label: 'Burglary protection' },
          { value: 'safe_room', label: 'Safe room / panic room' },
          { value: 'high_value_storage', label: 'High-value storage area' },
          { value: 'noise_and_security', label: 'Noise reduction as well as security' }
        ]
      },
      {
        id: 'sec_door_certification',
        question: 'Do you require a specific security rating or certification?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_security', label: 'No, just strong and secure' },
          { value: 'rated_security', label: 'Yes, rated security door (e.g. RC / certified)' },
          { value: 'not_sure', label: 'Not sure, need guidance' }
        ]
      },
      {
        id: 'sec_door_appearance',
        question: 'What kind of appearance should the door have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'discreet_normal', label: 'Discreet, looks like a normal door' },
          { value: 'clearly_reinforced', label: 'Clearly reinforced / robust look' },
          { value: 'decorative', label: 'Decorative and secure' }
        ]
      },
      {
        id: 'sec_door_access_control',
        question: 'How should the door be accessed or controlled?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'traditional_keys', label: 'Traditional key lock' },
          { value: 'high_security_cylinder', label: 'High-security cylinder' },
          { value: 'digital_keypad', label: 'Digital keypad / code' },
          { value: 'biometric', label: 'Biometric (fingerprint etc.)' },
          { value: 'intercom_video', label: 'Intercom / video entry integration' }
        ]
      },
      {
        id: 'sec_door_existing_opening',
        question: 'Is there an existing door and frame in place?',
        type: 'radio',
        required: true,
        options: [
          { value: 'replace_existing', label: 'Yes, replace existing door and frame' },
          { value: 'new_opening', label: 'No, this is a new opening' },
          { value: 'frame_only', label: 'Frame exists but no suitable door' }
        ]
      },
      {
        id: 'sec_door_notes',
        question: 'Any other important details (insurance requirements, alarm integration, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'floor-sanding-refinishing',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'floor_type',
        question: 'What type of floor needs sanding or refinishing?',
        type: 'radio',
        required: true,
        options: [
          { value: 'solid_wood', label: 'Solid wood flooring' },
          { value: 'engineered_wood', label: 'Engineered wood' },
          { value: 'parquet', label: 'Parquet' },
          { value: 'stairs', label: 'Stairs' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'floor_area_size',
        question: 'Approximately what is the total floor area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_10', label: 'Up to 10 m²' },
          { value: 'medium_10_25', label: '10–25 m²' },
          { value: 'large_25_50', label: '25–50 m²' },
          { value: 'very_large_50_plus', label: 'More than 50 m²' }
        ]
      },
      {
        id: 'floor_condition',
        question: 'What condition is the floor currently in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'light_wear', label: 'Light wear and scratches' },
          { value: 'deep_scratches', label: 'Deep scratches or dents' },
          { value: 'uneven', label: 'Uneven or damaged areas' },
          { value: 'paint_or_varnish_layers', label: 'Multiple layers of varnish/paint' }
        ]
      },
      {
        id: 'refinish_preference',
        question: 'What type of finish do you prefer after sanding?',
        type: 'radio',
        required: false,
        options: [
          { value: 'matt_lacquer', label: 'Matt lacquer' },
          { value: 'satin_lacquer', label: 'Satin lacquer' },
          { value: 'gloss_lacquer', label: 'Gloss lacquer' },
          { value: 'oil_finish', label: 'Oil finish' },
          { value: 'not_sure', label: 'Not sure – need guidance' }
        ]
      },
      {
        id: 'repair_requirements',
        question: 'Are any repairs needed before sanding?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'loose_boards', label: 'Loose or squeaky boards' },
          { value: 'damaged_sections', label: 'Damaged sections requiring replacement' },
          { value: 'gap_filling', label: 'Gap filling' },
          { value: 'none', label: 'No repairs needed' }
        ]
      },
      {
        id: 'floor_obstacles',
        question: 'Will the floor area be clear and ready for work?',
        type: 'radio',
        required: false,
        options: [
          { value: 'empty_room', label: 'Yes, the room will be empty' },
          { value: 'some_furniture', label: 'Some furniture needs moving' },
          { value: 'full_room', label: 'Room is full of furniture' }
        ]
      },
      {
        id: 'floor_sanding_notes',
        question: 'Any special details (pets, allergies, colour matching, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'laminate-engineered-wood',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'laminate_floor_type',
        question: 'What type of flooring do you want installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'laminate', label: 'Laminate flooring' },
          { value: 'engineered_wood', label: 'Engineered wood flooring' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'laminate_area_size',
        question: 'What is the approximate floor area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_15', label: 'Up to 15 m²' },
          { value: '15_to_30', label: '15–30 m²' },
          { value: '30_to_60', label: '30–60 m²' },
          { value: '60_plus', label: 'More than 60 m²' }
        ]
      },
      {
        id: 'subfloor_type',
        question: 'What type of subfloor do you have?',
        type: 'radio',
        required: false,
        options: [
          { value: 'concrete', label: 'Concrete' },
          { value: 'tile', label: 'Tiles' },
          { value: 'wood_floor', label: 'Wooden floor' },
          { value: 'mixed_or_unknown', label: 'Mixed or not sure' }
        ]
      },
      {
        id: 'subfloor_condition',
        question: 'What is the condition of the existing subfloor?',
        type: 'radio',
        required: false,
        options: [
          { value: 'smooth_level', label: 'Smooth and level' },
          { value: 'minor_uneven', label: 'Minor uneven sections' },
          { value: 'needs_levelling', label: 'Needs levelling compound' }
        ]
      },
      {
        id: 'underlay_requirements',
        question: 'Do you require underlay or insulation?',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_underlay', label: 'Standard underlay' },
          { value: 'acoustic_underlay', label: 'Acoustic / sound insulation' },
          { value: 'thermal_underlay', label: 'Thermal insulation' },
          { value: 'not_sure', label: 'Not sure – need guidance' }
        ]
      },
      {
        id: 'finishing_details',
        question: 'Do you need additional finishing work?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'skirting', label: 'New skirting boards' },
          { value: 'beading', label: 'Beading (if keeping existing skirting)' },
          { value: 'door_trimming', label: 'Trim doors to fit new floor height' },
          { value: 'thresholds', label: 'Threshold strips' }
        ]
      },
      {
        id: 'laminate_notes',
        question: 'Any special requests (herringbone pattern, pet-resistant, water-resistant)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'new-flooring-installation',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'new_floor_type',
        question: 'What type of new flooring do you want installed?',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'laminate', label: 'Laminate' },
          { value: 'engineered_wood', label: 'Engineered wood' },
          { value: 'solid_wood', label: 'Solid wood' },
          { value: 'tiles', label: 'Tiles' },
          { value: 'vinyl_lvt', label: 'Vinyl / LVT' },
          { value: 'carpet', label: 'Carpet' }
        ]
      },
      {
        id: 'new_floor_area',
        question: 'What is the approximate size of the floor area?',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_10_15', label: '10–15 m²' },
          { value: 'medium_15_30', label: '15–30 m²' },
          { value: 'large_30_60', label: '30–60 m²' },
          { value: 'very_large_60_plus', label: 'More than 60 m²' }
        ]
      },
      {
        id: 'old_floor_removal',
        question: 'Do you need the old flooring removed?',
        type: 'radio',
        required: false,
        options: [
          { value: 'remove_existing', label: 'Yes, remove the existing floor' },
          { value: 'install_on_top', label: 'No, install on top if possible' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'new_floor_subfloor_condition',
        question: 'What is the condition of the subfloor?',
        type: 'radio',
        required: false,
        options: [
          { value: 'smooth', label: 'Smooth and level' },
          { value: 'minor_issues', label: 'Minor cracks or uneven areas' },
          { value: 'needs_levelling', label: 'Needs levelling compound' }
        ]
      },
      {
        id: 'new_floor_additional_work',
        question: 'Do you require any additional work?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'skirting', label: 'Install new skirting' },
          { value: 'door_trimming', label: 'Trim door heights' },
          { value: 'insulation_layers', label: 'Add acoustic/thermal layers' }
        ]
      },
      {
        id: 'new_floor_special_features',
        question: 'Any special installation preferences?',
        type: 'radio',
        required: false,
        options: [
          { value: 'herringbone', label: 'Herringbone pattern' },
          { value: 'straight_plank', label: 'Straight plank layout' },
          { value: 'tile_pattern', label: 'Tile pattern' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'new_floor_notes',
        question: 'Any details about pets, spill areas, underfloor heating, etc.?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'solid-wood-flooring',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'solid_wood_species',
        question: 'What type of solid wood flooring are you considering?',
        type: 'radio',
        required: false,
        options: [
          { value: 'oak', label: 'Oak' },
          { value: 'walnut', label: 'Walnut' },
          { value: 'pine', label: 'Pine / softwood' },
          { value: 'exotic', label: 'Exotic hardwoods' },
          { value: 'undecided', label: 'Undecided' }
        ]
      },
      {
        id: 'solid_wood_area',
        question: 'Approximate total area for installation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'under_20', label: 'Under 20 m²' },
          { value: '20_40', label: '20–40 m²' },
          { value: '40_70', label: '40–70 m²' },
          { value: '70_plus', label: 'More than 70 m²' }
        ]
      },
      {
        id: 'solid_wood_subfloor',
        question: 'What type of subfloor will the wood be installed on?',
        type: 'radio',
        required: false,
        options: [
          { value: 'concrete', label: 'Concrete' },
          { value: 'timber_joists', label: 'Timber joists' },
          { value: 'existing_wood', label: 'Existing wooden floor' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'solid_wood_laying_method',
        question: 'Preferred installation method?',
        type: 'radio',
        required: false,
        options: [
          { value: 'glue_down', label: 'Glue-down' },
          { value: 'nail_down', label: 'Nail-down' },
          { value: 'float', label: 'Floating installation' },
          { value: 'not_sure', label: 'Need advice' }
        ]
      },
      {
        id: 'solid_wood_pattern',
        question: 'What installation pattern do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'straight_plank', label: 'Straight plank' },
          { value: 'herringbone', label: 'Herringbone' },
          { value: 'chevron', label: 'Chevron' },
          { value: 'random_length', label: 'Random-length boards' }
        ]
      },
      {
        id: 'solid_wood_finish',
        question: 'What surface finish would you like?',
        type: 'radio',
        required: false,
        options: [
          { value: 'matt', label: 'Matt' },
          { value: 'satin', label: 'Satin' },
          { value: 'gloss', label: 'Gloss' },
          { value: 'raw_look', label: 'Raw/unfinished look' }
        ]
      },
      {
        id: 'solid_wood_notes',
        question: 'Any important details (pets, humidity issues, floor ventilation)?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'tile-stone-flooring',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'tile_type',
        question: 'What type of tiles or stone flooring do you want installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'porcelain', label: 'Porcelain tiles' },
          { value: 'ceramic', label: 'Ceramic tiles' },
          { value: 'natural_stone', label: 'Natural stone (travertine, marble, etc.)' },
          { value: 'terrazzo', label: 'Terrazzo' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'tile_area_size',
        question: 'What is the approximate area to be tiled?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_10', label: 'Up to 10 m²' },
          { value: '10_to_25', label: '10–25 m²' },
          { value: '25_to_50', label: '25–50 m²' },
          { value: '50_plus', label: 'More than 50 m²' }
        ]
      },
      {
        id: 'tile_subfloor_condition',
        question: 'What is the condition of the existing floor/subfloor?',
        type: 'radio',
        required: false,
        options: [
          { value: 'smooth_level', label: 'Smooth and level' },
          { value: 'minor_cracks', label: 'Minor cracks or imperfections' },
          { value: 'needs_levelling', label: 'Needs levelling compound' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'tile_layout',
        question: 'Do you have a preferred tile layout?',
        type: 'radio',
        required: false,
        options: [
          { value: 'straight', label: 'Straight grid' },
          { value: 'brick_bond', label: 'Brick bond' },
          { value: 'diagonal', label: 'Diagonal' },
          { value: 'herringbone', label: 'Herringbone' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'tile_features_needed',
        question: 'Do you require any additional features?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'skirting', label: 'Tile skirting' },
          { value: 'steps', label: 'Tile stair steps' },
          { value: 'wetroom_system', label: 'Wetroom waterproofing' },
          { value: 'underfloor_heating', label: 'Underfloor heating system' }
        ]
      },
      {
        id: 'tile_surface_challenges',
        question: 'Are there any installation challenges?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'many_cuts', label: 'Many cuts / complicated shapes' },
          { value: 'multiple_room_transitions', label: 'Multiple rooms with transitions' },
          { value: 'uneven_rooms', label: 'Uneven room shapes' },
          { value: 'none', label: 'No major challenges' }
        ]
      },
      {
        id: 'tile_notes',
        question: 'Any special grout colour, tile pattern or sealing requirements?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    microSlug: 'vinyl-lvt-flooring',
    categorySlug: 'floors-doors-windows',
    version: 1,
    questions: [
      {
        id: 'vinyl_lvt_type',
        question: 'What type of vinyl/LVT flooring do you want?',
        type: 'radio',
        required: true,
        options: [
          { value: 'click_fit', label: 'Click-fit LVT' },
          { value: 'glue_down', label: 'Glue-down LVT' },
          { value: 'sheet_vinyl', label: 'Sheet vinyl' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'vinyl_lvt_area_size',
        question: 'What is the approximate area to be installed?',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_15', label: 'Up to 15 m²' },
          { value: '15_to_30', label: '15–30 m²' },
          { value: '30_to_60', label: '30–60 m²' },
          { value: '60_plus', label: 'More than 60 m²' }
        ]
      },
      {
        id: 'vinyl_subfloor_condition',
        question: 'What is the condition of the existing subfloor?',
        type: 'radio',
        required: false,
        options: [
          { value: 'smooth', label: 'Smooth and level' },
          { value: 'minor_issues', label: 'Minor imperfections' },
          { value: 'needs_screed', label: 'Needs screed / levelling' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'vinyl_finish_preference',
        question: 'What style or finish do you prefer?',
        type: 'radio',
        required: false,
        options: [
          { value: 'wood_effect', label: 'Wood effect' },
          { value: 'stone_effect', label: 'Stone effect' },
          { value: 'patterned', label: 'Patterned / decorative' },
          { value: 'solid_colour', label: 'Solid colour' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'vinyl_extra_requirements',
        question: 'Do you require any additional options?',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'waterproof', label: 'Fully waterproof system' },
          { value: 'anti_slip', label: 'Anti-slip finish' },
          { value: 'acoustic_underlay', label: 'Acoustic underlay' },
          { value: 'skirting_beading', label: 'Skirting/beading installation' }
        ]
      },
      {
        id: 'vinyl_notes',
        question: 'Any important details (pets, heavy use, floor temperature, etc.)?',
        type: 'text',
        required: false
      }
    ]
  },

  // Internal Doors - Floors, Doors & Windows
  {
    microSlug: 'door-frames-linings',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'internal.doors',
    version: 1,
    questions: [
      {
        id: 'frames_job_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_frames', label: 'Install new frames and linings' },
          { value: 'replace_existing', label: 'Replace existing frames and linings' },
          { value: 'repair_existing', label: 'Repair or straighten existing frames' }
        ]
      },
      {
        id: 'frames_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 openings' },
          { value: 'three_five', label: '3–5 openings' },
          { value: 'six_ten', label: '6–10 openings' },
          { value: 'ten_plus', label: 'More than 10 openings' }
        ]
      },
      {
        id: 'wall_type',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_masonry', label: 'Solid masonry wall' },
          { value: 'stud_partition', label: 'Stud / partition wall' },
          { value: 'mixed', label: 'Mix of both' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'frames_condition',
        type: 'radio',
        required: false,
        options: [
          { value: 'square_and_sound', label: 'Square and sound, minor wear' },
          { value: 'slightly_out_of_square', label: 'Slightly out of square / sticking doors' },
          { value: 'damaged_or_rotten', label: 'Damaged or rotten parts' },
          { value: 'new_openings', label: 'Newly created openings' }
        ]
      },
      {
        id: 'frames_profile_style',
        type: 'radio',
        required: false,
        options: [
          { value: 'simple_modern', label: 'Simple, modern square edge' },
          { value: 'traditional_profile', label: 'Traditional / decorative profile' },
          { value: 'match_existing', label: 'Match existing in the property' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'frames_material',
        type: 'radio',
        required: false,
        options: [
          { value: 'softwood_primed', label: 'Softwood, primed for painting' },
          { value: 'hardwood', label: 'Hardwood for staining/varnish' },
          { value: 'mdf', label: 'MDF (painted finish only)' },
          { value: 'match_existing', label: 'Match existing material' }
        ]
      },
      {
        id: 'frames_additional_work',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'making_opening_bigger', label: 'Make the opening larger' },
          { value: 'making_opening_smaller', label: 'Make the opening smaller' },
          { value: 'plaster_touchups', label: 'Plastering/touch-ups around frames' },
          { value: 'none', label: 'No additional work' }
        ]
      },
      {
        id: 'frames_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'door-hardware-locks',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'internal.doors',
    version: 1,
    questions: [
      {
        id: 'hardware_scope',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new_handles', label: 'Install new handles' },
          { value: 'new_latches_locks', label: 'Install new latches/locks' },
          { value: 'replace_cylinders', label: 'Replace lock cylinders' },
          { value: 'adjust_existing', label: 'Adjust/repair existing hardware' }
        ]
      },
      {
        id: 'hardware_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 doors' },
          { value: 'three_five', label: '3–5 doors' },
          { value: 'six_ten', label: '6–10 doors' },
          { value: 'ten_plus', label: 'More than 10 doors' }
        ]
      },
      {
        id: 'hardware_security_level',
        type: 'radio',
        required: false,
        options: [
          { value: 'internal_low_security', label: 'Standard internal privacy only' },
          { value: 'bed_bath_privacy', label: 'Bathroom/bedroom privacy locks' },
          { value: 'high_security_internal', label: 'Higher security (office/storage)' }
        ]
      },
      {
        id: 'hardware_supplied',
        type: 'radio',
        required: true,
        options: [
          { value: 'client_supplies', label: 'I will supply all hardware' },
          { value: 'pro_supplies', label: 'I\'d like the professional to supply and fit' },
          { value: 'mixed', label: 'Mix of both (some items already bought)' }
        ]
      },
      {
        id: 'hardware_finish',
        type: 'radio',
        required: false,
        options: [
          { value: 'brushed_nickel', label: 'Brushed nickel / stainless' },
          { value: 'chrome', label: 'Chrome (shiny)' },
          { value: 'black', label: 'Black' },
          { value: 'brass_bronze', label: 'Brass/bronze' },
          { value: 'match_existing', label: 'Match existing hardware' }
        ]
      },
      {
        id: 'hardware_issues',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'sticking', label: 'Handles/locks sticking' },
          { value: 'not_latching', label: 'Doors not latching properly' },
          { value: 'keys_not_turning', label: 'Keys difficult to turn' },
          { value: 'loose_handles', label: 'Loose or wobbly handles' },
          { value: 'none', label: 'No problems, just upgrading' }
        ]
      },
      {
        id: 'hardware_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'internal-door-fitting',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'internal.doors',
    version: 1,
    questions: [
      {
        id: 'door_fitting_scope',
        type: 'radio',
        required: true,
        options: [
          { value: 'hang_new_doors', label: 'Hang new doors in existing frames' },
          { value: 'fit_pre_assembled_sets', label: 'Fit pre-assembled door sets' },
          { value: 'fit_blank_doors', label: 'Fit and cut plain/blank doors' }
        ]
      },
      {
        id: 'door_fitting_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 doors' },
          { value: 'three_five', label: '3–5 doors' },
          { value: 'six_ten', label: '6–10 doors' },
          { value: 'ten_plus', label: 'More than 10 doors' }
        ]
      },
      {
        id: 'door_fitting_sizes',
        type: 'radio',
        required: false,
        options: [
          { value: 'standard_sizes', label: 'Standard sizes throughout' },
          { value: 'mix_of_sizes', label: 'Mix of sizes' },
          { value: 'not_measured', label: 'Not measured yet' }
        ]
      },
      {
        id: 'door_fitting_material',
        type: 'radio',
        required: false,
        options: [
          { value: 'hollow_core', label: 'Hollow-core/lightweight' },
          { value: 'semi_solid', label: 'Semi-solid' },
          { value: 'solid_wood', label: 'Solid wood' },
          { value: 'glazed_doors', label: 'Glazed doors (with glass)' }
        ]
      },
      {
        id: 'door_fitting_prep',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'trim_height', label: 'Trim door height' },
          { value: 'trim_width', label: 'Trim door width' },
          { value: 'hinge_positions', label: 'Cut new hinge positions' },
          { value: 'latch_handles', label: 'Drill for latch and handles' }
        ]
      },
      {
        id: 'door_fitting_hardware',
        type: 'radio',
        required: true,
        options: [
          { value: 'reuse_existing', label: 'Reuse existing hinges and handles' },
          { value: 'client_supplies_new', label: 'I will supply all new hardware' },
          { value: 'pro_supply_fit', label: 'I\'d like the professional to supply and fit hardware' }
        ]
      },
      {
        id: 'door_fitting_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'internal-door-replacement',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'internal.doors',
    version: 1,
    questions: [
      {
        id: 'door_replacement_scope',
        type: 'radio',
        required: true,
        options: [
          { value: 'replace_leaf_only', label: 'Replace door leaf only, keep frames' },
          { value: 'replace_doors_and_frames', label: 'Replace doors and frames' },
          { value: 'mixed', label: 'Mix – some leaf only, some full replacement' }
        ]
      },
      {
        id: 'door_replacement_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 doors' },
          { value: 'three_five', label: '3–5 doors' },
          { value: 'six_ten', label: '6–10 doors' },
          { value: 'ten_plus', label: 'More than 10 doors' }
        ]
      },
      {
        id: 'door_replacement_reasons',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'outdated_style', label: 'Outdated style' },
          { value: 'damage_or_wear', label: 'Damaged or warped doors' },
          { value: 'poor_fit', label: 'Poor fit / draughts / noise' },
          { value: 'upgrade_fire_or_sound', label: 'Upgrade to fire/sound-rated doors' }
        ]
      },
      {
        id: 'door_replacement_style',
        type: 'radio',
        required: false,
        options: [
          { value: 'modern_flush', label: 'Modern flush doors' },
          { value: 'panelled_traditional', label: 'Panelled/traditional doors' },
          { value: 'cottage_rustic', label: 'Cottage/rustic style' },
          { value: 'glazed_for_light', label: 'Glazed doors to bring in light' }
        ]
      },
      {
        id: 'door_replacement_special_types',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'fire_doors', label: 'Fire-rated doors' },
          { value: 'acoustic_doors', label: 'Acoustic/sound reduction doors' },
          { value: 'bathroom_privacy', label: 'Bathroom privacy doors' },
          { value: 'extra_tall_or_wide', label: 'Extra tall or wide doors' }
        ]
      },
      {
        id: 'door_replacement_paint_finish',
        type: 'radio',
        required: false,
        options: [
          { value: 'pre_finished', label: 'Pre-finished from manufacturer' },
          { value: 'primed_only', label: 'Primed only, ready for painting' },
          { value: 'to_be_stained', label: 'To be stained/varnished' },
          { value: 'need_painting_service', label: 'Need painting/staining included' }
        ]
      },
      {
        id: 'door_replacement_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'sliding-pocket-doors',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'internal.doors',
    version: 1,
    questions: [
      {
        id: 'sliding_door_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'surface_sliding', label: 'Surface-mounted sliding door' },
          { value: 'single_pocket', label: 'Single pocket door (into wall)' },
          { value: 'double_pocket', label: 'Double pocket doors' },
          { value: 'room_divider', label: 'Sliding room divider' }
        ]
      },
      {
        id: 'sliding_door_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one', label: '1 door set' },
          { value: 'two_three', label: '2–3 door sets' },
          { value: 'four_plus', label: '4 or more door sets' }
        ]
      },
      {
        id: 'sliding_wall_type',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_wall', label: 'Solid masonry wall' },
          { value: 'stud_wall', label: 'Stud/partition wall' },
          { value: 'new_partition', label: 'New partition wall to be built' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'sliding_door_purpose',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'save_space', label: 'Save space in a small room' },
          { value: 'open_plan_flex', label: 'Flexible open-plan layout' },
          { value: 'separate_zones', label: 'Separate living or work zones' },
          { value: 'hide_utility_area', label: 'Conceal utility/storage areas' }
        ]
      },
      {
        id: 'sliding_door_finish',
        type: 'radio',
        required: false,
        options: [
          { value: 'solid_plain', label: 'Solid plain door' },
          { value: 'panelled', label: 'Panelled door' },
          { value: 'glass', label: 'Glass or part-glazed door' },
          { value: 'frameless_glass', label: 'Frameless glass system' }
        ]
      },
      {
        id: 'sliding_kit_status',
        type: 'radio',
        required: true,
        options: [
          { value: 'kit_supplied_by_client', label: 'Yes, I have the full kit' },
          { value: 'door_only_no_kit', label: 'I have doors but no sliding kit' },
          { value: 'need_supply_and_fit', label: 'I\'d like the professional to supply and fit the full system' }
        ]
      },
      {
        id: 'sliding_access_constraints',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'electrics_in_wall', label: 'Switches/sockets in the wall area' },
          { value: 'plumbing_in_wall', label: 'Plumbing/pipes in the wall' },
          { value: 'limited_ceiling_height', label: 'Limited ceiling height above opening' },
          { value: 'structural_beams', label: 'Structural beams or obstacles' },
          { value: 'none_known', label: 'No known constraints' }
        ]
      },
      {
        id: 'sliding_notes',
        type: 'textarea',
        required: false
      }
    ]
  },

  // Windows - Floors, Doors & Windows
  {
    microSlug: 'double-glazing-upgrades',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'windows',
    version: 1,
    questions: [
      {
        id: 'dg_upgrade_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'replace_units', label: 'Replace existing glass units only' },
          { value: 'replace_windows_full', label: 'Replace full window frames and glass' },
          { value: 'upgrade_to_triple', label: 'Upgrade to triple glazing' },
          { value: 'add_secondary_glazing', label: 'Add secondary glazing' }
        ]
      },
      {
        id: 'dg_property_area',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'living_areas', label: 'Living / dining areas' },
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'bathrooms', label: 'Bathrooms' },
          { value: 'whole_property', label: 'Whole property' }
        ]
      },
      {
        id: 'dg_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 windows' },
          { value: 'three_five', label: '3–5 windows' },
          { value: 'six_ten', label: '6–10 windows' },
          { value: 'ten_plus', label: 'More than 10' }
        ]
      },
      {
        id: 'dg_frame_material',
        type: 'radio',
        required: false,
        options: [
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'timber', label: 'Timber' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'mixed', label: 'Mixed / different materials' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'dg_issues',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'condensation_inside', label: 'Condensation between the panes' },
          { value: 'drafts', label: 'Cold drafts' },
          { value: 'noise', label: 'Road or neighbour noise' },
          { value: 'broken_seals', label: 'Broken or failed seals' },
          { value: 'none', label: 'No issues, upgrading performance only' }
        ]
      },
      {
        id: 'dg_preference',
        type: 'radio',
        required: false,
        options: [
          { value: 'thermal_efficiency', label: 'Thermal efficiency' },
          { value: 'sound_reduction', label: 'Noise reduction' },
          { value: 'security', label: 'Improved security' },
          { value: 'cost_effective', label: 'Cost-effective solution' }
        ]
      },
      {
        id: 'dg_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'roof-windows-skylights',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'windows',
    version: 1,
    questions: [
      {
        id: 'rw_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_installation', label: 'New installation (create new opening)' },
          { value: 'replacement', label: 'Replacement of existing roof windows' },
          { value: 'upgrade_size', label: 'Enlarge or change size of opening' },
          { value: 'repair', label: 'Repair leaks or hardware' }
        ]
      },
      {
        id: 'rw_location',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'loft_room', label: 'Loft/attic room' },
          { value: 'hallway_stairwell', label: 'Hallway or stairwell' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'living_area', label: 'Living or kitchen area' },
          { value: 'flat_roof', label: 'Flat roof extension' }
        ]
      },
      {
        id: 'rw_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one', label: '1 window' },
          { value: 'two_three', label: '2–3 windows' },
          { value: 'four_plus', label: '4 or more' }
        ]
      },
      {
        id: 'rw_style',
        type: 'radio',
        required: false,
        options: [
          { value: 'centre_pivot', label: 'Centre-pivot roof window' },
          { value: 'top_hung', label: 'Top-hung roof window' },
          { value: 'flat_roof_light', label: 'Flat rooflight' },
          { value: 'sun_tunnel', label: 'Sun tunnel' },
          { value: 'not_sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'rw_access_requirements',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'ventilation', label: 'Ventilation function' },
          { value: 'electric_opening', label: 'Electric opening/remote' },
          { value: 'solar_control_glass', label: 'Solar control glass' },
          { value: 'blackout_blinds', label: 'Blackout blinds' },
          { value: 'integrated_blinds', label: 'Integrated blinds' }
        ]
      },
      {
        id: 'rw_roof_type',
        type: 'radio',
        required: false,
        options: [
          { value: 'pitched_tiled', label: 'Pitched tiled roof' },
          { value: 'pitched_shingle', label: 'Pitched shingle roof' },
          { value: 'flat_roof', label: 'Flat roof' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'rw_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'shutters-blinds-screens',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'windows',
    version: 1,
    questions: [
      {
        id: 'sbs_type',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'interior_blinds', label: 'Interior blinds' },
          { value: 'roller_blinds', label: 'Roller blinds' },
          { value: 'venetian_blinds', label: 'Venetian blinds' },
          { value: 'blackout_blinds', label: 'Blackout blinds' },
          { value: 'insect_screens', label: 'Insect screens' },
          { value: 'exterior_shutters', label: 'Exterior shutters' }
        ]
      },
      {
        id: 'sbs_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 openings' },
          { value: 'three_five', label: '3–5 openings' },
          { value: 'six_ten', label: '6–10 openings' },
          { value: 'ten_plus', label: 'More than 10' }
        ]
      },
      {
        id: 'sbs_control_type',
        type: 'radio',
        required: false,
        options: [
          { value: 'manual', label: 'Manual operation' },
          { value: 'motorised', label: 'Motorised / remote control' },
          { value: 'smart_control', label: 'Smart home integration' }
        ]
      },
      {
        id: 'sbs_mount_type',
        type: 'radio',
        required: false,
        options: [
          { value: 'inside_recess', label: 'Inside the window recess' },
          { value: 'outside_recess', label: 'Outside the recess' },
          { value: 'surface_mount', label: 'Surface-mounted on the frame' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'sbs_environment',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'living_spaces', label: 'Living spaces' },
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'bathrooms', label: 'Bathrooms (moisture-resistant)' },
          { value: 'kitchen', label: 'Kitchen' },
          { value: 'balcony_terrace', label: 'Balcony/terrace access' }
        ]
      },
      {
        id: 'sbs_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'window-installation-replacement',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'windows',
    version: 1,
    questions: [
      {
        id: 'win_project_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_install', label: 'New installation (create opening)' },
          { value: 'replace_existing', label: 'Replace existing windows' },
          { value: 'enlarge_opening', label: 'Enlarge the current opening' }
        ]
      },
      {
        id: 'win_material',
        type: 'radio',
        required: false,
        options: [
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'timber', label: 'Timber' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'mixed', label: 'Mixed system' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'win_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one_two', label: '1–2 windows' },
          { value: 'three_five', label: '3–5 windows' },
          { value: 'six_ten', label: '6–10 windows' },
          { value: 'ten_plus', label: 'More than 10' }
        ]
      },
      {
        id: 'win_opening_style',
        type: 'radio',
        required: false,
        options: [
          { value: 'top_hung', label: 'Top-hung' },
          { value: 'side_hung', label: 'Side-hung / casement' },
          { value: 'tilt_turn', label: 'Tilt-and-turn' },
          { value: 'sliding', label: 'Sliding' },
          { value: 'fixed', label: 'Fixed/picture window' }
        ]
      },
      {
        id: 'win_glazing',
        type: 'radio',
        required: false,
        options: [
          { value: 'double_glazing', label: 'Double glazing' },
          { value: 'triple_glazing', label: 'Triple glazing' },
          { value: 'solar_control', label: 'Solar control glass' },
          { value: 'safety_glass', label: 'Safety/laminated glass' }
        ]
      },
      {
        id: 'win_surrounds',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'interior_plastering', label: 'Interior plastering/finishing' },
          { value: 'exterior_render', label: 'Exterior render adjustments' },
          { value: 'cills_sills', label: 'Replace/install window cills' },
          { value: 'none', label: 'No extra finishing needed' }
        ]
      },
      {
        id: 'win_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'window-repairs-adjustments',
    categorySlug: 'floors-doors-windows',
    subcategorySlug: 'windows',
    version: 1,
    questions: [
      {
        id: 'win_repair_type',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'sticking_or_jamming', label: 'Window sticking or jamming' },
          { value: 'handle_lock_issue', label: 'Handle or lock not working' },
          { value: 'hinge_issue', label: 'Hinge or mechanism issue' },
          { value: 'seal_failure', label: 'Condensation between panes (seal failure)' },
          { value: 'drafts', label: 'Cold drafts or poor sealing' },
          { value: 'broken_glass', label: 'Broken/cracked glass' }
        ]
      },
      {
        id: 'win_frame_material',
        type: 'radio',
        required: false,
        options: [
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'timber', label: 'Timber' },
          { value: 'upvc', label: 'uPVC' },
          { value: 'mixed', label: 'Mixed materials' },
          { value: 'not_sure', label: 'Not sure' }
        ]
      },
      {
        id: 'win_repair_quantity',
        type: 'radio',
        required: true,
        options: [
          { value: 'one', label: '1 window' },
          { value: 'two_three', label: '2–3 windows' },
          { value: 'four_plus', label: '4 or more windows' }
        ]
      },
      {
        id: 'win_access',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy_access', label: 'Easy access (ground floor)' },
          { value: 'ladder_required', label: 'Requires ladder (1st–2nd floor)' },
          { value: 'scaffolding_likely', label: 'High access (may need scaffolding)' }
        ]
      },
      {
        id: 'win_notes',
        type: 'textarea',
        required: false
      }
    ]
  },

  // Gardening & Landscaping - Design
  {
    microSlug: 'garden-redesign-landscaping',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'design',
    version: 1,
    questions: [
      {
        id: 'garden_current_state',
        type: 'radio',
        required: true,
        options: [
          { value: 'bare_or_new_build', label: 'Bare / new build garden' },
          { value: 'tired_but_usable', label: 'Tired but generally usable' },
          { value: 'overgrown', label: 'Overgrown and needs a reset' },
          { value: 'partially_renovated', label: 'Partially renovated already' }
        ]
      },
      {
        id: 'garden_size',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_courtyard', label: 'Small courtyard / patio' },
          { value: 'small_garden', label: 'Small garden (up to 100 m²)' },
          { value: 'medium_garden', label: 'Medium garden (100–300 m²)' },
          { value: 'large_garden', label: 'Large garden (300 m²+)' }
        ]
      },
      {
        id: 'garden_uses',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'relaxing', label: 'Relaxing and lounging' },
          { value: 'dining_entertaining', label: 'Outdoor dining and entertaining' },
          { value: 'play_space', label: 'Play area for children' },
          { value: 'low_maintenance', label: 'Low-maintenance space' },
          { value: 'growing_plants', label: 'Growing plants/vegetables' }
        ]
      },
      {
        id: 'garden_style',
        type: 'radio',
        required: false,
        options: [
          { value: 'mediterranean_dry', label: 'Mediterranean / dry garden' },
          { value: 'modern_minimal', label: 'Modern and minimal' },
          { value: 'lush_green', label: 'Lush and green' },
          { value: 'natural_wild', label: 'Natural / wild / ecological' },
          { value: 'no_preference', label: 'No strong preference' }
        ]
      },
      {
        id: 'garden_features',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'seating_areas', label: 'Seating / chill-out areas' },
          { value: 'paths_steps', label: 'Paths and steps' },
          { value: 'planting_beds', label: 'Planting beds / borders' },
          { value: 'lawn_or_turf', label: 'Lawn or artificial grass' },
          { value: 'water_feature', label: 'Water feature' },
          { value: 'outdoor_kitchen_bbq', label: 'Outdoor kitchen / BBQ' }
        ]
      },
      {
        id: 'garden_access',
        type: 'radio',
        required: false,
        options: [
          { value: 'direct_street_access', label: 'Direct access from street/drive' },
          { value: 'narrow_side_access', label: 'Narrow side access only' },
          { value: 'through_house_only', label: 'Through house only' },
          { value: 'steep_or_difficult', label: 'Steep or difficult access' }
        ]
      },
      {
        id: 'garden_redesign_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'garden-steps-and-levels',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'design',
    version: 1,
    questions: [
      {
        id: 'levels_project_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_terracing', label: 'Create new terraces/levels' },
          { value: 'add_steps', label: 'Add or rebuild garden steps' },
          { value: 'stabilise_slopes', label: 'Stabilise slopes / banks' },
          { value: 'improve_access', label: 'Improve access between levels' }
        ]
      },
      {
        id: 'levels_slope',
        type: 'radio',
        required: true,
        options: [
          { value: 'gentle_slope', label: 'Gentle slope' },
          { value: 'moderate_slope', label: 'Moderate slope' },
          { value: 'steep_slope', label: 'Steep slope' },
          { value: 'mixed_levels', label: 'Mixed levels across the garden' }
        ]
      },
      {
        id: 'levels_materials_preference',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'natural_stone', label: 'Natural stone' },
          { value: 'rendered_walls', label: 'Rendered masonry walls' },
          { value: 'timber_sleepers', label: 'Timber sleepers' },
          { value: 'concrete_blocks', label: 'Concrete blocks' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'steps_usage',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'daily_access', label: 'Daily access routes' },
          { value: 'occasional_access', label: 'Occasional access only' },
          { value: 'seating_or_viewing', label: 'As seating or viewing spots' },
          { value: 'equipment_access', label: 'Access for garden equipment' }
        ]
      },
      {
        id: 'levels_safety_needs',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'handrails', label: 'Handrails for steps' },
          { value: 'non_slip_surfaces', label: 'Non-slip surfaces' },
          { value: 'wide_steps', label: 'Wider steps for easier use' },
          { value: 'child_friendly', label: 'Child-friendly design' }
        ]
      },
      {
        id: 'levels_existing_issues',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'erosion', label: 'Erosion or soil movement' },
          { value: 'loose_or_cracked', label: 'Loose or cracked old steps/walls' },
          { value: 'water_runoff', label: 'Water run-off problems' },
          { value: 'none_known', label: 'No known issues' }
        ]
      },
      {
        id: 'levels_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'gravel-paths-dry-gardens',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'design',
    version: 1,
    questions: [
      {
        id: 'dry_garden_scope',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'new_gravel_paths', label: 'Create new gravel paths' },
          { value: 'refresh_existing_paths', label: 'Refresh or widen existing paths' },
          { value: 'dry_garden_beds', label: 'Create gravel/dry planting areas' },
          { value: 'drive_or_parking', label: 'Gravel drive or parking area' }
        ]
      },
      {
        id: 'dry_garden_area_size',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_up_to_30', label: 'Small (up to 30 m²)' },
          { value: 'medium_30_80', label: 'Medium (30–80 m²)' },
          { value: 'large_80_150', label: 'Large (80–150 m²)' },
          { value: 'very_large_150_plus', label: 'Very large (150 m²+)' }
        ]
      },
      {
        id: 'dry_garden_base',
        type: 'radio',
        required: false,
        options: [
          { value: 'bare_soil', label: 'Bare soil' },
          { value: 'old_gravel', label: 'Old gravel already there' },
          { value: 'concrete_or_hard', label: 'Concrete / hard surface' },
          { value: 'mixed', label: 'Mixed surfaces' }
        ]
      },
      {
        id: 'dry_garden_weed_control',
        type: 'radio',
        required: false,
        options: [
          { value: 'very_important', label: 'Very important – minimal weeds' },
          { value: 'moderately_important', label: 'Moderately important' },
          { value: 'not_critical', label: 'Not critical' }
        ]
      },
      {
        id: 'dry_garden_planting',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_mixed_planting', label: 'Yes, mixed planting with gravel' },
          { value: 'sparse_structural', label: 'Sparse, structural plants only' },
          { value: 'no_planting', label: 'No, just gravel/hard surface' },
          { value: 'not_sure', label: 'Not sure yet' }
        ]
      },
      {
        id: 'dry_garden_edge_detail',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'metal_edging', label: 'Metal edging' },
          { value: 'stone_or_block_edging', label: 'Stone/block edging' },
          { value: 'timber_edging', label: 'Timber edging' },
          { value: 'no_edging', label: 'No edging needed' }
        ]
      },
      {
        id: 'dry_garden_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'new-lawn-turf-installation',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'design',
    version: 1,
    questions: [
      {
        id: 'lawn_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'new_lawn_from_scratch', label: 'New lawn from scratch' },
          { value: 'replace_old_lawn', label: 'Remove and replace an old lawn' },
          { value: 'extend_existing_lawn', label: 'Extend existing lawn area' }
        ]
      },
      {
        id: 'lawn_area_size',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_up_to_40', label: 'Up to 40 m²' },
          { value: 'medium_40_100', label: '40–100 m²' },
          { value: 'large_100_250', label: '100–250 m²' },
          { value: 'very_large_250_plus', label: 'More than 250 m²' }
        ]
      },
      {
        id: 'lawn_preparation_needed',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'remove_old_turf', label: 'Remove old turf' },
          { value: 'weed_clearance', label: 'Weed clearance' },
          { value: 'soil_import_or_level', label: 'Import/top up soil and level' },
          { value: 'unsure_pro_advice', label: 'Not sure – need professional advice' }
        ]
      },
      {
        id: 'lawn_use',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'ornamental_only', label: 'Ornamental only' },
          { value: 'family_play', label: 'Family play area' },
          { value: 'pets', label: 'Pets will use the lawn' },
          { value: 'high_foot_traffic', label: 'High foot traffic (events, etc.)' }
        ]
      },
      {
        id: 'lawn_water_supply',
        type: 'radio',
        required: false,
        options: [
          { value: 'hose_point_nearby', label: 'Yes, hose point near the lawn' },
          { value: 'basic_tap_far', label: 'Tap available but a bit far' },
          { value: 'no_easy_supply', label: 'No easy water supply' }
        ]
      },
      {
        id: 'lawn_preferences',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'hardwearing', label: 'Hard-wearing and tough' },
          { value: 'fine_finish', label: 'Fine ornamental finish' },
          { value: 'drought_tolerant', label: 'More drought-tolerant mix' },
          { value: 'no_strong_preference', label: 'No strong preference' }
        ]
      },
      {
        id: 'lawn_install_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'retaining-walls-and-borders',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'design',
    version: 1,
    questions: [
      {
        id: 'retaining_scope',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'retaining_walls', label: 'Retaining walls' },
          { value: 'raised_planting_beds', label: 'Raised planting beds' },
          { value: 'edging_borders', label: 'Edging and garden borders' },
          { value: 'replace_old_structures', label: 'Replace old or failing structures' }
        ]
      },
      {
        id: 'retaining_height',
        type: 'radio',
        required: true,
        options: [
          { value: 'up_to_40cm', label: 'Up to 40 cm high' },
          { value: '40_80cm', label: '40–80 cm high' },
          { value: '80_150cm', label: '80–150 cm high' },
          { value: 'over_150cm', label: 'Over 150 cm high' }
        ]
      },
      {
        id: 'retaining_length',
        type: 'radio',
        required: false,
        options: [
          { value: 'up_to_5m', label: 'Up to 5 m' },
          { value: '5_15m', label: '5–15 m' },
          { value: '15_30m', label: '15–30 m' },
          { value: '30m_plus', label: 'More than 30 m' }
        ]
      },
      {
        id: 'retaining_material_preference',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'natural_stone', label: 'Natural stone' },
          { value: 'rendered_block', label: 'Rendered blockwork' },
          { value: 'timber_sleepers', label: 'Timber sleepers' },
          { value: 'gabion', label: 'Gabion baskets' },
          { value: 'no_preference', label: 'No preference' }
        ]
      },
      {
        id: 'retaining_function',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'support_slopes', label: 'Support/retain soil on a slope' },
          { value: 'create_seating', label: 'Create seating edges' },
          { value: 'define_spaces', label: 'Define garden zones' },
          { value: 'planters_only', label: 'Planters only, no heavy retaining' }
        ]
      },
      {
        id: 'retaining_existing_issues',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'cracking_or_movement', label: 'Cracking or movement in existing walls' },
          { value: 'drainage_problems', label: 'Poor drainage or water pressure' },
          { value: 'subsidence', label: 'Signs of subsidence' },
          { value: 'no_issues', label: 'No known issues' }
        ]
      },
      {
        id: 'retaining_notes',
        type: 'textarea',
        required: false
      }
    ]
  },

  // Gardening & Landscaping - Maintenance
  {
    microSlug: 'holiday-garden-checks',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'maintenance',
    version: 1,
    questions: [
      {
        id: 'holiday_property_type',
        type: 'radio',
        required: true,
        options: [
          { value: 'primary_home', label: 'Primary home' },
          { value: 'holiday_home', label: 'Holiday home' },
          { value: 'rental_villa', label: 'Rental villa/property' }
        ]
      },
      {
        id: 'holiday_garden_elements',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'lawns', label: 'Lawns' },
          { value: 'beds_borders', label: 'Beds and borders' },
          { value: 'pots_terrace', label: 'Pots and containers on terraces' },
          { value: 'vegetable_garden', label: 'Vegetable garden' },
          { value: 'house_plants', label: 'House plants' }
        ]
      },
      {
        id: 'holiday_irrigation_status',
        type: 'radio',
        required: false,
        options: [
          { value: 'full_automatic', label: 'Yes, full automatic system' },
          { value: 'partial_system', label: 'Partial system (some areas manual)' },
          { value: 'no_system', label: 'No, everything is watered manually' }
        ]
      },
      {
        id: 'holiday_key_tasks',
        type: 'checkbox',
        required: false,
        options: [
          { value: 'visual_garden_check', label: 'Visual check for plant health' },
          { value: 'clear_leaves_debris', label: 'Clear leaves and debris' },
          { value: 'basic_pool_skimming', label: 'Basic pool/garden water feature check' },
          { value: 'security_check', label: 'Basic visual security/outdoor check' }
        ]
      },
      {
        id: 'holiday_access_arrangements',
        type: 'radio',
        required: false,
        options: [
          { value: 'keyholder', label: 'Keyholder lives nearby' },
          { value: 'lockbox', label: 'Key safe / lockbox' },
          { value: 'staff_on_site', label: 'Staff on site' },
          { value: 'meet_for_first_visit', label: 'Meet in person for first visit' }
        ]
      },
      {
        id: 'holiday_notes',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    microSlug: 'one-off-garden-cleanup',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'maintenance',
    version: 1,
    questions: [
      {
        id: 'cleanup_garden_state',
        type: 'radio',
        required: true,
        options: [
          { value: 'lightly_overgrown', label: 'Lightly overgrown' },
          { value: 'moderately_overgrown', label: 'Moderately overgrown' },
          { value: 'jungle', label: 'Very overgrown / jungle' },
          { value: 'neglected_long_term', label: 'Neglected for a long time' }
        ]
      },
      {
        id: 'cleanup_tasks',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'grass_and_weeds', label: 'Overgrown grass and weeds' },
          { value: 'shrubs_pruning', label: 'Shrub and hedge pruning' },
          { value: 'tree_branches', label: 'Low tree branches / self-seeded trees' },
          { value: 'brambles_ivies', label: 'Brambles, ivy and climbers' },
          { value: 'debris_rubbish', label: 'Garden debris and rubbish removal' }
        ]
      },
      {
        id: 'cleanup_garden_size',
        type: 'radio',
        required: true,
        options: [
          { value: 'small_up_to_50', label: 'Up to 50 m²' },
          { value: 'medium_50_150', label: '50–150 m²' },
          { value: 'large_150_300', label: '150–300 m²' },
          { value: 'very_large_300_plus', label: 'More than 300 m²' }
        ]
      },
      {
        id: 'cleanup_disposal',
        type: 'radio',
        required: false,
        options: [
          { value: 'pro_dispose', label: 'Professional to remove all waste' },
          { value: 'use_property_bins', label: 'Use existing property bins/compost' },
          { value: 'mix_of_both', label: 'Mix of both' }
        ]
      },
      {
        id: 'cleanup_access',
        type: 'radio',
        required: false,
        options: [
          { value: 'easy_vehicle_access', label: 'Easy access for vehicle/trailer' },
          { value: 'narrow_pedestrian_only', label: 'Narrow, pedestrian access only' },
          { value: 'through_building', label: 'Through building/house only' }
        ]
      },
      {
        id: 'cleanup_followup',
        type: 'radio',
        required: false,
        options: [
          { value: 'yes_plan', label: 'Yes, a simple maintenance plan' },
          { value: 'yes_quote_regular', label: 'Yes, and a quote for regular visits' },
          { value: 'no_one_off_only', label: 'No, just a one-off clean' }
        ]
      },
      {
        id: 'cleanup_notes',
        type: 'textarea',
        required: false
      }
    ]
  },

  {
    microSlug: 'regular-garden-maintenance',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'maintenance',
    version: 1,
    questions: [
      { id: 'maintenance_frequency', question: 'How often would you like maintenance visits?', type: 'radio', required: true, options: [{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Every 2 weeks' }, { value: 'monthly', label: 'Monthly' }, { value: 'one_off', label: 'Just a one-off tidy' }] },
      { id: 'maintenance_tasks', question: 'What should be included in the maintenance visits?', type: 'checkbox', required: true, options: [{ value: 'lawn_mowing', label: 'Lawn mowing / edging' }, { value: 'weeding', label: 'Weeding beds and borders' }, { value: 'light_pruning', label: 'Light pruning and trimming' }, { value: 'leaf_clearing', label: 'Leaf / debris removal' }, { value: 'watering', label: 'Watering plants/pots if needed' }] },
      { id: 'maintenance_garden_size', question: 'Roughly how large is the garden?', type: 'radio', required: true, options: [{ value: 'small', label: 'Small (up to 100 m²)' }, { value: 'medium', label: 'Medium (100–300 m²)' }, { value: 'large', label: 'Large (300–600 m²)' }, { value: 'very_large', label: 'Very large (600 m²+)' }] },
      { id: 'maintenance_planting_type', question: 'What types of plants or areas need regular attention?', type: 'checkbox', required: false, options: [{ value: 'lawns', label: 'Lawns' }, { value: 'shrubs_hedges', label: 'Shrubs / hedges' }, { value: 'flower_beds', label: 'Flower beds' }, { value: 'pots', label: 'Pots / planters / terraces' }, { value: 'trees', label: 'Small trees' }] },
      { id: 'maintenance_notes', question: 'Any special instructions (pets, gates, delicate plants, etc.)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'seasonal-pruning-preparation',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'maintenance',
    version: 1,
    questions: [
      { id: 'seasonal_pruning_scope', question: 'What needs seasonal pruning or preparation?', type: 'checkbox', required: true, options: [{ value: 'hedges', label: 'Hedges' }, { value: 'shrubs', label: 'Shrubs' }, { value: 'fruit_trees', label: 'Fruit trees' }, { value: 'ornamental_trees', label: 'Ornamental trees' }, { value: 'climbers', label: 'Climbers and vines' }] },
      { id: 'seasonal_pruning_height', question: 'What is the approximate height of the shrubs/hedges/trees?', type: 'radio', required: true, options: [{ value: 'up_to_2m', label: 'Up to 2m' }, { value: '2_4m', label: '2–4m' }, { value: '4_6m', label: '4–6m (may require ladders)' }, { value: 'over_6m', label: 'Over 6m (tall tree work)' }] },
      { id: 'seasonal_extra_tasks', question: 'Do you need additional seasonal tasks?', type: 'checkbox', required: false, options: [{ value: 'mulching', label: 'Mulching beds' }, { value: 'fertilising', label: 'Fertilising' }, { value: 'leaf_clearance', label: 'Leaf clearance' }, { value: 'plant_protection', label: 'Plant protection for winter' }] },
      { id: 'seasonal_notes', question: 'Any specific plants or areas that need special care?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'irrigation-check-and-setup',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'irrigation',
    version: 1,
    questions: [
      { id: 'irrigation_system_type', question: 'What type of irrigation system do you have?', type: 'radio', required: true, options: [{ value: 'drip', label: 'Drip irrigation' }, { value: 'sprinklers', label: 'Sprinkler heads' }, { value: 'mixed', label: 'Mixed system' }, { value: 'not_sure', label: 'Not sure' }] },
      { id: 'irrigation_tasks_needed', question: 'What kind of help do you need?', type: 'checkbox', required: true, options: [{ value: 'system_check', label: 'Full system check' }, { value: 'programming', label: 'Controller programming' }, { value: 'leak_check', label: 'Check for leaks' }, { value: 'coverage_adjustment', label: 'Adjust watering coverage' }] },
      { id: 'irrigation_zones', question: 'How many irrigation zones or sectors do you have?', type: 'radio', required: false, options: [{ value: 'one_two', label: '1–2' }, { value: 'three_five', label: '3–5' }, { value: 'six_plus', label: '6 or more' }] },
      { id: 'irrigation_notes', question: 'Any issues or areas with poor coverage?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'irrigation-repairs-leaks',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'irrigation',
    version: 1,
    questions: [
      { id: 'irrigation_problem', question: 'What problem are you experiencing?', type: 'checkbox', required: true, options: [{ value: 'broken_pipes', label: 'Broken pipes or hoses' }, { value: 'leaking_joints', label: 'Leaking joints or connectors' }, { value: 'zone_not_working', label: 'One or more zones not working' }, { value: 'low_pressure', label: 'Low water pressure' }, { value: 'sprinkler_damage', label: 'Sprinkler head damage' }] },
      { id: 'irrigation_damage_area', question: 'Where is the issue located?', type: 'radio', required: false, options: [{ value: 'garden_beds', label: 'Garden beds' }, { value: 'lawns', label: 'Lawns' }, { value: 'pots_terraces', label: 'Terraces / pots' }, { value: 'main_line', label: 'Main line from water point' }] },
      { id: 'irrigation_notes', question: 'Describe any visible damage or symptoms you have noticed.', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'irrigation-system-installation',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'irrigation',
    version: 1,
    questions: [
      { id: 'irrigation_install_scope', question: 'What kind of system do you want installed?', type: 'radio', required: true, options: [{ value: 'drip_system', label: 'Drip system' }, { value: 'sprinkler_system', label: 'Sprinkler system' }, { value: 'mixed_system', label: 'Mixed system' }] },
      { id: 'irrigation_install_areas', question: 'Which areas require irrigation?', type: 'checkbox', required: true, options: [{ value: 'lawns', label: 'Lawns' }, { value: 'beds', label: 'Beds & borders' }, { value: 'pots', label: 'Pots / terraces' }, { value: 'vegetable_patch', label: 'Vegetable garden' }] },
      { id: 'irrigation_install_water_source', question: 'Where will the system take water from?', type: 'radio', required: false, options: [{ value: 'single_tap', label: 'Single tap' }, { value: 'multiple_taps', label: 'Multiple taps' }, { value: 'pump_tank', label: 'Tank with pump' }] },
      { id: 'irrigation_install_notes', question: 'Any obstacles or restrictions (long drive, uneven terrain, no power nearby)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'fertilization',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'lawn',
    version: 1,
    questions: [
      { id: 'fert_area_type', question: 'Which areas need fertilisation?', type: 'checkbox', required: true, options: [{ value: 'lawns', label: 'Lawns' }, { value: 'flower_beds', label: 'Flower beds' }, { value: 'trees_shrubs', label: 'Trees & shrubs' }, { value: 'pots', label: 'Pots / planters' }] },
      { id: 'fert_preferences', question: 'Do you have fertiliser preferences?', type: 'radio', required: false, options: [{ value: 'organic', label: 'Organic products only' }, { value: 'chemical_ok', label: 'Chemical fertilisers are fine' }, { value: 'mixed', label: 'Mix of both' }] },
      { id: 'fert_notes', question: 'Any plants with known sensitivity or special needs?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'lawn-mowing',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'lawn',
    version: 1,
    questions: [
      { id: 'mowing_area', question: 'Approximately how large is the lawn area?', type: 'radio', required: true, options: [{ value: 'small', label: 'Small (up to 50 m²)' }, { value: 'medium', label: 'Medium (50–150 m²)' }, { value: 'large', label: 'Large (150–300 m²)' }, { value: 'very_large', label: 'Very large (300 m²+)' }] },
      { id: 'mowing_frequency', question: 'How often do you want lawn mowing?', type: 'radio', required: false, options: [{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Every 2 weeks' }, { value: 'monthly', label: 'Monthly' }, { value: 'one_off', label: 'One-off cut' }] },
      { id: 'mowing_notes', question: 'Any special needs (strimming edges, steep slopes, obstacles)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'artificial-grass-installation',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'lawn',
    version: 1,
    questions: [
      { id: 'ag_area_size', question: 'What is the approximate area for artificial grass?', type: 'radio', required: true, options: [{ value: 'small', label: 'Up to 20 m²' }, { value: 'medium', label: '20–50 m²' }, { value: 'large', label: '50–100 m²' }, { value: 'very_large', label: '100 m²+' }] },
      { id: 'ag_existing_surface', question: 'What is the current surface?', type: 'radio', required: false, options: [{ value: 'soil', label: 'Soil' }, { value: 'old_grass', label: 'Old grass/turf' }, { value: 'gravel', label: 'Gravel' }, { value: 'tiles_concrete', label: 'Tiles or concrete' }] },
      { id: 'ag_usage', question: 'How will the artificial grass be used?', type: 'checkbox', required: false, options: [{ value: 'kids', label: 'Children play area' }, { value: 'pets', label: 'Pets' }, { value: 'high_traffic', label: 'High foot traffic' }, { value: 'decorative', label: 'Decorative only' }] },
      { id: 'ag_notes', question: 'Any specific requirements (shock pads, drainage, pile height)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'lawn-repair-overseeding',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'lawn',
    version: 1,
    questions: [
      { id: 'repair_problem', question: 'What issues are you experiencing with your lawn?', type: 'checkbox', required: true, options: [{ value: 'bare_patches', label: 'Bare patches' }, { value: 'weeds', label: 'Excessive weeds' }, { value: 'thinning_lawn', label: 'Thinning lawn' }, { value: 'poor_drainage', label: 'Poor drainage' }, { value: 'yellowing', label: 'Yellowing or poor colour' }] },
      { id: 'repair_area_size', question: 'Approximate area needing repair:', type: 'radio', required: true, options: [{ value: 'small', label: 'Up to 20 m²' }, { value: 'medium', label: '20–50 m²' }, { value: 'large', label: '50–100 m²' }, { value: 'very_large', label: '100 m²+' }] },
      { id: 'repair_notes', question: 'Any details about watering, shade, pets, or foot traffic?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'garden-lighting',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'outdoor',
    version: 1,
    questions: [
      { id: 'lighting_type', question: 'What type of garden lighting are you interested in?', type: 'checkbox', required: true, options: [{ value: 'path_lights', label: 'Pathway lights' }, { value: 'uplights', label: 'Uplighting for trees/features' }, { value: 'wall_lights', label: 'Wall-mounted lights' }, { value: 'string_lights', label: 'String/festoon lighting' }, { value: 'spotlights', label: 'Spotlights' }] },
      { id: 'lighting_power', question: 'How should the lighting be powered?', type: 'radio', required: false, options: [{ value: 'mains', label: 'Mains-powered' }, { value: 'solar', label: 'Solar-powered' }, { value: 'low_voltage', label: 'Low-voltage system' }] },
      { id: 'lighting_notes', question: 'Any access limitations or desired effects (mood lighting, security, etc.)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'patio-terrace-construction',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'outdoor',
    version: 1,
    questions: [
      { id: 'patio_material', question: 'What material would you like for the patio/terrace?', type: 'radio', required: true, options: [{ value: 'tile', label: 'Outdoor tiles' }, { value: 'stone', label: 'Natural stone' }, { value: 'concrete', label: 'Concrete / microcement' }, { value: 'composite', label: 'Composite decking' }] },
      { id: 'patio_area_size', question: 'Approximate area size:', type: 'radio', required: true, options: [{ value: 'small', label: 'Up to 10 m²' }, { value: 'medium', label: '10–25 m²' }, { value: 'large', label: '25–50 m²' }, { value: 'very_large', label: '50 m²+' }] },
      { id: 'patio_existing_surface', question: 'What is currently on the ground?', type: 'radio', required: false, options: [{ value: 'soil', label: 'Soil' }, { value: 'old_tiles', label: 'Old tiles/paving' }, { value: 'concrete', label: 'Concrete base' }] },
      { id: 'patio_notes', question: 'Any details (drainage, steps, shading, furniture layout)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'pergola-gazebo-shade',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'outdoor',
    version: 1,
    questions: [
      { id: 'shade_type', question: 'What type of structure do you want?', type: 'radio', required: true, options: [{ value: 'pergola', label: 'Pergola' }, { value: 'gazebo', label: 'Gazebo' }, { value: 'sail_shade', label: 'Shade sail' }] },
      { id: 'shade_material', question: 'Preferred material:', type: 'radio', required: false, options: [{ value: 'wood', label: 'Wood' }, { value: 'aluminium', label: 'Aluminium' }, { value: 'steel', label: 'Steel' }] },
      { id: 'shade_area', question: 'Approximate covered area needed:', type: 'radio', required: false, options: [{ value: 'small', label: 'Up to 10 m²' }, { value: 'medium', label: '10–20 m²' }, { value: 'large', label: '20 m²+' }] },
      { id: 'shade_notes', question: 'Any specific preferences (retractable roof, privacy screens, lighting)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'hedge-trimming-shaping',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'trees',
    version: 1,
    questions: [
      { id: 'hedge_length', question: 'Approximate total length of hedges to trim:', type: 'radio', required: true, options: [{ value: 'up_to_10m', label: 'Up to 10m' }, { value: '10_30m', label: '10–30m' }, { value: '30_60m', label: '30–60m' }, { value: '60m_plus', label: 'Over 60m' }] },
      { id: 'hedge_height', question: 'Approximate height of hedges:', type: 'radio', required: false, options: [{ value: 'up_to_1_5m', label: 'Up to 1.5m' }, { value: '1_5_3m', label: '1.5–3m' }, { value: '3m_plus', label: 'Over 3m (requires ladders)' }] },
      { id: 'hedge_style', question: 'What style do you prefer?', type: 'radio', required: false, options: [{ value: 'straight_clean', label: 'Straight and clean finish' }, { value: 'natural_shape', label: 'Natural shape' }, { value: 'formal_topiary', label: 'Formal topiary shaping' }] },
      { id: 'hedge_notes', question: 'Any concerns (access issues, birds nesting, height restrictions)?', type: 'textarea', required: false }
    ]
  },

  {
    microSlug: 'tree-pruning-removal',
    categorySlug: 'gardening-landscaping',
    subcategorySlug: 'trees',
    version: 1,
    questions: [
      { id: 'tree_service_type', question: 'What tree service do you need?', type: 'radio', required: true, options: [{ value: 'pruning', label: 'Tree pruning' }, { value: 'crown_reduction', label: 'Crown reduction' }, { value: 'removal', label: 'Tree removal' }, { value: 'stump_removal', label: 'Stump removal only' }] },
      { id: 'tree_quantity', question: 'How many trees?', type: 'radio', required: true, options: [{ value: 'one', label: '1 tree' }, { value: 'two_three', label: '2–3 trees' }, { value: 'four_plus', label: '4 or more trees' }] },
      { id: 'tree_height', question: 'Approximate height of the tree(s):', type: 'radio', required: false, options: [{ value: 'under_4m', label: 'Under 4m' }, { value: '4_8m', label: '4–8m' }, { value: '8_12m', label: '8–12m' }, { value: '12m_plus', label: '12m or taller' }] },
      { id: 'tree_access', question: 'How accessible is the tree for equipment?', type: 'radio', required: false, options: [{ value: 'easy_access', label: 'Easy access' }, { value: 'limited_access', label: 'Limited access (narrow paths)' }, { value: 'difficult_access', label: 'Difficult access (through house, steep areas)' }] },
      { id: 'tree_notes', question: 'Any hazards or concerns (power lines, buildings, protected species)?', type: 'textarea', required: false }
    ]
  }
];

