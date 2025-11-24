-- Recategorize labor services to proper skilled trade categories and translate Spanish services

-- PLUMBING SERVICES
UPDATE professional_service_items
SET category = 'plumbing'
WHERE id IN (
  'd6109dcd-f700-494c-a64c-c17a1d6076c1', -- Boiler Installation
  '018c742c-28a3-4626-9f4c-1eedc0d44160', -- Emergency Leak Repair
  '74438851-5d13-4351-8c43-1358d58b2a19', -- General Plumbing & Pipe Installation
  '0108e6b2-1ff6-45b2-bec9-7c292e5edcf3', -- Heat Pump Installation
  'c8956d51-7845-4c9d-8e4a-6032a8aad49f', -- Solar Thermal Systems
  '74521667-f5b1-4a23-be62-ba60b5069ddf'  -- Underfloor Heating
);

-- CARPENTRY/WOODWORK SERVICES
UPDATE professional_service_items
SET category = 'carpentry-woodwork'
WHERE id IN (
  '8af402cd-17ab-4be8-8445-79d8cc710344', -- Custom Cabinetry
  '910fda10-d5cb-4d3d-9214-7253821a9db4', -- Countertops
  'f43eaeb9-26d6-4db0-8e48-a04caab5733b', -- Kitchen Design
  '0ee1ea63-5d66-44f8-bc85-87407afe4059', -- Modular Kitchens
  'd913b7d0-9c7d-4c13-be35-3f3202dac1c5', -- Door & Window Installation
  '20aa9c07-2001-42c0-bbb5-6684cf77d4b7', -- Armoured Security Doors
  'e64edb4d-1ecf-4c72-bc22-940f961ae6af'  -- Fire-Rated Doors
);

-- TRANSLATE AND RECATEGORIZE SPANISH SERVICES

-- Balcony/Terrace Enclosures (Carpentry)
UPDATE professional_service_items
SET 
  name = 'Balcony & Terrace Enclosures',
  description = 'Custom enclosure solutions',
  category = 'carpentry-woodwork'
WHERE id = 'f496083a-1fcc-4a10-9e27-47607d22bb1e';

UPDATE professional_service_items
SET 
  name = 'High-Efficiency Terrace Enclosures',
  description = 'Energy-efficient enclosure systems',
  category = 'carpentry-woodwork'
WHERE id = '89c588f5-ff6f-4a03-a17e-dd151c3c359e';

-- Window/Door Installation (Carpentry)
UPDATE professional_service_items
SET 
  name = 'Energy-Efficient Windows & Doors',
  description = 'High energy efficiency installation',
  category = 'carpentry-woodwork'
WHERE id = '00ac33d5-573f-4cd5-9948-7fb26fecf504';

-- Custom Screens
UPDATE professional_service_items
SET 
  name = 'Custom Window Screens',
  description = 'Made-to-measure window screens',
  category = 'carpentry-woodwork'
WHERE id = '7822c0c5-35ab-407d-9b60-0d1b85133717';

-- Sliding Doors
UPDATE professional_service_items
SET 
  name = 'Panoramic Sliding Doors',
  description = 'Large format with solar glass',
  category = 'carpentry-woodwork'
WHERE id = '470fa8d6-3f79-470d-8a90-1b61b4504bf5';

UPDATE professional_service_items
SET 
  name = 'Folding Sliding Doors',
  description = 'Space-saving folding door systems',
  category = 'carpentry-woodwork'
WHERE id = 'f44c69ac-5a2d-4fb3-82a5-53d0d33fcd5e';

-- Entry Doors
UPDATE professional_service_items
SET 
  name = 'Security Entry Doors',
  description = 'Safety glass entry door systems',
  category = 'carpentry-woodwork'
WHERE id = '8d75b41e-6fcf-4a58-a444-b81428a9dfbb';

-- Acoustic Systems
UPDATE professional_service_items
SET 
  name = 'Hotel Acoustic Systems',
  description = 'Certified acoustic solutions',
  category = 'carpentry-woodwork'
WHERE id = '3207a154-c321-4429-9e38-669675aa60f8';

-- Window Replacement
UPDATE professional_service_items
SET 
  name = 'Old Window Replacement',
  description = 'Certified replacement systems',
  category = 'carpentry-woodwork'
WHERE id = '1b68338a-3745-475a-a2df-a13fb4072d72';

UPDATE professional_service_items
SET 
  name = 'Window & Door Replacement',
  description = 'PVC and aluminum systems',
  category = 'carpentry-woodwork'
WHERE id = 'c40e0669-4349-4614-af78-5287b523ed04';

-- Tilt & Turn Windows
UPDATE professional_service_items
SET 
  name = 'Tilt & Turn Windows',
  description = 'European-style window systems',
  category = 'carpentry-woodwork'
WHERE id = 'b839a444-9f78-4ece-ae5b-4288b83f5413';

-- Tempered Glass Windows
UPDATE professional_service_items
SET 
  name = 'Tempered Glass Windows',
  description = 'Certified safety glass',
  category = 'carpentry-woodwork'
WHERE id = 'ace0fdcf-77f6-43b6-aaf5-30a01bfea8ba';

-- EQUIPMENT RENTAL - Keep in a general category or create new one
-- For now, keeping them in labor as they're not a skilled trade service
UPDATE professional_service_items
SET 
  description = 'Professional construction equipment rental'
WHERE id IN (
  '5011aad3-ec3a-448b-b7e9-68a61d02cd79',
  '29214477-a221-4533-aa7e-dcebe5242914'
);