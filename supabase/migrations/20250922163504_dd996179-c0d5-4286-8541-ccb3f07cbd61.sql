-- Fix: Add question sets for priority services using direct service lookups

-- 1. Builder - General Building
INSERT INTO service_questions (service_id, questions)
SELECT s.id, '{
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
    }
  ]
}'::jsonb
FROM services s
WHERE s.category = 'Builder' AND s.micro = 'General Building';

-- 2. Plumber - Tap Repairs
INSERT INTO service_questions (service_id, questions)
SELECT s.id, '{
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
        {"value": "outdoor", "label": "Outdoor/garden tap", "price_impact": "medium"}
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
FROM services s
WHERE s.category = 'Plumber' AND s.micro = 'Tap Repairs';

-- 3. Electrician - Full House Rewiring
INSERT INTO service_questions (service_id, questions)
SELECT s.id, '{
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
    }
  ]
}'::jsonb
FROM services s
WHERE s.category = 'Electrician' AND s.micro = 'Full House Rewiring';

-- 4. Handyman - TV Mounting
INSERT INTO service_questions (service_id, questions)
SELECT s.id, '{
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
        {"value": "glass_tile", "label": "Glass/tiled wall", "price_impact": "high"}
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
    }
  ]
}'::jsonb
FROM services s
WHERE s.category = 'Handyman' AND s.micro = 'TV Mounting';

-- 5. Building Design - Floor Plans
INSERT INTO service_questions (service_id, questions)
SELECT s.id, '{
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
        {"value": "large", "label": "Large (5+ bedrooms)", "price_impact": "high"}
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
        {"value": "building_regs", "label": "Building regulations package", "price_impact": "very_high"}
      ]
    }
  ]
}'::jsonb
FROM services s
WHERE s.category = 'Building Design' AND s.micro = 'Floor Plans & Layouts';