/**
 * 10 Priority Micro-Services for MVP Launch
 * Each service has rich no-typing Q&A optimized for Ibiza market
 * 
 * Format matches micro_service_questions schema
 */

export const PRIORITY_MICRO_SERVICES = [
  {
    category: 'Plumbing',
    subcategory: 'Emergency Repairs',
    micro_name: 'Burst Pipe Repair',
    micro_id: 'plumbing-emergency-burst-pipe',
    questions: [
      {
        id: 'pipe_location',
        label: 'Where is the burst pipe located?',
        type: 'single',
        required: true,
        options: [
          { value: 'bathroom', label: 'Bathroom', description: 'Shower, sink, or toilet area' },
          { value: 'kitchen', label: 'Kitchen', description: 'Under sink or appliances' },
          { value: 'outdoor', label: 'Outdoor', description: 'Garden or external walls' },
          { value: 'basement', label: 'Basement/Utility', description: 'Storage or utility room' }
        ]
      },
      {
        id: 'water_damage',
        label: 'Is there visible water damage?',
        type: 'single',
        required: true,
        options: [
          { value: 'minor', label: 'Minor leak', description: 'Small puddle, easily contained' },
          { value: 'moderate', label: 'Moderate flooding', description: 'Multiple rooms affected' },
          { value: 'severe', label: 'Severe flooding', description: 'Major damage, urgent' }
        ]
      },
      {
        id: 'water_shutoff',
        label: 'Have you shut off the main water supply?',
        type: 'single',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, water is off', description: 'Main valve closed' },
          { value: 'no_cant_find', label: 'No, can\'t find valve', description: 'Need help locating' },
          { value: 'no_wont_close', label: 'Valve won\'t close', description: 'Valve stuck or broken' }
        ]
      },
      {
        id: 'property_type',
        label: 'What type of property?',
        type: 'single',
        required: true,
        options: [
          { value: 'apartment', label: 'Apartment', description: 'Multi-unit building' },
          { value: 'villa', label: 'Villa/House', description: 'Standalone property' },
          { value: 'commercial', label: 'Commercial', description: 'Office or shop' }
        ]
      }
    ]
  },

  {
    category: 'Electrical',
    subcategory: 'Installations',
    micro_name: 'Air Conditioning Installation',
    micro_id: 'electrical-installations-ac-install',
    questions: [
      {
        id: 'ac_type',
        label: 'What type of AC system do you need?',
        type: 'single',
        required: true,
        options: [
          { value: 'split', label: 'Split System', description: 'Wall-mounted indoor + outdoor unit' },
          { value: 'multi_split', label: 'Multi-Split', description: 'Multiple indoor units' },
          { value: 'ducted', label: 'Ducted Central', description: 'Whole-house system' },
          { value: 'portable', label: 'Portable Unit', description: 'Mobile standalone unit' }
        ]
      },
      {
        id: 'rooms_count',
        label: 'How many rooms need cooling?',
        type: 'single',
        required: true,
        options: [
          { value: '1', label: '1 Room', description: 'Single bedroom or living room' },
          { value: '2-3', label: '2-3 Rooms', description: 'Typical apartment' },
          { value: '4-6', label: '4-6 Rooms', description: 'Large villa' },
          { value: '7+', label: '7+ Rooms', description: 'Commercial or luxury property' }
        ]
      },
      {
        id: 'total_area',
        label: 'Total area to cool (approx.)?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Up to 50m²', description: 'Studio or 1-bed' },
          { value: 'medium', label: '50-100m²', description: 'Standard 2-3 bed' },
          { value: 'large', label: '100-200m²', description: 'Large villa' },
          { value: 'xlarge', label: 'Over 200m²', description: 'Luxury property' }
        ]
      },
      {
        id: 'existing_system',
        label: 'Do you have existing AC equipment?',
        type: 'single',
        required: false,
        options: [
          { value: 'none', label: 'No existing AC', description: 'New installation' },
          { value: 'needs_replacement', label: 'Old unit to replace', description: 'Remove old, install new' },
          { value: 'expand', label: 'Add to existing', description: 'Additional units needed' }
        ]
      }
    ]
  },

  {
    category: 'Construction',
    subcategory: 'Kitchen & Bathroom',
    micro_name: 'Kitchen Renovation',
    micro_id: 'construction-kitchen-full-renovation',
    questions: [
      {
        id: 'kitchen_size',
        label: 'Kitchen size?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Small (< 10m²)', description: 'Compact apartment kitchen' },
          { value: 'medium', label: 'Medium (10-15m²)', description: 'Standard family kitchen' },
          { value: 'large', label: 'Large (15-25m²)', description: 'Open-plan or luxury kitchen' },
          { value: 'xlarge', label: 'Extra Large (25m²+)', description: 'Commercial-grade or chef\'s kitchen' }
        ]
      },
      {
        id: 'scope',
        label: 'What needs to be done?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'cabinets', label: 'New Cabinets', description: 'Custom or prefab units' },
          { value: 'countertops', label: 'Countertops', description: 'Granite, quartz, or marble' },
          { value: 'appliances', label: 'Appliances', description: 'Oven, fridge, dishwasher' },
          { value: 'plumbing', label: 'Plumbing', description: 'Sink, taps, pipes' },
          { value: 'electrical', label: 'Electrical', description: 'Outlets, lighting' },
          { value: 'flooring', label: 'Flooring', description: 'Tile, wood, or stone' },
          { value: 'walls', label: 'Walls/Paint', description: 'Tiling or repainting' }
        ]
      },
      {
        id: 'layout_change',
        label: 'Changing the layout?',
        type: 'single',
        required: true,
        options: [
          { value: 'no_change', label: 'Keep existing layout', description: 'Same footprint' },
          { value: 'minor', label: 'Minor changes', description: 'Move appliances or outlets' },
          { value: 'major', label: 'Major reconfiguration', description: 'Walls, plumbing, electrical' }
        ]
      },
      {
        id: 'style_preference',
        label: 'Design style preference?',
        type: 'single',
        required: false,
        options: [
          { value: 'modern', label: 'Modern/Minimalist', description: 'Clean lines, neutral colors' },
          { value: 'traditional', label: 'Traditional/Classic', description: 'Warm woods, ornate details' },
          { value: 'mediterranean', label: 'Mediterranean', description: 'Terracotta, blue accents' },
          { value: 'industrial', label: 'Industrial', description: 'Metal, concrete, exposed' }
        ]
      }
    ]
  },

  {
    category: 'Pool Services',
    subcategory: 'Maintenance',
    micro_name: 'Pool Cleaning & Maintenance',
    micro_id: 'pool-maintenance-regular-cleaning',
    questions: [
      {
        id: 'pool_type',
        label: 'Pool type?',
        type: 'single',
        required: true,
        options: [
          { value: 'concrete', label: 'Concrete/Gunite', description: 'Built-in pool' },
          { value: 'fiberglass', label: 'Fiberglass', description: 'Pre-formed shell' },
          { value: 'vinyl', label: 'Vinyl Liner', description: 'Flexible liner' },
          { value: 'infinity', label: 'Infinity/Overflow', description: 'Luxury edge design' }
        ]
      },
      {
        id: 'pool_size',
        label: 'Pool size (approx.)?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Small (< 30m²)', description: 'Plunge pool or jacuzzi' },
          { value: 'medium', label: 'Medium (30-60m²)', description: 'Standard residential' },
          { value: 'large', label: 'Large (60-100m²)', description: 'Luxury villa pool' },
          { value: 'olympic', label: 'Olympic/Commercial', description: 'Very large pool' }
        ]
      },
      {
        id: 'service_frequency',
        label: 'Maintenance frequency needed?',
        type: 'single',
        required: true,
        options: [
          { value: 'one_time', label: 'One-time clean', description: 'Opening season or special event' },
          { value: 'weekly', label: 'Weekly', description: 'High-use summer season' },
          { value: 'biweekly', label: 'Bi-weekly', description: 'Standard maintenance' },
          { value: 'monthly', label: 'Monthly', description: 'Off-season or backup' }
        ]
      },
      {
        id: 'issues',
        label: 'Any current issues?',
        type: 'multiple',
        required: false,
        options: [
          { value: 'green_water', label: 'Green/Cloudy Water', description: 'Algae or chemical imbalance' },
          { value: 'equipment', label: 'Equipment Problems', description: 'Pump, filter, or heater' },
          { value: 'leaks', label: 'Visible Leaks', description: 'Water loss' },
          { value: 'cracks', label: 'Cracks/Damage', description: 'Surface issues' }
        ]
      }
    ]
  },

  {
    category: 'Landscaping',
    subcategory: 'Garden Maintenance',
    micro_name: 'Regular Garden Maintenance',
    micro_id: 'landscaping-garden-regular-maintenance',
    questions: [
      {
        id: 'garden_size',
        label: 'Garden size?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Small (< 100m²)', description: 'Courtyard or terrace' },
          { value: 'medium', label: 'Medium (100-500m²)', description: 'Standard villa garden' },
          { value: 'large', label: 'Large (500-1000m²)', description: 'Estate grounds' },
          { value: 'xlarge', label: 'Extra Large (1000m²+)', description: 'Commercial or luxury estate' }
        ]
      },
      {
        id: 'services_needed',
        label: 'Services needed?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'lawn_mowing', label: 'Lawn Mowing', description: 'Grass cutting and edging' },
          { value: 'hedge_trimming', label: 'Hedge Trimming', description: 'Shaping and pruning' },
          { value: 'weeding', label: 'Weeding', description: 'Remove unwanted plants' },
          { value: 'irrigation', label: 'Irrigation Check', description: 'Sprinkler system' },
          { value: 'fertilizing', label: 'Fertilizing', description: 'Soil treatment' },
          { value: 'planting', label: 'Planting', description: 'New flowers or shrubs' }
        ]
      },
      {
        id: 'frequency',
        label: 'Maintenance frequency?',
        type: 'single',
        required: true,
        options: [
          { value: 'one_time', label: 'One-time service', description: 'Special cleanup' },
          { value: 'weekly', label: 'Weekly', description: 'High-maintenance season' },
          { value: 'biweekly', label: 'Bi-weekly', description: 'Standard maintenance' },
          { value: 'monthly', label: 'Monthly', description: 'Basic upkeep' }
        ]
      },
      {
        id: 'garden_type',
        label: 'Garden style?',
        type: 'single',
        required: false,
        options: [
          { value: 'mediterranean', label: 'Mediterranean', description: 'Olive, lavender, drought-tolerant' },
          { value: 'tropical', label: 'Tropical', description: 'Palm trees, exotic plants' },
          { value: 'formal', label: 'Formal/English', description: 'Manicured lawns, hedges' },
          { value: 'low_maintenance', label: 'Low Maintenance', description: 'Gravel, succulents' }
        ]
      }
    ]
  },

  {
    category: 'Painting',
    subcategory: 'Interior',
    micro_name: 'Room Painting',
    micro_id: 'painting-interior-room-painting',
    questions: [
      {
        id: 'rooms_count',
        label: 'How many rooms?',
        type: 'single',
        required: true,
        options: [
          { value: '1', label: '1 Room', description: 'Single bedroom or living room' },
          { value: '2-3', label: '2-3 Rooms', description: 'Multiple rooms' },
          { value: '4-6', label: '4-6 Rooms', description: 'Whole apartment' },
          { value: 'full_property', label: 'Entire Property', description: 'All rooms and hallways' }
        ]
      },
      {
        id: 'room_types',
        label: 'Which rooms?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'bedrooms', label: 'Bedrooms', description: 'Sleeping areas' },
          { value: 'living_room', label: 'Living Room', description: 'Main living space' },
          { value: 'kitchen', label: 'Kitchen', description: 'Cooking area' },
          { value: 'bathrooms', label: 'Bathrooms', description: 'Wet areas' },
          { value: 'hallways', label: 'Hallways/Stairs', description: 'Circulation spaces' },
          { value: 'ceilings', label: 'Ceilings', description: 'Overhead surfaces' }
        ]
      },
      {
        id: 'wall_condition',
        label: 'Wall condition?',
        type: 'single',
        required: true,
        options: [
          { value: 'good', label: 'Good', description: 'Smooth, just needs paint' },
          { value: 'minor_prep', label: 'Minor repairs', description: 'Small cracks or holes' },
          { value: 'major_prep', label: 'Major prep', description: 'Significant damage or texture' }
        ]
      },
      {
        id: 'finish_type',
        label: 'Paint finish preference?',
        type: 'single',
        required: false,
        options: [
          { value: 'matte', label: 'Matte/Flat', description: 'Non-reflective, hides imperfections' },
          { value: 'eggshell', label: 'Eggshell', description: 'Slight sheen, easy to clean' },
          { value: 'satin', label: 'Satin', description: 'Smooth, washable' },
          { value: 'semi_gloss', label: 'Semi-Gloss', description: 'Shiny, durable (kitchens/baths)' }
        ]
      }
    ]
  },

  {
    category: 'HVAC',
    subcategory: 'Repairs',
    micro_name: 'AC Not Cooling',
    micro_id: 'hvac-repairs-ac-not-cooling',
    questions: [
      {
        id: 'system_type',
        label: 'AC system type?',
        type: 'single',
        required: true,
        options: [
          { value: 'split', label: 'Split System', description: 'Wall-mounted unit' },
          { value: 'ducted', label: 'Ducted/Central', description: 'Whole-house system' },
          { value: 'window', label: 'Window Unit', description: 'Self-contained box' },
          { value: 'portable', label: 'Portable', description: 'Mobile standalone' }
        ]
      },
      {
        id: 'issue_description',
        label: 'What\'s the problem?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'not_cooling', label: 'Not cooling at all', description: 'Warm air coming out' },
          { value: 'weak_cooling', label: 'Weak/insufficient cooling', description: 'Can\'t reach set temperature' },
          { value: 'strange_noise', label: 'Strange noises', description: 'Rattling, buzzing, or grinding' },
          { value: 'water_leak', label: 'Water leaking', description: 'Dripping or pooling water' },
          { value: 'wont_turn_on', label: 'Won\'t turn on', description: 'No power or response' }
        ]
      },
      {
        id: 'unit_age',
        label: 'How old is the unit?',
        type: 'single',
        required: true,
        options: [
          { value: 'new', label: '< 2 years', description: 'Recent installation' },
          { value: 'medium', label: '2-5 years', description: 'Mid-life unit' },
          { value: 'old', label: '5-10 years', description: 'Aging unit' },
          { value: 'very_old', label: '10+ years', description: 'May need replacement' }
        ]
      },
      {
        id: 'last_service',
        label: 'When was it last serviced?',
        type: 'single',
        required: false,
        options: [
          { value: 'recent', label: 'Within 6 months', description: 'Recent maintenance' },
          { value: 'year', label: '6-12 months ago', description: 'Due for service' },
          { value: 'long', label: 'Over a year', description: 'Overdue' },
          { value: 'never', label: 'Never serviced', description: 'No maintenance history' }
        ]
      }
    ]
  },

  {
    category: 'Carpentry',
    subcategory: 'Custom Work',
    micro_name: 'Built-in Wardrobes',
    micro_id: 'carpentry-custom-builtin-wardrobes',
    questions: [
      {
        id: 'wardrobe_location',
        label: 'Where will the wardrobe go?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'bedroom', label: 'Bedroom', description: 'Master or guest bedroom' },
          { value: 'walk_in_closet', label: 'Walk-in Closet', description: 'Dedicated dressing room' },
          { value: 'hallway', label: 'Hallway', description: 'Corridor storage' },
          { value: 'multiple_rooms', label: 'Multiple Rooms', description: 'Several locations' }
        ]
      },
      {
        id: 'wardrobe_size',
        label: 'Approximate size?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Small (< 2m wide)', description: 'Single wall section' },
          { value: 'medium', label: 'Medium (2-3m)', description: 'Standard bedroom wall' },
          { value: 'large', label: 'Large (3-5m)', description: 'Full wall coverage' },
          { value: 'walk_in', label: 'Walk-in (5m+)', description: 'Entire room conversion' }
        ]
      },
      {
        id: 'features_needed',
        label: 'Features needed?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'hanging_space', label: 'Hanging Rails', description: 'For clothes on hangers' },
          { value: 'shelving', label: 'Shelving', description: 'Fixed or adjustable shelves' },
          { value: 'drawers', label: 'Drawers', description: 'Soft-close drawers' },
          { value: 'shoe_storage', label: 'Shoe Storage', description: 'Dedicated shoe racks' },
          { value: 'mirrors', label: 'Mirrors', description: 'Full-length mirrors' },
          { value: 'lighting', label: 'Internal Lighting', description: 'LED strips or spots' }
        ]
      },
      {
        id: 'door_type',
        label: 'Door preference?',
        type: 'single',
        required: false,
        options: [
          { value: 'sliding', label: 'Sliding Doors', description: 'Space-saving option' },
          { value: 'hinged', label: 'Hinged Doors', description: 'Traditional opening' },
          { value: 'open', label: 'Open (no doors)', description: 'Modern open concept' }
        ]
      }
    ]
  },

  {
    category: 'Tiling',
    subcategory: 'Bathroom',
    micro_name: 'Bathroom Tiling',
    micro_id: 'tiling-bathroom-full-tiling',
    questions: [
      {
        id: 'bathroom_size',
        label: 'Bathroom size?',
        type: 'single',
        required: true,
        options: [
          { value: 'small', label: 'Small (< 5m²)', description: 'Powder room or en-suite' },
          { value: 'medium', label: 'Medium (5-10m²)', description: 'Standard bathroom' },
          { value: 'large', label: 'Large (10m²+)', description: 'Master bathroom' }
        ]
      },
      {
        id: 'tiling_areas',
        label: 'Areas to tile?',
        type: 'multiple',
        required: true,
        options: [
          { value: 'floor', label: 'Floor', description: 'Entire floor surface' },
          { value: 'shower_walls', label: 'Shower/Tub Walls', description: 'Wet area walls' },
          { value: 'all_walls', label: 'All Walls', description: 'Floor to ceiling' },
          { value: 'backsplash', label: 'Vanity Backsplash', description: 'Behind sink area' }
        ]
      },
      {
        id: 'tile_type',
        label: 'Tile material preference?',
        type: 'single',
        required: false,
        options: [
          { value: 'ceramic', label: 'Ceramic', description: 'Budget-friendly, good variety' },
          { value: 'porcelain', label: 'Porcelain', description: 'Durable, water-resistant' },
          { value: 'natural_stone', label: 'Natural Stone', description: 'Marble, travertine, slate' },
          { value: 'mosaic', label: 'Mosaic', description: 'Small decorative tiles' }
        ]
      },
      {
        id: 'existing_tiles',
        label: 'Existing tiles?',
        type: 'single',
        required: true,
        options: [
          { value: 'none', label: 'No existing tiles', description: 'New installation' },
          { value: 'remove', label: 'Remove old tiles', description: 'Demolition + disposal' },
          { value: 'tile_over', label: 'Tile over existing', description: 'If suitable substrate' }
        ]
      }
    ]
  },

  {
    category: 'Roofing',
    subcategory: 'Repairs',
    micro_name: 'Roof Leak Repair',
    micro_id: 'roofing-repairs-leak-repair',
    questions: [
      {
        id: 'roof_type',
        label: 'Roof type?',
        type: 'single',
        required: true,
        options: [
          { value: 'tile', label: 'Tile Roof', description: 'Clay or concrete tiles' },
          { value: 'flat', label: 'Flat Roof', description: 'Membrane or asphalt' },
          { value: 'metal', label: 'Metal Roof', description: 'Steel or aluminum sheets' },
          { value: 'shingle', label: 'Shingle/Asphalt', description: 'Overlapping shingles' }
        ]
      },
      {
        id: 'leak_location',
        label: 'Where is the leak?',
        type: 'single',
        required: true,
        options: [
          { value: 'multiple_spots', label: 'Multiple locations', description: 'Several leak points' },
          { value: 'one_area', label: 'Specific area', description: 'Concentrated leak' },
          { value: 'unknown', label: 'Don\'t know exact spot', description: 'Water stains but unclear source' }
        ]
      },
      {
        id: 'leak_severity',
        label: 'Leak severity?',
        type: 'single',
        required: true,
        options: [
          { value: 'minor', label: 'Minor drip', description: 'Small stain, occasional drip' },
          { value: 'moderate', label: 'Moderate leak', description: 'Steady drip, visible damage' },
          { value: 'severe', label: 'Severe leak', description: 'Pouring water, urgent' }
        ]
      },
      {
        id: 'interior_damage',
        label: 'Interior damage visible?',
        type: 'multiple',
        required: false,
        options: [
          { value: 'ceiling_stains', label: 'Ceiling stains', description: 'Watermarks or discoloration' },
          { value: 'peeling_paint', label: 'Peeling paint', description: 'Bubbling or flaking' },
          { value: 'mold', label: 'Mold/mildew', description: 'Fungal growth' },
          { value: 'structural', label: 'Structural damage', description: 'Sagging or cracks' }
        ]
      }
    ]
  }
];
