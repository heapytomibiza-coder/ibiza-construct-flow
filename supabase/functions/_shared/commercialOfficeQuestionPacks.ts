/**
 * Commercial, Office, Retail & Bathroom Question Packs
 * Covers: Planned Maintenance, Shopfront Repairs, Office Partitions, Office Renovation, 
 * Retail Display, Shop Fitting, Accessible Bathrooms, Waterproofing, Walk-in Showers,
 * Wetroom Installation, Bathroom Design, Bathroom Refurbishment, Cloakroom/Ensuite, New Bathroom Installation
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
    categorySlug: 'wetrooms-specialist-bathrooms',
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
    categorySlug: 'wetrooms-specialist-bathrooms',
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
    categorySlug: 'wetrooms-specialist-bathrooms',
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
    categorySlug: 'wetrooms-specialist-bathrooms',
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
    categorySlug: 'bathroom-fitting-renovation',
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
    categorySlug: 'bathroom-fitting-renovation',
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
    categorySlug: 'bathroom-fitting-renovation',
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
    categorySlug: 'bathroom-fitting-renovation',
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
  }
];
