-- Add service questions for the 12 core missing services

-- Handyman - Furniture assembly
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'ac92b536-204f-433b-a7e1-40810d6211ee',
  '[
    {"id":"furniture_type","label":"What type of furniture?","type":"single_select","options":[{"label":"IKEA furniture","value":"ikea"},{"label":"Bed frame","value":"bed"},{"label":"Office desk","value":"desk"},{"label":"Wardrobe/closet","value":"wardrobe"},{"label":"Other","value":"other"}],"required":true},
    {"id":"complexity","label":"How complex is the assembly?","type":"single_select","options":[{"label":"Simple (1-2 hours)","value":"simple"},{"label":"Standard (2-4 hours)","value":"standard"},{"label":"Complex (4+ hours)","value":"complex"}],"required":true},
    {"id":"tools_needed","label":"Do you have the required tools?","type":"single_select","options":[{"label":"I have all tools","value":"have"},{"label":"Need professional tools","value":"need"}],"required":true}
  ]',
  1
);

-- Handyman - Hang pictures
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '2e685522-70c8-4289-84e7-aed7edc693d6',
  '[
    {"id":"picture_count","label":"How many pictures/items?","type":"single_select","options":[{"label":"1-3 pictures","value":"few"},{"label":"4-8 pictures","value":"medium"},{"label":"9+ pictures","value":"many"}],"required":true},
    {"id":"wall_type","label":"What type of wall?","type":"single_select","options":[{"label":"Drywall","value":"drywall"},{"label":"Brick/concrete","value":"masonry"},{"label":"Not sure","value":"unknown"}],"required":true},
    {"id":"picture_weight","label":"Picture weight category?","type":"single_select","options":[{"label":"Light (under 5lbs)","value":"light"},{"label":"Medium (5-20lbs)","value":"medium"},{"label":"Heavy (20+ lbs)","value":"heavy"}],"required":true}
  ]',
  1
);

-- Handyman - Install shelves
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '3aacf4a3-3ad6-4651-8567-6e74bcb06602',
  '[
    {"id":"shelf_count","label":"How many shelves?","type":"single_select","options":[{"label":"1-2 shelves","value":"few"},{"label":"3-5 shelves","value":"medium"},{"label":"6+ shelves","value":"many"}],"required":true},
    {"id":"shelf_type","label":"What type of shelves?","type":"single_select","options":[{"label":"Floating shelves","value":"floating"},{"label":"Bracket shelves","value":"bracket"},{"label":"Built-in shelving","value":"builtin"}],"required":true},
    {"id":"wall_material","label":"Wall material?","type":"single_select","options":[{"label":"Drywall","value":"drywall"},{"label":"Brick/stone","value":"masonry"},{"label":"Wood","value":"wood"}],"required":true}
  ]',
  1
);

-- Handyman - Paint touch-ups
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '5289faf4-e2c1-4fc7-bcde-a1e97d0c7c37',
  '[
    {"id":"touch_up_scope","label":"How extensive are the touch-ups?","type":"single_select","options":[{"label":"Small spots (few nail holes)","value":"minimal"},{"label":"Medium area (wall section)","value":"medium"},{"label":"Large area (full wall)","value":"extensive"}],"required":true},
    {"id":"paint_available","label":"Do you have matching paint?","type":"single_select","options":[{"label":"Yes, I have the paint","value":"have"},{"label":"Need paint color matching","value":"match"},{"label":"Need new paint purchase","value":"buy"}],"required":true},
    {"id":"surface_type","label":"What surface needs touch-up?","type":"single_select","options":[{"label":"Interior walls","value":"interior"},{"label":"Exterior walls","value":"exterior"},{"label":"Trim/doors","value":"trim"}],"required":true}
  ]',
  1
);

-- Handyman - Picture & Artwork Hanging
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'cf61bb36-8e00-4498-b6fd-b90a990a518f',
  '[
    {"id":"artwork_count","label":"How many pieces?","type":"single_select","options":[{"label":"1-3 pieces","value":"few"},{"label":"4-8 pieces","value":"medium"},{"label":"9+ pieces (gallery wall)","value":"many"}],"required":true},
    {"id":"artwork_size","label":"What size artwork?","type":"single_select","options":[{"label":"Small (under 16x20)","value":"small"},{"label":"Medium (16x20 to 24x36)","value":"medium"},{"label":"Large (over 24x36)","value":"large"}],"required":true},
    {"id":"arrangement","label":"Installation type?","type":"single_select","options":[{"label":"Single piece placement","value":"single"},{"label":"Multiple pieces arrangement","value":"multiple"},{"label":"Gallery wall design","value":"gallery"}],"required":true}
  ]',
  1
);

-- Handyman - Smart Home Installation
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'c433f1c5-c8f7-4345-a319-413d7be4675b',
  '[
    {"id":"device_type","label":"What smart devices?","type":"single_select","options":[{"label":"Smart switches/outlets","value":"switches"},{"label":"Smart thermostat","value":"thermostat"},{"label":"Security system","value":"security"},{"label":"Multiple devices","value":"multiple"}],"required":true},
    {"id":"wiring_needed","label":"Electrical work required?","type":"single_select","options":[{"label":"No wiring needed","value":"none"},{"label":"Simple wiring","value":"simple"},{"label":"Complex electrical work","value":"complex"}],"required":true},
    {"id":"network_setup","label":"Network configuration needed?","type":"single_select","options":[{"label":"Basic setup","value":"basic"},{"label":"Advanced configuration","value":"advanced"},{"label":"Full system integration","value":"full"}],"required":true}
  ]',
  1
);

-- Handyman - TV Mounting
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '3b909f93-fddb-44b9-bde4-362d51cfe824',
  '[
    {"id":"tv_size","label":"TV size?","type":"single_select","options":[{"label":"32-43 inches","value":"small"},{"label":"50-65 inches","value":"medium"},{"label":"70+ inches","value":"large"}],"required":true},
    {"id":"wall_type","label":"Wall type?","type":"single_select","options":[{"label":"Drywall with studs","value":"drywall"},{"label":"Brick/concrete","value":"masonry"},{"label":"Not sure","value":"unknown"}],"required":true},
    {"id":"cable_management","label":"Cable management needed?","type":"single_select","options":[{"label":"Hide cables in wall","value":"in_wall"},{"label":"Cable cover/conduit","value":"external"},{"label":"No cable management","value":"none"}],"required":true},
    {"id":"mount_type","label":"Mount type preference?","type":"single_select","options":[{"label":"Fixed (non-moving)","value":"fixed"},{"label":"Tilt mount","value":"tilt"},{"label":"Full motion","value":"articulating"}],"required":true}
  ]',
  1
);

-- Home & Property Services - Appliance Installation
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'c2ce9b18-d7ac-407b-b4c3-e3facba52dcf',
  '[
    {"id":"appliance_type","label":"What appliance?","type":"single_select","options":[{"label":"Dishwasher","value":"dishwasher"},{"label":"Washing machine","value":"washer"},{"label":"Dryer","value":"dryer"},{"label":"Built-in microwave","value":"microwave"},{"label":"Other","value":"other"}],"required":true},
    {"id":"connections_needed","label":"What connections are needed?","type":"single_select","options":[{"label":"Electrical only","value":"electrical"},{"label":"Plumbing only","value":"plumbing"},{"label":"Both electrical and plumbing","value":"both"},{"label":"Gas connection","value":"gas"}],"required":true},
    {"id":"old_appliance","label":"Old appliance removal?","type":"single_select","options":[{"label":"No removal needed","value":"none"},{"label":"Disconnect and remove","value":"remove"},{"label":"Haul away old appliance","value":"haul"}],"required":true}
  ]',
  1
);

-- Home & Property Services - Bathroom Fittings
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '2dbd0e38-ee90-4924-a983-d9de7205c8e7',
  '[
    {"id":"fitting_type","label":"What fittings need installation?","type":"single_select","options":[{"label":"Toilet","value":"toilet"},{"label":"Sink/vanity","value":"sink"},{"label":"Shower/bathtub","value":"shower"},{"label":"Multiple fixtures","value":"multiple"}],"required":true},
    {"id":"plumbing_work","label":"Plumbing work required?","type":"single_select","options":[{"label":"Replace existing (same location)","value":"replace"},{"label":"New plumbing lines needed","value":"new_lines"},{"label":"Major plumbing changes","value":"major"}],"required":true},
    {"id":"tile_work","label":"Tile/flooring work needed?","type":"single_select","options":[{"label":"No tile work","value":"none"},{"label":"Minor tile repair","value":"minor"},{"label":"New tile installation","value":"new_tile"}],"required":true}
  ]',
  1
);

-- Home & Property Services - Door Repair
INSERT INTO service_questions(service_id, questions, version) VALUES (
  '64667f01-08b9-472e-85eb-1adf33ca68f2',
  '[
    {"id":"door_issue","label":"What needs repair?","type":"single_select","options":[{"label":"Door won\"t close properly","value":"alignment"},{"label":"Broken door handle/lock","value":"hardware"},{"label":"Door frame damage","value":"frame"},{"label":"Multiple issues","value":"multiple"}],"required":true},
    {"id":"door_type","label":"What type of door?","type":"single_select","options":[{"label":"Interior door","value":"interior"},{"label":"Exterior door","value":"exterior"},{"label":"Sliding door","value":"sliding"},{"label":"French doors","value":"french"}],"required":true},
    {"id":"replacement_needed","label":"Parts replacement needed?","type":"single_select","options":[{"label":"Adjustment only","value":"adjust"},{"label":"Hardware replacement","value":"hardware"},{"label":"Door replacement","value":"door"}],"required":true}
  ]',
  1
);

-- Home & Property Services - Drywall Repair
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'd1006727-c8f5-48e0-9baa-1b8d44fe49d8',
  '[
    {"id":"damage_size","label":"Size of damage?","type":"single_select","options":[{"label":"Small holes (nail/screw)","value":"small"},{"label":"Medium holes/cracks","value":"medium"},{"label":"Large holes/sections","value":"large"}],"required":true},
    {"id":"damage_count","label":"How many areas need repair?","type":"single_select","options":[{"label":"1-2 spots","value":"few"},{"label":"3-5 spots","value":"several"},{"label":"6+ spots or full wall","value":"extensive"}],"required":true},
    {"id":"painting_needed","label":"Painting after repair?","type":"single_select","options":[{"label":"No painting needed","value":"none"},{"label":"Touch-up painting","value":"touch"},{"label":"Full wall painting","value":"full"}],"required":true}
  ]',
  1
);

-- Home & Property Services - Furniture Assembly (duplicate service)
INSERT INTO service_questions(service_id, questions, version) VALUES (
  'a91e32c0-3b30-4974-a187-ca7c1c762ef9',
  '[
    {"id":"furniture_type","label":"What type of furniture?","type":"single_select","options":[{"label":"IKEA furniture","value":"ikea"},{"label":"Office furniture","value":"office"},{"label":"Bedroom furniture","value":"bedroom"},{"label":"Living room furniture","value":"living"},{"label":"Other","value":"other"}],"required":true},
    {"id":"assembly_complexity","label":"Assembly complexity?","type":"single_select","options":[{"label":"Simple (1-2 hours)","value":"simple"},{"label":"Standard (2-4 hours)","value":"standard"},{"label":"Complex (4+ hours)","value":"complex"}],"required":true},
    {"id":"quantity","label":"How many pieces?","type":"single_select","options":[{"label":"1-2 pieces","value":"few"},{"label":"3-5 pieces","value":"medium"},{"label":"6+ pieces","value":"many"}],"required":true}
  ]',
  1
);