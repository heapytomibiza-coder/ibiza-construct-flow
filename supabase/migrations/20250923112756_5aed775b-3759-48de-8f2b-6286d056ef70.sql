-- Insert Transport & Deliveries services with questions
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES

-- Household & Personal Moving
('Transport & Deliveries', 'Household & Personal Moving', 'Local moving (same city/island)', 
'[
  {"id": "load_size", "label": "What size is your move?", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (1-2 rooms)"},
    {"value": "medium", "label": "Medium (3-4 rooms)"},
    {"value": "large", "label": "Large (5+ rooms)"}
  ]},
  {"id": "property_type", "label": "Property type", "type": "select", "required": true, "options": [
    {"value": "apartment", "label": "Apartment/Flat"},
    {"value": "house", "label": "House"},
    {"value": "office", "label": "Office/Commercial"}
  ]},
  {"id": "fragile_items", "label": "Do you have fragile or valuable items?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within 24 hours"},
    {"value": "week", "label": "Within a week"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "access_from", "label": "Access at pickup location", "type": "select", "required": true, "options": [
    {"value": "ground_floor", "label": "Ground floor"},
    {"value": "stairs", "label": "Stairs required"},
    {"value": "elevator", "label": "Elevator available"},
    {"value": "restricted", "label": "Restricted parking/access"}
  ]},
  {"id": "access_to", "label": "Access at delivery location", "type": "select", "required": true, "options": [
    {"value": "ground_floor", "label": "Ground floor"},
    {"value": "stairs", "label": "Stairs required"},
    {"value": "elevator", "label": "Elevator available"},
    {"value": "restricted", "label": "Restricted parking/access"}
  ]}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Long-distance moving (mainland/other regions)',
'[
  {"id": "load_size", "label": "What size is your move?", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (1-2 rooms)"},
    {"value": "medium", "label": "Medium (3-4 rooms)"},
    {"value": "large", "label": "Large (5+ rooms)"}
  ]},
  {"id": "distance", "label": "Approximate distance", "type": "select", "required": true, "options": [
    {"value": "regional", "label": "Regional (within mainland)"},
    {"value": "national", "label": "National (cross-country)"},
    {"value": "international", "label": "International"}
  ]},
  {"id": "packing_needed", "label": "Do you need packing services?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "storage_needed", "label": "Do you need temporary storage?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Small moves (student moves, single room, partial load)',
'[
  {"id": "items", "label": "What are you moving?", "type": "select", "required": true, "options": [
    {"value": "bedroom", "label": "Single bedroom"},
    {"value": "student", "label": "Student dorm/room"},
    {"value": "few_items", "label": "Just a few items"},
    {"value": "boxes", "label": "Mostly boxes"}
  ]},
  {"id": "vehicle_access", "label": "Vehicle access needed?", "type": "select", "required": true, "options": [
    {"value": "car", "label": "Car/small van sufficient"},
    {"value": "van", "label": "Medium van needed"},
    {"value": "truck", "label": "Small truck needed"}
  ]}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Same day/next day"},
    {"value": "week", "label": "Within a week"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "help_needed", "label": "Do you need help loading/unloading?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Full house moves',
'[
  {"id": "house_size", "label": "House size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "1-2 bedroom house"},
    {"value": "medium", "label": "3-4 bedroom house"},
    {"value": "large", "label": "5+ bedroom house"}
  ]},
  {"id": "basement_attic", "label": "Do you have basement/attic items?", "type": "boolean", "required": false},
  {"id": "garden_items", "label": "Do you have garden/outdoor items?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "crew_size", "label": "Preferred crew size", "type": "select", "required": false, "options": [
    {"value": "small", "label": "2-3 people"},
    {"value": "medium", "label": "4-5 people"},
    {"value": "large", "label": "6+ people"}
  ]}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Furniture moving (single heavy item, sofa, piano, appliance)',
'[
  {"id": "item_type", "label": "What type of item?", "type": "select", "required": true, "options": [
    {"value": "sofa", "label": "Sofa/Couch"},
    {"value": "piano", "label": "Piano"},
    {"value": "appliance", "label": "Large appliance"},
    {"value": "wardrobe", "label": "Wardrobe/Cabinet"},
    {"value": "other", "label": "Other heavy item"}
  ]},
  {"id": "weight_estimate", "label": "Estimated weight", "type": "select", "required": true, "options": [
    {"value": "light", "label": "Under 50kg"},
    {"value": "medium", "label": "50-150kg"},
    {"value": "heavy", "label": "Over 150kg"}
  ]},
  {"id": "disassembly", "label": "Does it need disassembly/reassembly?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Same day/next day"},
    {"value": "week", "label": "Within a week"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "special_equipment", "label": "Special equipment needed?", "type": "select", "required": false, "options": [
    {"value": "dolly", "label": "Moving dolly"},
    {"value": "straps", "label": "Heavy duty straps"},
    {"value": "crane", "label": "Crane/hoist"},
    {"value": "none", "label": "No special equipment"}
  ]}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Fragile/specialist moves (artwork, antiques, instruments)',
'[
  {"id": "item_category", "label": "Type of fragile items", "type": "select", "required": true, "options": [
    {"value": "artwork", "label": "Artwork/Paintings"},
    {"value": "antiques", "label": "Antiques"},
    {"value": "instruments", "label": "Musical instruments"},
    {"value": "electronics", "label": "Sensitive electronics"},
    {"value": "other", "label": "Other fragile items"}
  ]},
  {"id": "insurance_value", "label": "Estimated value for insurance", "type": "select", "required": true, "options": [
    {"value": "low", "label": "Under €1,000"},
    {"value": "medium", "label": "€1,000 - €10,000"},
    {"value": "high", "label": "Over €10,000"}
  ]},
  {"id": "special_packing", "label": "Do you have original packaging?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "climate_control", "label": "Climate controlled transport needed?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Packing & unpacking services',
'[
  {"id": "service_type", "label": "What service do you need?", "type": "select", "required": true, "options": [
    {"value": "packing_only", "label": "Packing only"},
    {"value": "unpacking_only", "label": "Unpacking only"},
    {"value": "both", "label": "Both packing and unpacking"}
  ]},
  {"id": "room_count", "label": "How many rooms?", "type": "select", "required": true, "options": [
    {"value": "1-2", "label": "1-2 rooms"},
    {"value": "3-4", "label": "3-4 rooms"},
    {"value": "5+", "label": "5+ rooms"}
  ]},
  {"id": "supplies_included", "label": "Do you need packing supplies?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within 24 hours"},
    {"value": "week", "label": "Within a week"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "crew_size", "label": "Preferred crew size", "type": "select", "required": false, "options": [
    {"value": "1", "label": "1 person"},
    {"value": "2", "label": "2 people"},
    {"value": "3+", "label": "3+ people"}
  ]}
]'),

('Transport & Deliveries', 'Household & Personal Moving', 'Storage & transport (pickup + storage + re-delivery)',
'[
  {"id": "storage_duration", "label": "How long do you need storage?", "type": "select", "required": true, "options": [
    {"value": "days", "label": "Few days"},
    {"value": "weeks", "label": "Few weeks"},
    {"value": "months", "label": "Few months"},
    {"value": "long_term", "label": "Long term (6+ months)"}
  ]},
  {"id": "storage_size", "label": "Storage space needed", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (few boxes)"},
    {"value": "medium", "label": "Medium (room contents)"},
    {"value": "large", "label": "Large (house contents)"}
  ]},
  {"id": "access_needed", "label": "Do you need access during storage?", "type": "boolean", "required": false}
]',
'[
  {"id": "pickup_timeline", "label": "When do you need pickup?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within 24 hours"},
    {"value": "week", "label": "Within a week"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "delivery_timeline", "label": "When do you need delivery?", "type": "select", "required": false, "options": [
    {"value": "unknown", "label": "Not sure yet"},
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"}
  ]}
]'),

-- Business & Commercial Moving
('Transport & Deliveries', 'Business & Commercial Moving', 'Office relocation (desks, IT equipment, filing cabinets)',
'[
  {"id": "office_size", "label": "Office size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small office (1-10 desks)"},
    {"value": "medium", "label": "Medium office (10-50 desks)"},
    {"value": "large", "label": "Large office (50+ desks)"}
  ]},
  {"id": "it_equipment", "label": "Amount of IT equipment", "type": "select", "required": true, "options": [
    {"value": "minimal", "label": "Minimal (computers, phones)"},
    {"value": "moderate", "label": "Moderate (servers, printers)"},
    {"value": "extensive", "label": "Extensive (server room, multiple servers)"}
  ]},
  {"id": "weekend_move", "label": "Does this need to be done on weekend?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "downtime_sensitive", "label": "Is minimal downtime critical?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Business & Commercial Moving', 'Shop/retail moves (displays, shelving, inventory)',
'[
  {"id": "shop_type", "label": "Type of retail space", "type": "select", "required": true, "options": [
    {"value": "small_shop", "label": "Small shop/boutique"},
    {"value": "retail_store", "label": "Medium retail store"},
    {"value": "large_retail", "label": "Large retail space"},
    {"value": "restaurant", "label": "Restaurant/Cafe"}
  ]},
  {"id": "inventory_amount", "label": "Amount of inventory", "type": "select", "required": true, "options": [
    {"value": "minimal", "label": "Minimal stock"},
    {"value": "moderate", "label": "Moderate stock"},
    {"value": "extensive", "label": "Large inventory"}
  ]},
  {"id": "fixtures", "label": "Do you have custom fixtures/displays?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "week", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "business_hours", "label": "Must be done outside business hours?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Business & Commercial Moving', 'Warehouse/industrial moves',
'[
  {"id": "facility_size", "label": "Facility size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small warehouse"},
    {"value": "medium", "label": "Medium warehouse"},
    {"value": "large", "label": "Large industrial facility"}
  ]},
  {"id": "equipment_type", "label": "Type of equipment", "type": "select", "required": true, "options": [
    {"value": "light", "label": "Light machinery/tools"},
    {"value": "heavy", "label": "Heavy machinery"},
    {"value": "specialized", "label": "Specialized industrial equipment"}
  ]},
  {"id": "crane_needed", "label": "Will crane/heavy lifting equipment be needed?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "month", "label": "Within a month"},
    {"value": "quarter", "label": "Within 3 months"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "permits_needed", "label": "Are special permits required?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Business & Commercial Moving', 'Exhibition/event transport (booths, staging, lighting, AV gear)',
'[
  {"id": "event_type", "label": "Type of event", "type": "select", "required": true, "options": [
    {"value": "trade_show", "label": "Trade show/Exhibition"},
    {"value": "conference", "label": "Conference"},
    {"value": "concert", "label": "Concert/Performance"},
    {"value": "corporate", "label": "Corporate event"}
  ]},
  {"id": "equipment_amount", "label": "Amount of equipment", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small setup (few boxes)"},
    {"value": "medium", "label": "Medium setup (booth/stage)"},
    {"value": "large", "label": "Large setup (full production)"}
  ]},
  {"id": "setup_help", "label": "Do you need help with setup/teardown?", "type": "boolean", "required": false}
]',
'[
  {"id": "event_date", "label": "Event date urgency", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Event is soon (within days)"},
    {"value": "planned", "label": "Event is planned (weeks)"},
    {"value": "advance", "label": "Planning in advance"}
  ]},
  {"id": "return_transport", "label": "Do you need return transport after event?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Business & Commercial Moving', 'Film/music equipment transport (DJ gear, production rigs, staging)',
'[
  {"id": "equipment_type", "label": "Type of equipment", "type": "select", "required": true, "options": [
    {"value": "dj", "label": "DJ equipment"},
    {"value": "band", "label": "Band/Musical instruments"},
    {"value": "av", "label": "Audio/Visual production"},
    {"value": "film", "label": "Film/Camera equipment"}
  ]},
  {"id": "fragility", "label": "Equipment fragility", "type": "select", "required": true, "options": [
    {"value": "standard", "label": "Standard handling"},
    {"value": "delicate", "label": "Delicate equipment"},
    {"value": "extremely_fragile", "label": "Extremely fragile/expensive"}
  ]},
  {"id": "cases", "label": "Do you have flight cases/protective cases?", "type": "boolean", "required": false}
]',
'[
  {"id": "event_timeline", "label": "Event timeline", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day delivery/pickup"},
    {"value": "event_weekend", "label": "Weekend event"},
    {"value": "flexible", "label": "Flexible timing"}
  ]},
  {"id": "load_in_help", "label": "Do you need help with load-in/load-out?", "type": "boolean", "required": false}
]'),

-- Vehicle Transport
('Transport & Deliveries', 'Vehicle Transport', 'Car transport (single-car trailer, multi-car carrier)',
'[
  {"id": "vehicle_count", "label": "How many vehicles?", "type": "select", "required": true, "options": [
    {"value": "single", "label": "Single vehicle"},
    {"value": "2-3", "label": "2-3 vehicles"},
    {"value": "multiple", "label": "4+ vehicles"}
  ]},
  {"id": "vehicle_type", "label": "Vehicle type", "type": "select", "required": true, "options": [
    {"value": "standard", "label": "Standard car"},
    {"value": "luxury", "label": "Luxury/Sports car"},
    {"value": "classic", "label": "Classic/Vintage car"},
    {"value": "suv", "label": "SUV/Large vehicle"}
  ]},
  {"id": "running_condition", "label": "Vehicle condition", "type": "select", "required": true, "options": [
    {"value": "running", "label": "Runs and drives"},
    {"value": "non_running", "label": "Non-running (needs winch)"}
  ]}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "distance", "label": "Transport distance", "type": "select", "required": true, "options": [
    {"value": "local", "label": "Local (same city)"},
    {"value": "regional", "label": "Regional"},
    {"value": "national", "label": "National"},
    {"value": "international", "label": "International"}
  ]}
]'),

('Transport & Deliveries', 'Vehicle Transport', 'Motorbike/scooter transport',
'[
  {"id": "bike_type", "label": "Type of bike", "type": "select", "required": true, "options": [
    {"value": "scooter", "label": "Scooter (under 250cc)"},
    {"value": "motorcycle", "label": "Motorcycle (250cc+)"},
    {"value": "touring", "label": "Touring bike"},
    {"value": "sport", "label": "Sport bike"}
  ]},
  {"id": "bike_condition", "label": "Bike condition", "type": "select", "required": true, "options": [
    {"value": "running", "label": "Runs perfectly"},
    {"value": "minor_issues", "label": "Minor issues"},
    {"value": "non_running", "label": "Non-running"}
  ]},
  {"id": "accessories", "label": "Are there accessories to transport?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "enclosed_trailer", "label": "Do you need enclosed trailer?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Vehicle Transport', 'Boat transport (trailered, crane + flatbed)',
'[
  {"id": "boat_size", "label": "Boat size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small boat (under 6m)"},
    {"value": "medium", "label": "Medium boat (6-10m)"},
    {"value": "large", "label": "Large boat (over 10m)"}
  ]},
  {"id": "boat_type", "label": "Boat type", "type": "select", "required": true, "options": [
    {"value": "sailing", "label": "Sailing boat"},
    {"value": "motor", "label": "Motor boat"},
    {"value": "jet_ski", "label": "Jet ski/PWC"},
    {"value": "other", "label": "Other watercraft"}
  ]},
  {"id": "trailer_included", "label": "Do you have a trailer?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "seasonal", "label": "Seasonal (before/after season)"}
  ]},
  {"id": "crane_access", "label": "Will crane access be needed?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Vehicle Transport', 'Campervan/caravan transport',
'[
  {"id": "rv_type", "label": "Type of RV", "type": "select", "required": true, "options": [
    {"value": "campervan", "label": "Campervan/Motorhome"},
    {"value": "travel_trailer", "label": "Travel trailer"},
    {"value": "fifth_wheel", "label": "Fifth wheel"},
    {"value": "pop_up", "label": "Pop-up trailer"}
  ]},
  {"id": "rv_size", "label": "Size category", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (under 7m)"},
    {"value": "medium", "label": "Medium (7-9m)"},
    {"value": "large", "label": "Large (over 9m)"}
  ]},
  {"id": "running_condition", "label": "Running condition", "type": "select", "required": true, "options": [
    {"value": "excellent", "label": "Runs perfectly"},
    {"value": "good", "label": "Good condition"},
    {"value": "needs_work", "label": "Needs mechanical work"}
  ]}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Within a week"},
    {"value": "month", "label": "Within a month"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "height_clearance", "label": "Are there height clearance concerns?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Vehicle Transport', 'Classic/exotic vehicle enclosed transport',
'[
  {"id": "vehicle_value", "label": "Estimated vehicle value", "type": "select", "required": true, "options": [
    {"value": "moderate", "label": "€10k - €50k"},
    {"value": "high", "label": "€50k - €200k"},
    {"value": "extreme", "label": "Over €200k"}
  ]},
  {"id": "vehicle_category", "label": "Vehicle category", "type": "select", "required": true, "options": [
    {"value": "classic", "label": "Classic car"},
    {"value": "exotic", "label": "Exotic/Supercar"},
    {"value": "race", "label": "Race car"},
    {"value": "collector", "label": "Collector vehicle"}
  ]},
  {"id": "modifications", "label": "Does the vehicle have modifications?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need this done?", "type": "select", "required": true, "options": [
    {"value": "flexible", "label": "I''m flexible (preferred)"},
    {"value": "month", "label": "Within a month"},
    {"value": "urgent", "label": "Within a week"}
  ]},
  {"id": "insurance_coverage", "label": "What insurance coverage do you need?", "type": "select", "required": true, "options": [
    {"value": "standard", "label": "Standard coverage"},
    {"value": "enhanced", "label": "Enhanced coverage"},
    {"value": "full_value", "label": "Full declared value"}
  ]}
]'),

-- Deliveries – Local & Same Day
('Transport & Deliveries', 'Deliveries – Local & Same Day', 'Small parcel delivery (documents, packages, urgent couriers)',
'[
  {"id": "parcel_size", "label": "Parcel size", "type": "select", "required": true, "options": [
    {"value": "envelope", "label": "Envelope/Documents"},
    {"value": "small_box", "label": "Small box/package"},
    {"value": "medium_box", "label": "Medium box"},
    {"value": "multiple", "label": "Multiple parcels"}
  ]},
  {"id": "urgency", "label": "Delivery urgency", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day delivery"},
    {"value": "next_day", "label": "Next day delivery"},
    {"value": "express", "label": "Express (within 2 hours)"}
  ]},
  {"id": "fragile", "label": "Are items fragile?", "type": "boolean", "required": false}
]',
'[
  {"id": "pickup_time", "label": "Preferred pickup time", "type": "select", "required": true, "options": [
    {"value": "asap", "label": "ASAP"},
    {"value": "morning", "label": "Morning (9-12)"},
    {"value": "afternoon", "label": "Afternoon (12-17)"},
    {"value": "evening", "label": "Evening (17-20)"}
  ]},
  {"id": "signature_required", "label": "Is signature required on delivery?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Deliveries – Local & Same Day', 'Grocery/food delivery (non-catering, personal shopping runs)',
'[
  {"id": "shopping_type", "label": "Type of shopping", "type": "select", "required": true, "options": [
    {"value": "grocery", "label": "Grocery shopping"},
    {"value": "pharmacy", "label": "Pharmacy items"},
    {"value": "specialty", "label": "Specialty store items"},
    {"value": "multiple", "label": "Multiple store run"}
  ]},
  {"id": "shopping_list", "label": "Do you have a specific list?", "type": "boolean", "required": false},
  {"id": "budget_range", "label": "Approximate budget", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Under €50"},
    {"value": "medium", "label": "€50-€150"},
    {"value": "large", "label": "Over €150"}
  ]}
]',
'[
  {"id": "delivery_time", "label": "When do you need delivery?", "type": "select", "required": true, "options": [
    {"value": "within_2h", "label": "Within 2 hours"},
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"}
  ]},
  {"id": "cold_items", "label": "Are there refrigerated items?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Deliveries – Local & Same Day', 'Furniture/appliance delivery (new store purchases, bulky goods)',
'[
  {"id": "item_type", "label": "Type of items", "type": "select", "required": true, "options": [
    {"value": "furniture", "label": "Furniture"},
    {"value": "appliances", "label": "Large appliances"},
    {"value": "electronics", "label": "Electronics/TV"},
    {"value": "mixed", "label": "Mixed bulky items"}
  ]},
  {"id": "item_size", "label": "Size of delivery", "type": "select", "required": true, "options": [
    {"value": "single", "label": "Single large item"},
    {"value": "few", "label": "Few items"},
    {"value": "room_set", "label": "Full room set"}
  ]},
  {"id": "assembly_needed", "label": "Does it need assembly?", "type": "boolean", "required": false}
]',
'[
  {"id": "delivery_window", "label": "Preferred delivery window", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "weekend", "label": "Weekend"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "install_service", "label": "Do you need installation service?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Deliveries – Local & Same Day', 'eBay/second-hand pickups',
'[
  {"id": "item_category", "label": "What type of item?", "type": "select", "required": true, "options": [
    {"value": "furniture", "label": "Furniture"},
    {"value": "electronics", "label": "Electronics"},
    {"value": "appliances", "label": "Appliances"},
    {"value": "collectibles", "label": "Collectibles/Antiques"},
    {"value": "other", "label": "Other items"}
  ]},
  {"id": "item_size", "label": "Item size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (fits in car)"},
    {"value": "medium", "label": "Medium (needs van)"},
    {"value": "large", "label": "Large (needs truck)"}
  ]},
  {"id": "seller_contact", "label": "Have you arranged pickup with seller?", "type": "boolean", "required": false}
]',
'[
  {"id": "pickup_urgency", "label": "Pickup urgency", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "ASAP (seller is waiting)"},
    {"value": "today", "label": "Today"},
    {"value": "few_days", "label": "Within a few days"}
  ]},
  {"id": "payment_handling", "label": "Do you need help with payment to seller?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Deliveries – Local & Same Day', 'IKEA/flat-pack collection & delivery',
'[
  {"id": "order_size", "label": "Size of IKEA order", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (few items, fits in car)"},
    {"value": "medium", "label": "Medium (needs van)"},
    {"value": "large", "label": "Large (needs truck)"}
  ]},
  {"id": "order_ready", "label": "Is your order ready for pickup?", "type": "select", "required": true, "options": [
    {"value": "ready", "label": "Ready at customer pickup"},
    {"value": "need_shopping", "label": "Need help shopping/selecting"},
    {"value": "online_order", "label": "Online order to collect"}
  ]},
  {"id": "assembly_help", "label": "Do you need assembly help?", "type": "boolean", "required": false}
]',
'[
  {"id": "delivery_time", "label": "When do you need delivery?", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "weekend", "label": "Weekend"},
    {"value": "flexible", "label": "I''m flexible"}
  ]},
  {"id": "carry_upstairs", "label": "Do items need carrying upstairs?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Deliveries – Local & Same Day', 'Medical/pharmacy deliveries (urgent, prescription)',
'[
  {"id": "delivery_type", "label": "Type of medical delivery", "type": "select", "required": true, "options": [
    {"value": "prescription", "label": "Prescription medication"},
    {"value": "medical_supplies", "label": "Medical supplies"},
    {"value": "lab_samples", "label": "Lab samples"},
    {"value": "medical_documents", "label": "Medical documents"}
  ]},
  {"id": "urgency_level", "label": "Urgency level", "type": "select", "required": true, "options": [
    {"value": "emergency", "label": "Emergency (within 1 hour)"},
    {"value": "urgent", "label": "Urgent (within 3 hours)"},
    {"value": "same_day", "label": "Same day"}
  ]},
  {"id": "temperature_sensitive", "label": "Are items temperature sensitive?", "type": "boolean", "required": false}
]',
'[
  {"id": "recipient_availability", "label": "Recipient availability", "type": "select", "required": true, "options": [
    {"value": "always", "label": "Always available"},
    {"value": "specific_hours", "label": "Specific hours only"},
    {"value": "care_facility", "label": "Care facility/Hospital"}
  ]},
  {"id": "id_required", "label": "Is ID verification required?", "type": "boolean", "required": false}
]'),

-- Freight & Logistics
('Transport & Deliveries', 'Freight & Logistics', 'Pallet transport (half-pallet, full-pallet)',
'[
  {"id": "pallet_count", "label": "Number of pallets", "type": "select", "required": true, "options": [
    {"value": "half", "label": "Half pallet"},
    {"value": "1", "label": "1 full pallet"},
    {"value": "2-5", "label": "2-5 pallets"},
    {"value": "6+", "label": "6+ pallets"}
  ]},
  {"id": "pallet_type", "label": "Pallet type", "type": "select", "required": true, "options": [
    {"value": "euro", "label": "Euro pallet (120x80cm)"},
    {"value": "standard", "label": "Standard pallet (120x100cm)"},
    {"value": "custom", "label": "Custom size"}
  ]},
  {"id": "goods_type", "label": "Type of goods", "type": "select", "required": true, "options": [
    {"value": "general", "label": "General goods"},
    {"value": "fragile", "label": "Fragile items"},
    {"value": "hazardous", "label": "Hazardous materials"},
    {"value": "food", "label": "Food products"}
  ]}
]',
'[
  {"id": "timeline", "label": "Delivery timeline", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "2-3_days", "label": "2-3 days"},
    {"value": "flexible", "label": "Flexible"}
  ]},
  {"id": "loading_equipment", "label": "Loading equipment available at both ends?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Freight & Logistics', 'LTL (less-than-truckload) shipments',
'[
  {"id": "shipment_size", "label": "Shipment size", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (1-3 pallets)"},
    {"value": "medium", "label": "Medium (4-10 pallets)"},
    {"value": "large", "label": "Large (11-20 pallets)"}
  ]},
  {"id": "freight_class", "label": "Freight class (if known)", "type": "select", "required": false, "options": [
    {"value": "50", "label": "Class 50 (dense/heavy)"},
    {"value": "100", "label": "Class 100 (medium)"},
    {"value": "200", "label": "Class 200 (light)"},
    {"value": "unknown", "label": "Don''t know"}
  ]},
  {"id": "special_handling", "label": "Special handling required?", "type": "boolean", "required": false}
]',
'[
  {"id": "transit_time", "label": "Required transit time", "type": "select", "required": true, "options": [
    {"value": "standard", "label": "Standard (5-7 days)"},
    {"value": "expedited", "label": "Expedited (2-3 days)"},
    {"value": "priority", "label": "Priority (1-2 days)"}
  ]},
  {"id": "tracking_required", "label": "Is shipment tracking required?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Freight & Logistics', 'FTL (full truckload) shipments',
'[
  {"id": "trailer_type", "label": "Trailer type needed", "type": "select", "required": true, "options": [
    {"value": "dry_van", "label": "Dry van (standard)"},
    {"value": "refrigerated", "label": "Refrigerated (reefer)"},
    {"value": "flatbed", "label": "Flatbed"},
    {"value": "specialized", "label": "Specialized trailer"}
  ]},
  {"id": "load_weight", "label": "Approximate load weight", "type": "select", "required": true, "options": [
    {"value": "light", "label": "Light (under 15,000 lbs)"},
    {"value": "medium", "label": "Medium (15,000-35,000 lbs)"},
    {"value": "heavy", "label": "Heavy (35,000+ lbs)"}
  ]},
  {"id": "loading_type", "label": "Loading/unloading", "type": "select", "required": true, "options": [
    {"value": "dock", "label": "Dock to dock"},
    {"value": "tailgate", "label": "Tailgate delivery"},
    {"value": "inside", "label": "Inside delivery"}
  ]}
]',
'[
  {"id": "timeline", "label": "When do you need pickup?", "type": "select", "required": true, "options": [
    {"value": "asap", "label": "ASAP"},
    {"value": "within_week", "label": "Within a week"},
    {"value": "scheduled", "label": "Scheduled in advance"}
  ]},
  {"id": "detention_time", "label": "Expected loading/unloading time", "type": "select", "required": false, "options": [
    {"value": "quick", "label": "Quick (under 2 hours)"},
    {"value": "standard", "label": "Standard (2-4 hours)"},
    {"value": "long", "label": "Long (4+ hours)"}
  ]}
]'),

('Transport & Deliveries', 'Freight & Logistics', 'Container transport (20ft/40ft)',
'[
  {"id": "container_size", "label": "Container size", "type": "select", "required": true, "options": [
    {"value": "20ft", "label": "20ft container"},
    {"value": "40ft", "label": "40ft container"},
    {"value": "40ft_hc", "label": "40ft high cube"},
    {"value": "multiple", "label": "Multiple containers"}
  ]},
  {"id": "container_type", "label": "Container type", "type": "select", "required": true, "options": [
    {"value": "dry", "label": "Dry container"},
    {"value": "refrigerated", "label": "Refrigerated container"},
    {"value": "open_top", "label": "Open top"},
    {"value": "flat_rack", "label": "Flat rack"}
  ]},
  {"id": "origin", "label": "Pick up location", "type": "select", "required": true, "options": [
    {"value": "port", "label": "Port/Terminal"},
    {"value": "warehouse", "label": "Warehouse/Facility"},
    {"value": "other", "label": "Other location"}
  ]}
]',
'[
  {"id": "timeline", "label": "Transport timeline", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Urgent (within days)"},
    {"value": "standard", "label": "Standard (within week)"},
    {"value": "flexible", "label": "Flexible timing"}
  ]},
  {"id": "customs_clearance", "label": "Is customs clearance needed?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Freight & Logistics', 'Import/export customs clearance + delivery',
'[
  {"id": "shipment_origin", "label": "Shipment origin", "type": "select", "required": true, "options": [
    {"value": "eu", "label": "EU country"},
    {"value": "uk", "label": "United Kingdom"},
    {"value": "usa", "label": "United States"},
    {"value": "asia", "label": "Asia"},
    {"value": "other", "label": "Other country"}
  ]},
  {"id": "goods_category", "label": "Type of goods", "type": "select", "required": true, "options": [
    {"value": "commercial", "label": "Commercial goods"},
    {"value": "personal", "label": "Personal effects"},
    {"value": "samples", "label": "Commercial samples"},
    {"value": "machinery", "label": "Machinery/Equipment"}
  ]},
  {"id": "documentation", "label": "Do you have all required documentation?", "type": "boolean", "required": false}
]',
'[
  {"id": "urgency", "label": "Clearance urgency", "type": "select", "required": true, "options": [
    {"value": "standard", "label": "Standard processing"},
    {"value": "expedited", "label": "Expedited processing"},
    {"value": "emergency", "label": "Emergency clearance"}
  ]},
  {"id": "delivery_after", "label": "Need delivery after clearance?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Freight & Logistics', 'Courier cargo (airport/ferry pickup + drop)',
'[
  {"id": "cargo_type", "label": "Type of cargo", "type": "select", "required": true, "options": [
    {"value": "documents", "label": "Documents/Papers"},
    {"value": "samples", "label": "Commercial samples"},
    {"value": "parts", "label": "Spare parts"},
    {"value": "personal", "label": "Personal items"},
    {"value": "other", "label": "Other cargo"}
  ]},
  {"id": "pickup_location", "label": "Pickup location", "type": "select", "required": true, "options": [
    {"value": "airport_cargo", "label": "Airport cargo terminal"},
    {"value": "airport_passenger", "label": "Airport passenger terminal"},
    {"value": "ferry_port", "label": "Ferry port"},
    {"value": "courier_depot", "label": "Courier depot"}
  ]},
  {"id": "size_weight", "label": "Size and weight", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small package (under 5kg)"},
    {"value": "medium", "label": "Medium package (5-20kg)"},
    {"value": "large", "label": "Large/Heavy (over 20kg)"}
  ]}
]',
'[
  {"id": "timing", "label": "Pickup timing", "type": "select", "required": true, "options": [
    {"value": "flight_arrival", "label": "Specific flight arrival"},
    {"value": "ferry_arrival", "label": "Specific ferry arrival"},
    {"value": "asap", "label": "ASAP"},
    {"value": "scheduled", "label": "Pre-scheduled"}
  ]},
  {"id": "customs_needed", "label": "Will customs clearance be needed?", "type": "boolean", "required": false}
]'),

-- Specialist Transport
('Transport & Deliveries', 'Specialist Transport', 'Heavy equipment/machinery',
'[
  {"id": "equipment_type", "label": "Type of equipment", "type": "select", "required": true, "options": [
    {"value": "construction", "label": "Construction equipment"},
    {"value": "industrial", "label": "Industrial machinery"},
    {"value": "agricultural", "label": "Agricultural equipment"},
    {"value": "medical", "label": "Medical equipment"},
    {"value": "other", "label": "Other heavy equipment"}
  ]},
  {"id": "weight_class", "label": "Approximate weight", "type": "select", "required": true, "options": [
    {"value": "medium", "label": "Medium (5-20 tons)"},
    {"value": "heavy", "label": "Heavy (20-50 tons)"},
    {"value": "super_heavy", "label": "Super heavy (50+ tons)"}
  ]},
  {"id": "special_permits", "label": "Will special permits be required?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "Transport timeline", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "Urgent (within week)"},
    {"value": "planned", "label": "Planned (within month)"},
    {"value": "flexible", "label": "Flexible timing"}
  ]},
  {"id": "route_survey", "label": "Will route survey be needed?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Specialist Transport', 'Building materials transport (cement, timber, scaffolding, etc.)',
'[
  {"id": "material_type", "label": "Type of materials", "type": "select", "required": true, "options": [
    {"value": "cement", "label": "Cement/Concrete products"},
    {"value": "timber", "label": "Timber/Lumber"},
    {"value": "steel", "label": "Steel/Metal products"},
    {"value": "scaffolding", "label": "Scaffolding"},
    {"value": "mixed", "label": "Mixed building materials"}
  ]},
  {"id": "quantity", "label": "Quantity/Volume", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small load (single delivery)"},
    {"value": "medium", "label": "Medium load (few deliveries)"},
    {"value": "large", "label": "Large project (multiple loads)"}
  ]},
  {"id": "site_access", "label": "Site access conditions", "type": "select", "required": true, "options": [
    {"value": "easy", "label": "Easy access (standard truck)"},
    {"value": "restricted", "label": "Restricted access"},
    {"value": "difficult", "label": "Difficult access (crane needed)"}
  ]}
]',
'[
  {"id": "delivery_schedule", "label": "Delivery schedule", "type": "select", "required": true, "options": [
    {"value": "single", "label": "Single delivery"},
    {"value": "multiple", "label": "Multiple scheduled deliveries"},
    {"value": "ongoing", "label": "Ongoing project deliveries"}
  ]},
  {"id": "unloading_help", "label": "Do you need help with unloading?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Specialist Transport', 'Garden/landscaping deliveries (soil, gravel, plants, turf)',
'[
  {"id": "material_type", "label": "Type of materials", "type": "select", "required": true, "options": [
    {"value": "soil", "label": "Soil/Compost"},
    {"value": "aggregates", "label": "Gravel/Sand/Stone"},
    {"value": "plants", "label": "Plants/Trees"},
    {"value": "turf", "label": "Turf/Sod"},
    {"value": "mixed", "label": "Mixed landscaping materials"}
  ]},
  {"id": "quantity", "label": "Quantity needed", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small amount (car loads)"},
    {"value": "medium", "label": "Medium amount (van loads)"},
    {"value": "bulk", "label": "Bulk delivery (truck loads)"}
  ]},
  {"id": "access_type", "label": "Delivery access", "type": "select", "required": true, "options": [
    {"value": "kerbside", "label": "Kerbside delivery"},
    {"value": "driveway", "label": "Driveway delivery"},
    {"value": "garden", "label": "Into garden/backyard"}
  ]}
]',
'[
  {"id": "timeline", "label": "Delivery timeline", "type": "select", "required": true, "options": [
    {"value": "urgent", "label": "ASAP"},
    {"value": "week", "label": "Within a week"},
    {"value": "seasonal", "label": "Seasonal timing important"}
  ]},
  {"id": "wheelbarrow_access", "label": "Is wheelbarrow access available?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Specialist Transport', 'Event rental transport (chairs, marquees, stages)',
'[
  {"id": "event_type", "label": "Type of event", "type": "select", "required": true, "options": [
    {"value": "wedding", "label": "Wedding"},
    {"value": "corporate", "label": "Corporate event"},
    {"value": "festival", "label": "Festival/Fair"},
    {"value": "private", "label": "Private party"},
    {"value": "other", "label": "Other event"}
  ]},
  {"id": "equipment_type", "label": "Type of equipment", "type": "select", "required": true, "options": [
    {"value": "furniture", "label": "Tables/Chairs"},
    {"value": "marquee", "label": "Marquee/Tent"},
    {"value": "stage", "label": "Stage/Platform"},
    {"value": "av", "label": "AV equipment"},
    {"value": "mixed", "label": "Mixed event equipment"}
  ]},
  {"id": "setup_required", "label": "Do you need setup/breakdown service?", "type": "boolean", "required": false}
]',
'[
  {"id": "event_date", "label": "Event date proximity", "type": "select", "required": true, "options": [
    {"value": "this_week", "label": "This week"},
    {"value": "next_week", "label": "Next week"},
    {"value": "this_month", "label": "This month"},
    {"value": "planned_ahead", "label": "Planned in advance"}
  ]},
  {"id": "return_pickup", "label": "When should equipment be collected?", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "few_days", "label": "Few days later"}
  ]}
]'),

('Transport & Deliveries', 'Specialist Transport', 'Temperature-controlled (reefer vans) (perishables, catering, florals)',
'[
  {"id": "product_type", "label": "Type of products", "type": "select", "required": true, "options": [
    {"value": "food", "label": "Food products"},
    {"value": "pharmaceuticals", "label": "Pharmaceuticals"},
    {"value": "flowers", "label": "Flowers/Plants"},
    {"value": "chemicals", "label": "Temperature-sensitive chemicals"},
    {"value": "other", "label": "Other perishables"}
  ]},
  {"id": "temperature_range", "label": "Required temperature", "type": "select", "required": true, "options": [
    {"value": "frozen", "label": "Frozen (-18°C to -25°C)"},
    {"value": "chilled", "label": "Chilled (2°C to 8°C)"},
    {"value": "controlled", "label": "Controlled (15°C to 25°C)"},
    {"value": "variable", "label": "Variable temperature zones"}
  ]},
  {"id": "monitoring_required", "label": "Is temperature monitoring/logging required?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "Delivery timeline", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "overnight", "label": "Overnight delivery"},
    {"value": "scheduled", "label": "Scheduled delivery"}
  ]},
  {"id": "special_handling", "label": "Special handling required?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Specialist Transport', 'Livestock/pet transport (animal-safe, crates, vet approved)',
'[
  {"id": "animal_type", "label": "Type of animals", "type": "select", "required": true, "options": [
    {"value": "pets", "label": "Pets (dogs/cats)"},
    {"value": "horses", "label": "Horses"},
    {"value": "livestock", "label": "Livestock (cattle/sheep)"},
    {"value": "exotic", "label": "Exotic animals"},
    {"value": "other", "label": "Other animals"}
  ]},
  {"id": "animal_count", "label": "Number of animals", "type": "select", "required": true, "options": [
    {"value": "single", "label": "Single animal"},
    {"value": "few", "label": "2-5 animals"},
    {"value": "many", "label": "6+ animals"}
  ]},
  {"id": "health_certificates", "label": "Do you have health certificates?", "type": "boolean", "required": false}
]',
'[
  {"id": "distance", "label": "Transport distance", "type": "select", "required": true, "options": [
    {"value": "local", "label": "Local (within region)"},
    {"value": "national", "label": "National"},
    {"value": "international", "label": "International"}
  ]},
  {"id": "veterinary_support", "label": "Is veterinary support needed during transport?", "type": "boolean", "required": false}
]'),

-- Storage & Logistics Add-ons
('Transport & Deliveries', 'Storage & Logistics Add-ons', 'Temporary storage (1 day – 3 months)',
'[
  {"id": "storage_duration", "label": "Storage duration needed", "type": "select", "required": true, "options": [
    {"value": "days", "label": "Few days (1-7 days)"},
    {"value": "weeks", "label": "Few weeks (1-4 weeks)"},
    {"value": "1_month", "label": "1 month"},
    {"value": "2_3_months", "label": "2-3 months"}
  ]},
  {"id": "storage_size", "label": "Amount to store", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (few boxes)"},
    {"value": "medium", "label": "Medium (room contents)"},
    {"value": "large", "label": "Large (house contents)"}
  ]},
  {"id": "climate_control", "label": "Do you need climate controlled storage?", "type": "boolean", "required": false}
]',
'[
  {"id": "access_frequency", "label": "How often do you need access?", "type": "select", "required": true, "options": [
    {"value": "none", "label": "No access needed"},
    {"value": "occasional", "label": "Occasional access"},
    {"value": "regular", "label": "Regular access"}
  ]},
  {"id": "pickup_delivery", "label": "Do you need pickup and delivery service?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Storage & Logistics Add-ons', 'Packing supplies delivered (boxes, wrap, tape)',
'[
  {"id": "move_size", "label": "Size of move/packing job", "type": "select", "required": true, "options": [
    {"value": "small", "label": "Small (1-2 rooms)"},
    {"value": "medium", "label": "Medium (3-4 rooms)"},
    {"value": "large", "label": "Large (5+ rooms)"}
  ]},
  {"id": "supply_type", "label": "Types of supplies needed", "type": "select", "required": true, "options": [
    {"value": "basic", "label": "Basic (boxes, tape)"},
    {"value": "complete", "label": "Complete kit (boxes, wrap, tape, labels)"},
    {"value": "specialized", "label": "Specialized (fragile item protection)"}
  ]},
  {"id": "urgency", "label": "When do you need supplies?", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "few_days", "label": "Within a few days"}
  ]}
]',
'[
  {"id": "delivery_time", "label": "Preferred delivery time", "type": "select", "required": true, "options": [
    {"value": "morning", "label": "Morning"},
    {"value": "afternoon", "label": "Afternoon"},
    {"value": "evening", "label": "Evening"},
    {"value": "flexible", "label": "Flexible"}
  ]},
  {"id": "assembly_help", "label": "Do you need help assembling boxes?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Storage & Logistics Add-ons', 'Loading/unloading help only',
'[
  {"id": "job_type", "label": "Type of loading/unloading", "type": "select", "required": true, "options": [
    {"value": "moving_truck", "label": "Moving truck"},
    {"value": "delivery", "label": "Delivery truck"},
    {"value": "container", "label": "Shipping container"},
    {"value": "storage", "label": "Storage unit"}
  ]},
  {"id": "crew_size", "label": "How many helpers do you need?", "type": "select", "required": true, "options": [
    {"value": "1", "label": "1 person"},
    {"value": "2", "label": "2 people"},
    {"value": "3", "label": "3 people"},
    {"value": "4+", "label": "4+ people"}
  ]},
  {"id": "heavy_items", "label": "Are there heavy/bulky items?", "type": "boolean", "required": false}
]',
'[
  {"id": "duration", "label": "Estimated job duration", "type": "select", "required": true, "options": [
    {"value": "1_hour", "label": "1 hour or less"},
    {"value": "2_hours", "label": "2 hours"},
    {"value": "3_hours", "label": "3 hours"},
    {"value": "4+_hours", "label": "4+ hours"}
  ]},
  {"id": "equipment_provided", "label": "Do you have dollies/moving equipment?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Storage & Logistics Add-ons', 'White-glove delivery (setup, positioning, removal of packaging)',
'[
  {"id": "item_type", "label": "Type of items", "type": "select", "required": true, "options": [
    {"value": "furniture", "label": "Furniture"},
    {"value": "appliances", "label": "Appliances"},
    {"value": "electronics", "label": "Electronics/AV equipment"},
    {"value": "artwork", "label": "Artwork/Collectibles"},
    {"value": "mixed", "label": "Mixed items"}
  ]},
  {"id": "service_level", "label": "Level of service needed", "type": "select", "required": true, "options": [
    {"value": "basic", "label": "Basic (positioning, unpack)"},
    {"value": "full", "label": "Full service (setup, connect, test)"},
    {"value": "premium", "label": "Premium (full setup + training)"}
  ]},
  {"id": "room_ready", "label": "Is the room/space ready?", "type": "boolean", "required": false}
]',
'[
  {"id": "timeline", "label": "When do you need delivery?", "type": "select", "required": true, "options": [
    {"value": "same_day", "label": "Same day"},
    {"value": "next_day", "label": "Next day"},
    {"value": "weekend", "label": "Weekend"},
    {"value": "scheduled", "label": "Specific scheduled time"}
  ]},
  {"id": "packaging_disposal", "label": "Do you need packaging disposal?", "type": "boolean", "required": false}
]'),

('Transport & Deliveries', 'Storage & Logistics Add-ons', 'Disposal services (old furniture/appliances removal during delivery)',
'[
  {"id": "disposal_type", "label": "What needs to be disposed of?", "type": "select", "required": true, "options": [
    {"value": "furniture", "label": "Old furniture"},
    {"value": "appliances", "label": "Old appliances"},
    {"value": "electronics", "label": "Electronics/TV"},
    {"value": "mixed", "label": "Mixed old items"},
    {"value": "packaging", "label": "Packaging materials only"}
  ]},
  {"id": "disposal_amount", "label": "Amount to dispose", "type": "select", "required": true, "options": [
    {"value": "single", "label": "Single item"},
    {"value": "few", "label": "Few items"},
    {"value": "room_full", "label": "Room full of items"}
  ]},
  {"id": "environmental_disposal", "label": "Does it need environmentally responsible disposal?", "type": "boolean", "required": false}
]',
'[
  {"id": "timing", "label": "When should disposal happen?", "type": "select", "required": true, "options": [
    {"value": "same_time", "label": "Same time as delivery"},
    {"value": "after_delivery", "label": "After new items delivered"},
    {"value": "separate_visit", "label": "Separate visit"}
  ]},
  {"id": "donation_possible", "label": "Are items suitable for donation?", "type": "boolean", "required": false}
]');