-- Add missing service categories and micro-services inspired by TaskRabbit

-- Moving & Packing Services
INSERT INTO public.services (category, subcategory, micro) VALUES
('Moving', 'Moving Help', 'Help Moving'),
('Moving', 'Moving Help', 'Truck Assisted Moving'),
('Moving', 'Moving Help', 'Heavy Lifting & Loading'),
('Moving', 'Packing', 'Packing Services'),
('Moving', 'Packing', 'Unpacking Services'),

-- Cleaning Services  
('Cleaning', 'General Cleaning', 'House Cleaning'),
('Cleaning', 'General Cleaning', 'Deep Cleaning'),
('Cleaning', 'General Cleaning', 'Post-Party Cleanup'),
('Cleaning', 'Specialized', 'Carpet Cleaning'),
('Cleaning', 'Specialized', 'Window Cleaning'),

-- Delivery & Shopping
('Delivery', 'Shopping', 'Grocery Shopping'),
('Delivery', 'Shopping', 'Personal Shopping'),
('Delivery', 'Delivery', 'Same Day Delivery'),
('Delivery', 'Delivery', 'Furniture Delivery'),
('Delivery', 'Delivery', 'Package Pickup'),

-- Personal & Business Services
('Personal', 'Organization', 'Home Organization'),
('Personal', 'Organization', 'Office Organization'),
('Personal', 'Assistance', 'Personal Assistant Tasks'),
('Personal', 'Assistance', 'Wait in Line Service'),
('Personal', 'Pet Care', 'Dog Walking'),
('Personal', 'Pet Care', 'Pet Sitting'),

-- Additional popular services
('Handyman', 'Assembly', 'IKEA Furniture Assembly'),
('Handyman', 'Assembly', 'General Furniture Assembly'),
('Handyman', 'Mounting', 'TV Mounting'),
('Handyman', 'Mounting', 'Picture & Artwork Hanging'),
('Handyman', 'Installation', 'Smart Home Installation'),

-- Outdoor & Seasonal
('Outdoor', 'Seasonal', 'Christmas Lights Installation'),
('Outdoor', 'Seasonal', 'Holiday Decorating'),
('Outdoor', 'Maintenance', 'Pressure Washing'),
('Outdoor', 'Maintenance', 'Gutter Cleaning');