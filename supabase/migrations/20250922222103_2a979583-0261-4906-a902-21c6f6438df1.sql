-- Seed data for services_micro table with dual question layers
-- This demonstrates the integration playbook's micro-service + logistics questions structure

INSERT INTO public.services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES 
-- Construction category
('Construction', 'Renovation', 'Kitchen Remodel', 
'[
  {
    "id": "kitchen_size",
    "label": "Kitchen size (square meters)",
    "type": "number",
    "required": true,
    "priceImpact": 100
  },
  {
    "id": "cabinets_needed",
    "label": "Do you need new cabinets?",
    "type": "boolean",
    "required": true,
    "priceImpact": 2000
  },
  {
    "id": "appliances",
    "label": "Which appliances need replacing?",
    "type": "multi",
    "required": false,
    "options": [
      {"value": "refrigerator", "label": "Refrigerator"},
      {"value": "oven", "label": "Oven"},
      {"value": "dishwasher", "label": "Dishwasher"},
      {"value": "microwave", "label": "Microwave"}
    ],
    "priceImpact": 500
  }
]',
'[
  {
    "id": "property_address",
    "label": "Property address",
    "type": "text",
    "required": true
  },
  {
    "id": "access_restrictions",
    "label": "Any access restrictions (narrow stairs, etc.)?",
    "type": "text",
    "required": false
  },
  {
    "id": "preferred_start_date",
    "label": "Preferred start date",
    "type": "date",
    "required": true
  },
  {
    "id": "budget_range",
    "label": "Budget range",
    "type": "select",
    "required": true,
    "options": [
      {"value": "5000-10000", "label": "€5,000 - €10,000"},
      {"value": "10000-20000", "label": "€10,000 - €20,000"},
      {"value": "20000-50000", "label": "€20,000 - €50,000"},
      {"value": "50000+", "label": "€50,000+"}
    ]
  },
  {
    "id": "contact_preference",
    "label": "Preferred contact method",
    "type": "select",
    "required": true,
    "options": [
      {"value": "phone", "label": "Phone"},
      {"value": "email", "label": "Email"},
      {"value": "whatsapp", "label": "WhatsApp"}
    ]
  }
]'),

('Construction', 'Maintenance', 'Pool Cleaning',
'[
  {
    "id": "pool_type",
    "label": "Pool type",
    "type": "select",
    "required": true,
    "options": [
      {"value": "chlorine", "label": "Chlorine pool"},
      {"value": "saltwater", "label": "Salt water pool"},
      {"value": "natural", "label": "Natural pool"}
    ],
    "priceImpact": 50
  },
  {
    "id": "pool_size",
    "label": "Pool size (cubic meters)",
    "type": "number",
    "required": true,
    "priceImpact": 5
  },
  {
    "id": "service_frequency",
    "label": "How often do you need cleaning?",
    "type": "select",
    "required": true,
    "options": [
      {"value": "weekly", "label": "Weekly"},
      {"value": "biweekly", "label": "Bi-weekly"},
      {"value": "monthly", "label": "Monthly"},
      {"value": "oneoff", "label": "One-off cleaning"}
    ],
    "priceImpact": -20
  }
]',
'[
  {
    "id": "property_address",
    "label": "Property address",
    "type": "text",
    "required": true
  },
  {
    "id": "pool_access",
    "label": "How to access the pool area?",
    "type": "text",
    "required": true
  },
  {
    "id": "preferred_day",
    "label": "Preferred day of week",
    "type": "select",
    "required": false,
    "options": [
      {"value": "monday", "label": "Monday"},
      {"value": "tuesday", "label": "Tuesday"},
      {"value": "wednesday", "label": "Wednesday"},
      {"value": "thursday", "label": "Thursday"},
      {"value": "friday", "label": "Friday"},
      {"value": "saturday", "label": "Saturday"},
      {"value": "sunday", "label": "Sunday"}
    ]
  },
  {
    "id": "emergency_contact",
    "label": "Emergency contact number",
    "type": "text",
    "required": true
  }
]'),

('Home Services', 'Cleaning', 'Deep House Clean',
'[
  {
    "id": "house_size",
    "label": "House size (square meters)",
    "type": "number",
    "required": true,
    "priceImpact": 2
  },
  {
    "id": "bedrooms",
    "label": "Number of bedrooms",
    "type": "number",
    "required": true,
    "priceImpact": 25
  },
  {
    "id": "bathrooms",
    "label": "Number of bathrooms",
    "type": "number",
    "required": true,
    "priceImpact": 30
  },
  {
    "id": "special_requirements",
    "label": "Any special cleaning requirements?",
    "type": "multi",
    "required": false,
    "options": [
      {"value": "windows", "label": "Window cleaning"},
      {"value": "carpets", "label": "Carpet deep clean"},
      {"value": "oven", "label": "Oven cleaning"},
      {"value": "fridge", "label": "Refrigerator cleaning"}
    ],
    "priceImpact": 40
  }
]',
'[
  {
    "id": "property_address",
    "label": "Property address",
    "type": "text",
    "required": true
  },
  {
    "id": "property_access",
    "label": "How will cleaners access the property?",
    "type": "select",
    "required": true,
    "options": [
      {"value": "owner_present", "label": "I will be present"},
      {"value": "key_exchange", "label": "Key exchange"},
      {"value": "lockbox", "label": "Lockbox/Key safe"},
      {"value": "concierge", "label": "Building concierge"}
    ]
  },
  {
    "id": "preferred_date",
    "label": "Preferred date",
    "type": "date",
    "required": true
  },
  {
    "id": "time_preference",
    "label": "Time preference",
    "type": "select",
    "required": true,
    "options": [
      {"value": "morning", "label": "Morning (8-12)"},
      {"value": "afternoon", "label": "Afternoon (12-17)"},
      {"value": "evening", "label": "Evening (17-20)"},
      {"value": "flexible", "label": "Flexible"}
    ]
  }
]'),

('Professional Services', 'Legal', 'Property Contract Review',
'[
  {
    "id": "contract_type",
    "label": "Type of property contract",
    "type": "select",
    "required": true,
    "options": [
      {"value": "purchase", "label": "Purchase agreement"},
      {"value": "rental", "label": "Rental agreement"},
      {"value": "construction", "label": "Construction contract"},
      {"value": "management", "label": "Property management"}
    ],
    "priceImpact": 100
  },
  {
    "id": "property_value",
    "label": "Property value range",
    "type": "select",
    "required": true,
    "options": [
      {"value": "under_500k", "label": "Under €500,000"},
      {"value": "500k_1m", "label": "€500,000 - €1,000,000"},
      {"value": "1m_5m", "label": "€1,000,000 - €5,000,000"},
      {"value": "over_5m", "label": "Over €5,000,000"}
    ],
    "priceImpact": 200
  },
  {
    "id": "urgency",
    "label": "How urgent is this review?",
    "type": "select",
    "required": true,
    "options": [
      {"value": "standard", "label": "Standard (7-10 days)"},
      {"value": "express", "label": "Express (3-5 days)"},
      {"value": "urgent", "label": "Urgent (24-48 hours)"}
    ],
    "priceImpact": 300
  }
]',
'[
  {
    "id": "client_name",
    "label": "Full name",
    "type": "text",
    "required": true
  },
  {
    "id": "contact_phone",
    "label": "Phone number",
    "type": "text",
    "required": true
  },
  {
    "id": "meeting_preference",
    "label": "Meeting preference",
    "type": "select",
    "required": true,
    "options": [
      {"value": "office", "label": "In-office meeting"},
      {"value": "video_call", "label": "Video call"},
      {"value": "phone_call", "label": "Phone call"},
      {"value": "email_only", "label": "Email correspondence only"}
    ]
  },
  {
    "id": "deadline",
    "label": "When do you need this completed?",
    "type": "date",
    "required": true
  }
]');

-- Copy existing services data to services_micro for backward compatibility
INSERT INTO public.services_micro (category, subcategory, micro, questions_micro, questions_logistics)
SELECT 
  category,
  subcategory,
  micro,
  '[]'::jsonb as questions_micro,
  '[]'::jsonb as questions_logistics
FROM public.services 
WHERE NOT EXISTS (
  SELECT 1 FROM public.services_micro sm 
  WHERE sm.category = services.category 
  AND sm.subcategory = services.subcategory 
  AND sm.micro = services.micro
);