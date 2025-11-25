/**
 * Commercial, Office, Retail, Kitchen/Bathroom, Construction, Brickwork & Pool Heating Question Packs
 * 
 * Covers:
 * - Commercial & Industrial: Planned Maintenance, Shopfront Repairs
 * - Office Fitouts: Office Partitions, Office Renovation
 * - Retail Spaces: Retail Display, Shop Fitting
 * - Wetrooms & Specialist Bathrooms: Accessible Bathrooms, Waterproofing, Walk-in Showers, Wetroom Installation
 * - Bathroom Fitting & Renovation: Bathroom Design, Refurbishment, Cloakroom/Ensuite, New Installation, Full Bathroom Fit, Wetroom Installation
 * - Kitchen Installation: Full Kitchen Fit, Worktop Installation
 * - Kitchen Fitting & Renovation: Kitchen Fitting, Kitchen Refurbishment, New Kitchen Installation, Small Kitchen Updates
 * - Kitchen Worktops, Units & Storage: Island Installation, Unit Installation, Pantry/Utility Storage, Worktop Install/Replace
 * - Construction & Extensions: Adding New Rooms, Conservatories/Glass Rooms, Garage Conversions, Single/Two Floor Home Extensions, Terrace/Rooftop Extensions
 * - Brickwork, Masonry & Concrete: Building/Repairing Walls, Concrete Bases/Paths/Floors, Garden/Boundary Walls
 * - Pool & Spa Heating: Electric Pool Heaters, Energy Efficiency Upgrades, Gas Pool Heaters, Heat Pump Installation, Pool Blankets & Covers, Pool Heating Repairs, Solar Pool Heating
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
];
