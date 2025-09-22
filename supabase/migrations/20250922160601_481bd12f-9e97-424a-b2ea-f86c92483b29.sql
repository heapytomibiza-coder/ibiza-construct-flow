-- Insert service questions for top 24 services using MC-first approach

-- 1. Furniture Assembly (General) 
INSERT INTO service_questions(service_id, questions, version) 
SELECT id, '[
  {
    "key": "furniture_type",
    "label": "What type of furniture?",
    "type": "radio",
    "options": ["IKEA furniture", "Bed frame", "Office desk", "Wardrobe/Dresser", "Bookshelf", "Other"],
    "required": true
  },
  {
    "key": "complexity",
    "label": "How complex is the assembly?",
    "type": "radio", 
    "options": ["Simple (1-2 hours)", "Standard (2-4 hours)", "Complex (4+ hours)", "Unsure"],
    "required": true
  },
  {
    "key": "tools_provided",
    "label": "Do you have tools?",
    "type": "radio",
    "options": ["I have basic tools", "Need professional tools", "Unsure what''s needed"],
    "required": true
  },
  {
    "key": "assembly_location",
    "label": "Assembly location?",
    "type": "radio",
    "options": ["Living room", "Bedroom", "Office", "Multiple rooms"],
    "required": false
  }
]'::jsonb, 1
FROM services WHERE micro = 'General Furniture Assembly';

-- 2. IKEA Furniture Assembly
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "ikea_item_type", 
    "label": "IKEA item type?",
    "type": "radio",
    "options": ["Wardrobe (PAX/HEMNES)", "Kitchen units", "Bed frame", "Desk/Table", "Bookshelf (BILLY)", "Multiple items"],
    "required": true
  },
  {
    "key": "item_count",
    "label": "Number of items?",
    "type": "radio",
    "options": ["1 item", "2-3 items", "4-6 items", "7+ items"],
    "required": true
  },
  {
    "key": "instructions_available",
    "label": "Do you have instructions?",
    "type": "radio", 
    "options": ["Yes, with all parts", "Yes, missing some parts", "No instructions"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'IKEA Furniture Assembly';

-- 3. Mirror/Picture Hanging
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "item_type",
    "label": "What needs hanging?",
    "type": "radio",
    "options": ["Small pictures (<2kg)", "Medium artwork (2-10kg)", "Large mirror/art (10kg+)", "Multiple items"],
    "required": true
  },
  {
    "key": "wall_type",
    "label": "Wall type?", 
    "type": "radio",
    "options": ["Plasterboard", "Brick/Concrete", "Tile", "Unsure"],
    "required": true
  },
  {
    "key": "mounting_hardware",
    "label": "Do you have mounting hardware?",
    "type": "radio",
    "options": ["Yes, professional grade", "Basic screws only", "Nothing provided"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Mirror hanging';

-- 4. Curtain Installation  
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "curtain_type",
    "label": "Curtain type?",
    "type": "radio", 
    "options": ["Standard curtains", "Heavy/Blackout curtains", "Roman blinds", "Venetian blinds"],
    "required": true
  },
  {
    "key": "window_count",
    "label": "Number of windows?",
    "type": "radio",
    "options": ["1 window", "2-3 windows", "4-6 windows", "7+ windows"],
    "required": true
  },
  {
    "key": "rail_provided",
    "label": "Do you have curtain rails?", 
    "type": "radio",
    "options": ["Yes, need installation", "No, need rails + installation", "Existing rails, replace only"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Curtain installation';

-- 5. Light Fixture Installation
INSERT INTO service_questions(service_id, questions, version) 
SELECT id, '[
  {
    "key": "fixture_type",
    "label": "Light fixture type?",
    "type": "radio",
    "options": ["Ceiling light", "Chandelier", "Wall sconce", "LED strips", "Multiple fixtures"],
    "required": true
  },
  {
    "key": "existing_wiring",
    "label": "Existing wiring?",
    "type": "radio",
    "options": ["Yes, just replacing fixture", "Some wiring, need extension", "No wiring, new installation"],
    "required": true
  },
  {
    "key": "ceiling_height",
    "label": "Ceiling height?",
    "type": "radio",
    "options": ["Standard (2.4-3m)", "High (3-4m)", "Very high (4m+)", "Unsure"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Install light fixture';

-- 6. Ceiling Fan Installation
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "fan_size", 
    "label": "Fan size?",
    "type": "radio",
    "options": ["Small (<42'')", "Medium (42-52'')", "Large (52''+)", "Don''t have fan yet"],
    "required": true
  },
  {
    "key": "existing_ceiling_box",
    "label": "Existing ceiling electrical box?", 
    "type": "radio",
    "options": ["Yes, rated for fans", "Yes, but unsure of rating", "No existing box", "Unsure"],
    "required": true
  },
  {
    "key": "remote_control",
    "label": "Remote control needed?",
    "type": "radio",
    "options": ["Yes, wireless remote", "Wall switch only", "Smart home integration", "Unsure"],
    "required": false
  }
]'::jsonb, 1
FROM services WHERE micro = 'Install ceiling fan';

-- 7. Smart Home Setup
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "system_type",
    "label": "Smart home system?",
    "type": "radio",
    "options": ["Amazon Alexa", "Google Home", "Apple HomeKit", "Custom/Multiple", "Unsure"],
    "required": true
  },
  {
    "key": "devices_count",
    "label": "How many devices?",
    "type": "radio",
    "options": ["1-3 devices", "4-8 devices", "9-15 devices", "15+ devices"],
    "required": true
  },
  {
    "key": "device_types",
    "label": "Device types?",
    "type": "radio",
    "options": ["Lights only", "Lights + Security", "Full automation", "Entertainment focus"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Smart home setup';

-- 8. Power Outlet Repair
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "outlet_issue",
    "label": "What''s the problem?",
    "type": "radio", 
    "options": ["Not working at all", "Loose/wobbly", "Sparking/burning smell", "GFCI tripping", "Multiple issues"],
    "required": true
  },
  {
    "key": "outlet_count",
    "label": "How many outlets?",
    "type": "radio",
    "options": ["1 outlet", "2-3 outlets", "4+ outlets", "Whole room circuit"],
    "required": true
  },
  {
    "key": "outlet_location",
    "label": "Outlet location?",
    "type": "radio",
    "options": ["Kitchen/Bathroom", "Living areas", "Outdoor", "Multiple locations"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Fix power outlet';

-- 9. Leaky Tap Fix  
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "tap_location",
    "label": "Which tap?",
    "type": "radio",
    "options": ["Kitchen sink", "Bathroom basin", "Bath/Shower", "Outdoor tap", "Multiple taps"],
    "required": true
  },
  {
    "key": "leak_severity",
    "label": "Leak severity?", 
    "type": "radio",
    "options": ["Slow drip", "Steady drip", "Stream/gushing", "Only when in use"],
    "required": true
  },
  {
    "key": "tap_type",
    "label": "Tap type?",
    "type": "radio", 
    "options": ["Single lever", "Double handle", "Mixer tap", "Traditional taps", "Unsure"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Fix leaky tap';

-- 10. Deep Cleaning
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "property_size",
    "label": "Property size?",
    "type": "radio",
    "options": ["Studio/1 bed", "2-3 bedrooms", "4-5 bedrooms", "6+ bedrooms"],
    "required": true
  },
  {
    "key": "cleaning_focus",
    "label": "Focus areas?",
    "type": "radio", 
    "options": ["Whole property", "Kitchen + bathrooms", "Move-in/out clean", "Post-renovation"],
    "required": true
  },
  {
    "key": "cleaning_frequency",
    "label": "When was last deep clean?",
    "type": "radio",
    "options": ["Within 6 months", "6-12 months ago", "Over 1 year", "Never/Unsure"],
    "required": true
  }
]'::jsonb, 1  
FROM services WHERE micro = 'Deep Cleaning';

-- Continue with remaining 14 services...

-- 11. Window Cleaning
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "window_count",
    "label": "Number of windows?", 
    "type": "radio",
    "options": ["1-5 windows", "6-12 windows", "13-20 windows", "20+ windows"],
    "required": true
  },
  {
    "key": "window_accessibility",
    "label": "Window accessibility?",
    "type": "radio",
    "options": ["Ground floor only", "Up to 2nd floor", "High rise (3+ floors)", "Mixed heights"],
    "required": true
  },
  {
    "key": "service_type",
    "label": "Service type?",
    "type": "radio",
    "options": ["Inside + outside", "Outside only", "Inside only", "Frames + glass"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Window Cleaning';

-- 12. Door Lock Repair
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "lock_issue",
    "label": "What''s the problem?",
    "type": "radio",
    "options": ["Key won''t turn", "Lock is stuck", "Key broken in lock", "Want to replace lock", "Multiple issues"],
    "required": true
  },
  {
    "key": "door_type", 
    "label": "Door type?",
    "type": "radio",
    "options": ["Front door", "Back door", "Internal door", "Security door", "Multiple doors"],
    "required": true
  },
  {
    "key": "lock_type",
    "label": "Lock type?",
    "type": "radio",
    "options": ["Standard cylinder", "Mortice lock", "Smart lock", "Multi-point lock", "Unsure"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Fix door lock';