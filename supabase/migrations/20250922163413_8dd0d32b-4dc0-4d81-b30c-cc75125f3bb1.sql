-- Phase 4: Question Set Development for Priority Services
-- MC-first questions focusing on budget-impacting factors

-- Get service IDs for question creation
WITH service_ids AS (
  SELECT id, category, subcategory, micro 
  FROM services 
  WHERE (category, subcategory, micro) IN (
    ('Builder', 'General Building & Repairs', 'General Building'),
    ('Builder', 'Renovations & Extensions', 'Home Renovations'),
    ('Plumber', 'Plumbing Repairs', 'Tap Repairs'),
    ('Plumber', 'Bathroom Installations', 'Toilet Installation'),
    ('Electrician', 'Wiring & Rewiring', 'Full House Rewiring'),
    ('Electrician', 'Indoor Lighting', 'Ceiling Lights'),
    ('Carpenter', 'Doors & Frames', 'Door Fitting'),
    ('Carpenter', 'Kitchens & Cabinetry', 'Fitted Kitchens'),
    ('Handyman', 'General Repairs', 'General Odd Jobs'),
    ('Handyman', 'Assembly & Mounting', 'TV Mounting'),
    ('Painter & Decorator', 'Interior Painting', 'Wall Painting'),
    ('Painter & Decorator', 'Plastering', 'Wall Plastering'),
    ('Building Design', 'Full Home Design', 'Floor Plans & Layouts'),
    ('Building Design', 'Renovation Plans', 'Single-Storey Extensions')
  )
)

-- 1. BUILDER - General Building
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "project_type",
      "type": "multiple_choice",
      "question": "What type of building project do you need?",
      "required": true,
      "options": [
        {"value": "new_build", "label": "New construction/build", "price_impact": "high"},
        {"value": "major_renovation", "label": "Major renovation", "price_impact": "high"},
        {"value": "extension", "label": "Home extension", "price_impact": "medium"},
        {"value": "structural_work", "label": "Structural modifications", "price_impact": "high"},
        {"value": "general_repairs", "label": "General building repairs", "price_impact": "low"},
        {"value": "other", "label": "Other building work", "price_impact": "medium"}
      ]
    },
    {
      "id": "project_size",
      "type": "multiple_choice",
      "question": "What is the approximate size of your project?",
      "required": true,
      "options": [
        {"value": "small", "label": "Small (under 20m²)", "price_impact": "low"},
        {"value": "medium", "label": "Medium (20-50m²)", "price_impact": "medium"},
        {"value": "large", "label": "Large (50-100m²)", "price_impact": "high"},
        {"value": "very_large", "label": "Very large (over 100m²)", "price_impact": "very_high"}
      ]
    },
    {
      "id": "timeline",
      "type": "multiple_choice",
      "question": "What is your preferred timeline?",
      "required": true,
      "options": [
        {"value": "urgent", "label": "Urgent (within 2 weeks)", "price_impact": "high"},
        {"value": "normal", "label": "Normal (1-2 months)", "price_impact": "low"},
        {"value": "flexible", "label": "Flexible (2-6 months)", "price_impact": "low"}
      ]
    },
    {
      "id": "materials_preference",
      "type": "multiple_choice",
      "question": "What materials do you prefer?",
      "required": false,
      "options": [
        {"value": "standard", "label": "Standard/budget materials", "price_impact": "low"},
        {"value": "mid_range", "label": "Mid-range materials", "price_impact": "medium"},
        {"value": "premium", "label": "Premium/luxury materials", "price_impact": "high"},
        {"value": "eco_friendly", "label": "Eco-friendly/sustainable", "price_impact": "medium"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Builder' AND micro = 'General Building';

-- 2. PLUMBER - Tap Repairs
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "tap_issue",
      "type": "multiple_choice",
      "question": "What is the main issue with your tap?",
      "required": true,
      "options": [
        {"value": "dripping", "label": "Dripping/leaking", "price_impact": "low"},
        {"value": "no_water", "label": "No water coming out", "price_impact": "medium"},
        {"value": "low_pressure", "label": "Low water pressure", "price_impact": "medium"},
        {"value": "broken_handle", "label": "Broken handle/mechanism", "price_impact": "medium"},
        {"value": "replacement_needed", "label": "Full tap replacement needed", "price_impact": "high"}
      ]
    },
    {
      "id": "tap_location",
      "type": "multiple_choice",
      "question": "Where is the tap located?",
      "required": true,
      "options": [
        {"value": "kitchen_sink", "label": "Kitchen sink", "price_impact": "low"},
        {"value": "bathroom_basin", "label": "Bathroom basin", "price_impact": "low"},
        {"value": "bath_tub", "label": "Bath tub", "price_impact": "medium"},
        {"value": "shower", "label": "Shower", "price_impact": "medium"},
        {"value": "outdoor", "label": "Outdoor/garden tap", "price_impact": "medium"},
        {"value": "utility", "label": "Utility room/laundry", "price_impact": "low"}
      ]
    },
    {
      "id": "urgency",
      "type": "multiple_choice",
      "question": "How urgent is this repair?",
      "required": true,
      "options": [
        {"value": "emergency", "label": "Emergency (flooding/major leak)", "price_impact": "high"},
        {"value": "urgent", "label": "Urgent (within 24 hours)", "price_impact": "medium"},
        {"value": "soon", "label": "Soon (within a week)", "price_impact": "low"},
        {"value": "convenient", "label": "When convenient", "price_impact": "low"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Plumber' AND micro = 'Tap Repairs';

-- 3. ELECTRICIAN - Full House Rewiring
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "property_size",
      "type": "multiple_choice",
      "question": "What size property needs rewiring?",
      "required": true,
      "options": [
        {"value": "1_bed", "label": "1 bedroom apartment/flat", "price_impact": "low"},
        {"value": "2_bed", "label": "2 bedroom house/flat", "price_impact": "medium"},
        {"value": "3_bed", "label": "3 bedroom house", "price_impact": "medium"},
        {"value": "4_bed", "label": "4 bedroom house", "price_impact": "high"},
        {"value": "large_house", "label": "Large house (5+ bedrooms)", "price_impact": "very_high"}
      ]
    },
    {
      "id": "rewire_scope",
      "type": "multiple_choice",
      "question": "What scope of rewiring do you need?",
      "required": true,
      "options": [
        {"value": "full_rewire", "label": "Complete full rewiring", "price_impact": "very_high"},
        {"value": "partial_rewire", "label": "Partial rewiring (specific areas)", "price_impact": "high"},
        {"value": "consumer_unit", "label": "Consumer unit upgrade only", "price_impact": "medium"},
        {"value": "additional_circuits", "label": "Additional circuits/sockets", "price_impact": "medium"}
      ]
    },
    {
      "id": "current_wiring_age",
      "type": "multiple_choice",
      "question": "How old is the current wiring?",
      "required": true,
      "options": [
        {"value": "very_old", "label": "Very old (30+ years)", "price_impact": "high"},
        {"value": "old", "label": "Old (15-30 years)", "price_impact": "medium"},
        {"value": "recent", "label": "Recent (under 15 years)", "price_impact": "low"},
        {"value": "unknown", "label": "Not sure/unknown", "price_impact": "medium"}
      ]
    },
    {
      "id": "smart_features",
      "type": "multiple_choice",
      "question": "Do you want smart home features included?",
      "required": false,
      "options": [
        {"value": "none", "label": "No smart features", "price_impact": "low"},
        {"value": "basic", "label": "Basic smart switches/sockets", "price_impact": "medium"},
        {"value": "full_system", "label": "Full smart home system", "price_impact": "high"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Electrician' AND micro = 'Full House Rewiring';

-- 4. CARPENTER - Door Fitting
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "door_type",
      "type": "multiple_choice",
      "question": "What type of door do you need fitted?",
      "required": true,
      "options": [
        {"value": "internal_standard", "label": "Internal standard door", "price_impact": "low"},
        {"value": "internal_fire", "label": "Internal fire door", "price_impact": "medium"},
        {"value": "external_front", "label": "External front door", "price_impact": "high"},
        {"value": "external_back", "label": "External back door", "price_impact": "medium"},
        {"value": "bifold", "label": "Bi-fold doors", "price_impact": "high"},
        {"value": "sliding", "label": "Sliding doors", "price_impact": "high"}
      ]
    },
    {
      "id": "door_material",
      "type": "multiple_choice",
      "question": "What material door do you prefer?",
      "required": true,
      "options": [
        {"value": "standard_wood", "label": "Standard timber/wood", "price_impact": "low"},
        {"value": "hardwood", "label": "Hardwood (oak, mahogany)", "price_impact": "high"},
        {"value": "composite", "label": "Composite door", "price_impact": "medium"},
        {"value": "upvc", "label": "uPVC door", "price_impact": "medium"},
        {"value": "glass", "label": "Glass door/French doors", "price_impact": "high"}
      ]
    },
    {
      "id": "frame_work",
      "type": "multiple_choice",
      "question": "What frame work is needed?",
      "required": true,
      "options": [
        {"value": "existing_frame", "label": "Use existing frame", "price_impact": "low"},
        {"value": "adjust_frame", "label": "Adjust existing frame", "price_impact": "medium"},
        {"value": "new_frame", "label": "New frame required", "price_impact": "high"},
        {"value": "structural_work", "label": "Structural opening work", "price_impact": "very_high"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Carpenter' AND micro = 'Door Fitting';

-- 5. HANDYMAN - TV Mounting
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "tv_size",
      "type": "multiple_choice",
      "question": "What size TV do you need mounted?",
      "required": true,
      "options": [
        {"value": "small", "label": "Small (under 40 inches)", "price_impact": "low"},
        {"value": "medium", "label": "Medium (40-55 inches)", "price_impact": "low"},
        {"value": "large", "label": "Large (55-75 inches)", "price_impact": "medium"},
        {"value": "very_large", "label": "Very large (75+ inches)", "price_impact": "high"}
      ]
    },
    {
      "id": "wall_type",
      "type": "multiple_choice",
      "question": "What type of wall will the TV be mounted on?",
      "required": true,
      "options": [
        {"value": "drywall_stud", "label": "Drywall with wooden studs", "price_impact": "low"},
        {"value": "solid_wall", "label": "Solid brick/concrete wall", "price_impact": "low"},
        {"value": "plasterboard_hollow", "label": "Hollow plasterboard wall", "price_impact": "medium"},
        {"value": "glass_tile", "label": "Glass/tiled wall", "price_impact": "high"},
        {"value": "unsure", "label": "Not sure what type", "price_impact": "medium"}
      ]
    },
    {
      "id": "mount_type",
      "type": "multiple_choice",
      "question": "What type of TV mount do you want?",
      "required": true,
      "options": [
        {"value": "fixed", "label": "Fixed mount (non-moving)", "price_impact": "low"},
        {"value": "tilting", "label": "Tilting mount", "price_impact": "low"},
        {"value": "full_motion", "label": "Full motion/articulating", "price_impact": "medium"}
      ]
    },
    {
      "id": "cable_management",
      "type": "multiple_choice",
      "question": "Do you need cable management/hiding?",
      "required": false,
      "options": [
        {"value": "none", "label": "No cable work needed", "price_impact": "low"},
        {"value": "basic_hiding", "label": "Basic cable hiding/trunking", "price_impact": "medium"},
        {"value": "wall_chase", "label": "Cables run inside wall", "price_impact": "high"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Handyman' AND micro = 'TV Mounting';

-- 6. PAINTER & DECORATOR - Wall Painting
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "room_count",
      "type": "multiple_choice",
      "question": "How many rooms need painting?",
      "required": true,
      "options": [
        {"value": "one_room", "label": "One room", "price_impact": "low"},
        {"value": "two_three", "label": "2-3 rooms", "price_impact": "medium"},
        {"value": "four_five", "label": "4-5 rooms", "price_impact": "high"},
        {"value": "whole_house", "label": "Whole house", "price_impact": "very_high"}
      ]
    },
    {
      "id": "room_size",
      "type": "multiple_choice",
      "question": "What size are the rooms typically?",
      "required": true,
      "options": [
        {"value": "small", "label": "Small rooms (under 12m²)", "price_impact": "low"},
        {"value": "medium", "label": "Medium rooms (12-20m²)", "price_impact": "medium"},
        {"value": "large", "label": "Large rooms (over 20m²)", "price_impact": "high"},
        {"value": "mixed", "label": "Mixed room sizes", "price_impact": "medium"}
      ]
    },
    {
      "id": "surface_prep",
      "type": "multiple_choice",
      "question": "What surface preparation is needed?",
      "required": true,
      "options": [
        {"value": "minimal", "label": "Minimal prep (good condition)", "price_impact": "low"},
        {"value": "standard", "label": "Standard prep (fill holes, sand)", "price_impact": "medium"},
        {"value": "extensive", "label": "Extensive prep (strip wallpaper, repair)", "price_impact": "high"},
        {"value": "new_plaster", "label": "New plaster/first coat", "price_impact": "medium"}
      ]
    },
    {
      "id": "paint_quality",
      "type": "multiple_choice",
      "question": "What paint quality do you prefer?",
      "required": false,
      "options": [
        {"value": "budget", "label": "Budget/standard paint", "price_impact": "low"},
        {"value": "mid_range", "label": "Mid-range paint", "price_impact": "medium"},
        {"value": "premium", "label": "Premium/designer paint", "price_impact": "high"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Painter & Decorator' AND micro = 'Wall Painting';

-- 7. BUILDING DESIGN - Floor Plans & Layouts
INSERT INTO service_questions (service_id, questions)
SELECT id, '{
  "questions": [
    {
      "id": "project_type",
      "type": "multiple_choice",
      "question": "What type of design project do you need?",
      "required": true,
      "options": [
        {"value": "new_build", "label": "New build house design", "price_impact": "very_high"},
        {"value": "extension", "label": "Home extension design", "price_impact": "high"},
        {"value": "renovation", "label": "Renovation/reconfiguration", "price_impact": "medium"},
        {"value": "loft_conversion", "label": "Loft conversion design", "price_impact": "medium"},
        {"value": "garage_conversion", "label": "Garage conversion design", "price_impact": "low"}
      ]
    },
    {
      "id": "property_size",
      "type": "multiple_choice",
      "question": "What is the property size/scale?",
      "required": true,
      "options": [
        {"value": "small", "label": "Small (1-2 bedrooms)", "price_impact": "low"},
        {"value": "medium", "label": "Medium (3-4 bedrooms)", "price_impact": "medium"},
        {"value": "large", "label": "Large (5+ bedrooms)", "price_impact": "high"},
        {"value": "commercial", "label": "Commercial property", "price_impact": "very_high"}
      ]
    },
    {
      "id": "deliverables",
      "type": "multiple_choice",
      "question": "What deliverables do you need?",
      "required": true,
      "options": [
        {"value": "basic_plans", "label": "Basic floor plans only", "price_impact": "low"},
        {"value": "full_plans", "label": "Full architectural plans", "price_impact": "medium"},
        {"value": "planning_application", "label": "Planning application drawings", "price_impact": "high"},
        {"value": "building_regs", "label": "Building regulations package", "price_impact": "very_high"},
        {"value": "3d_visuals", "label": "Include 3D visualisations", "price_impact": "high"}
      ]
    },
    {
      "id": "timeline",
      "type": "multiple_choice",
      "question": "What is your project timeline?",
      "required": true,
      "options": [
        {"value": "urgent", "label": "Urgent (2-4 weeks)", "price_impact": "high"},
        {"value": "normal", "label": "Normal (1-2 months)", "price_impact": "low"},
        {"value": "relaxed", "label": "Flexible (3+ months)", "price_impact": "low"}
      ]
    }
  ]
}'::jsonb
FROM service_ids WHERE category = 'Building Design' AND micro = 'Floor Plans & Layouts';