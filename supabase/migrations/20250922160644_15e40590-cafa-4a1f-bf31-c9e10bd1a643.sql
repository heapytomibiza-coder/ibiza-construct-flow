-- Add remaining 12 service questions to complete top 24

-- 13. Carpet Cleaning
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "carpet_area",
    "label": "Area to clean?",
    "type": "radio",
    "options": ["Single room", "2-3 rooms", "Whole house", "Stairs included"],
    "required": true
  },
  {
    "key": "carpet_condition",
    "label": "Carpet condition?",
    "type": "radio",
    "options": ["Light cleaning", "Heavy staining", "Pet odors", "Deep clean needed"],
    "required": true
  },
  {
    "key": "carpet_type",
    "label": "Carpet type?",
    "type": "radio",
    "options": ["Standard carpet", "Wool/Delicate", "Rugs only", "Mixed types"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Carpet Cleaning';

-- 14. House Cleaning
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "cleaning_type",
    "label": "Cleaning type?",
    "type": "radio",
    "options": ["Regular maintenance", "One-off clean", "End of tenancy", "Post-party cleanup"],
    "required": true
  },
  {
    "key": "property_size",
    "label": "Property size?", 
    "type": "radio",
    "options": ["Studio/1 bed", "2-3 bedrooms", "4-5 bedrooms", "6+ bedrooms"],
    "required": true
  },
  {
    "key": "cleaning_frequency",
    "label": "If regular, how often?",
    "type": "radio",
    "options": ["Weekly", "Fortnightly", "Monthly", "One-off only"],
    "required": false
  }
]'::jsonb, 1
FROM services WHERE micro = 'House Cleaning';

-- 15. Post-Party Cleanup
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "party_size",
    "label": "Party size?",
    "type": "radio",
    "options": ["Small (10-20 people)", "Medium (20-50 people)", "Large (50+ people)", "Wedding/Big event"],
    "required": true
  },
  {
    "key": "cleanup_scope",
    "label": "Cleanup needed?",
    "type": "radio",
    "options": ["Indoor only", "Outdoor only", "Indoor + outdoor", "Full property"],
    "required": true
  },
  {
    "key": "mess_level",
    "label": "Mess level?",
    "type": "radio",
    "options": ["Light (glasses/plates)", "Moderate (spills/food)", "Heavy (decorations/damage)", "Extreme cleanup"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Post-Party Cleanup';

-- 16. Roof Repair
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "roof_issue",
    "label": "What''s the problem?",
    "type": "radio",
    "options": ["Leaking", "Missing tiles", "Damaged flashing", "Gutter issues", "Multiple problems"],
    "required": true
  },
  {
    "key": "roof_type",
    "label": "Roof type?",
    "type": "radio",
    "options": ["Tile roof", "Metal sheets", "Flat roof", "Slate", "Unsure"],
    "required": true
  },
  {
    "key": "urgency",
    "label": "Urgency level?",
    "type": "radio",
    "options": ["Emergency (active leak)", "Urgent (recent damage)", "Maintenance needed", "Preventive check"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Roof repair';

-- 17. Kitchen Remodel
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "remodel_scope",
    "label": "Remodel scope?",
    "type": "radio",
    "options": ["Full renovation", "Cabinet replacement", "Countertop only", "Appliance installation"],
    "required": true
  },
  {
    "key": "kitchen_size",
    "label": "Kitchen size?",
    "type": "radio",
    "options": ["Small (< 10m²)", "Medium (10-15m²)", "Large (15-25m²)", "Very large (25m²+)"],
    "required": true
  },
  {
    "key": "timeline",
    "label": "Preferred timeline?",
    "type": "radio",
    "options": ["1-2 weeks", "3-4 weeks", "1-2 months", "Flexible timing"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Kitchen remodel';

-- 18. Bathroom Remodel  
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "bathroom_scope",
    "label": "Remodel scope?",
    "type": "radio",
    "options": ["Full renovation", "Tiling only", "Fixtures replacement", "Shower installation"],
    "required": true
  },
  {
    "key": "bathroom_size",
    "label": "Bathroom size?",
    "type": "radio", 
    "options": ["Powder room", "Standard bathroom", "Large bathroom", "En-suite"],
    "required": true
  },
  {
    "key": "waterproofing",
    "label": "Waterproofing needed?",
    "type": "radio",
    "options": ["Yes, full waterproofing", "Partial areas", "Repair existing", "Unsure"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Bathroom remodel';

-- 19. Foundation Work
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "foundation_issue",
    "label": "Foundation issue?", 
    "type": "radio",
    "options": ["Cracks visible", "Settlement/sinking", "Water damage", "Preventive work"],
    "required": true
  },
  {
    "key": "building_type",
    "label": "Building type?",
    "type": "radio",
    "options": ["Single story", "Two story", "Multi-level", "Commercial"],
    "required": true
  },
  {
    "key": "soil_conditions",
    "label": "Soil conditions?",
    "type": "radio",
    "options": ["Rocky/stable", "Clay soil", "Sandy soil", "Unknown"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Foundation work';

-- 20. Rewiring
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "rewiring_scope",
    "label": "Rewiring scope?",
    "type": "radio", 
    "options": ["Whole house", "Single room", "Partial/upgrade", "Add circuits only"],
    "required": true
  },
  {
    "key": "current_wiring",
    "label": "Current wiring age?",
    "type": "radio",
    "options": ["Very old (50+ years)", "Older (20-50 years)", "Recent (< 20 years)", "Unsure"],
    "required": true
  },
  {
    "key": "safety_concerns",
    "label": "Safety concerns?",
    "type": "radio",
    "options": ["Sparking/burning", "Frequent trips", "No RCD protection", "General upgrade"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Rewiring';

-- 21. Furniture Delivery
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "delivery_type",
    "label": "Delivery type?",
    "type": "radio",
    "options": ["Standard delivery", "White glove service", "Assembly included", "Install + setup"],
    "required": true
  },
  {
    "key": "furniture_size",
    "label": "Furniture size?", 
    "type": "radio",
    "options": ["Small items", "Medium (sofa/table)", "Large (wardrobe/bed)", "Multiple large items"],
    "required": true
  },
  {
    "key": "access_difficulty",
    "label": "Delivery access?",
    "type": "radio",
    "options": ["Ground floor, easy", "Stairs required", "Narrow access", "Elevator available"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Furniture Delivery';

-- 22. Same Day Delivery
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "item_type",
    "label": "Item type?",
    "type": "radio",
    "options": ["Documents", "Small package", "Large package", "Multiple items"],
    "required": true
  },
  {
    "key": "delivery_distance",
    "label": "Delivery distance?",
    "type": "radio",
    "options": ["Within Ibiza Town", "Cross-island", "To airport", "Multiple stops"],
    "required": true
  },
  {
    "key": "urgency",
    "label": "How urgent?",
    "type": "radio",
    "options": ["Within 2 hours", "Within 4 hours", "Same day OK", "ASAP"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Same Day Delivery';

-- 23. Personal Shopping
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "shopping_type",
    "label": "Shopping type?",
    "type": "radio",
    "options": ["Groceries", "Clothing/Fashion", "Home goods", "Mixed shopping"],
    "required": true
  },
  {
    "key": "budget_range",
    "label": "Budget range?",
    "type": "radio",
    "options": ["€50-150", "€150-300", "€300-500", "€500+"],
    "required": true
  },
  {
    "key": "delivery_preference",
    "label": "Delivery preference?",
    "type": "radio",
    "options": ["Deliver to me", "I''ll collect", "Meet at store", "Flexible"],
    "required": true
  }
]'::jsonb, 1  
FROM services WHERE micro = 'Personal Shopping';

-- 24. Grocery Shopping
INSERT INTO service_questions(service_id, questions, version)
SELECT id, '[
  {
    "key": "grocery_scope",
    "label": "Grocery scope?",
    "type": "radio",
    "options": ["Weekly shop", "Top-up shop", "Special items", "Bulk shopping"],
    "required": true
  },
  {
    "key": "dietary_requirements",
    "label": "Special requirements?",
    "type": "radio",
    "options": ["No restrictions", "Organic preferred", "Dietary restrictions", "Brand specific"],
    "required": true
  },
  {
    "key": "shopping_budget",
    "label": "Shopping budget?",
    "type": "radio",
    "options": ["€30-80", "€80-150", "€150-250", "€250+"],
    "required": true
  }
]'::jsonb, 1
FROM services WHERE micro = 'Grocery Shopping';