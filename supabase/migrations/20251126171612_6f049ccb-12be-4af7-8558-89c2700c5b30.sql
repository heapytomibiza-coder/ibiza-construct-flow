
-- Add descriptions to Gardening & Landscaping subcategories
UPDATE service_subcategories SET description = 'Fencing installation, repairs, and replacement' WHERE name = 'Fencing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Automated watering systems, sprinklers' WHERE name = 'Irrigation systems' AND description IS NULL;
UPDATE service_subcategories SET description = 'Driveways, patios, pathways' WHERE name = 'Paving & Driveways' AND description IS NULL;

-- Add descriptions to Handyman & General Services subcategories
UPDATE service_subcategories SET description = 'Professional picture & artwork hanging' WHERE name = 'Picture Hanging' AND description IS NULL;
UPDATE service_subcategories SET description = 'Ongoing maintenance and repairs' WHERE name = 'Property Maintenance' AND description IS NULL;
UPDATE service_subcategories SET description = 'Wall-mounted TV installation' WHERE name = 'TV Mounting' AND description IS NULL;

-- Add descriptions to HVAC subcategories
UPDATE service_subcategories SET description = 'New AC system installation' WHERE name = 'AC installation & upgrades' AND description IS NULL;
UPDATE service_subcategories SET description = 'AC troubleshooting and fixes' WHERE name = 'AC Repair' AND description IS NULL;
UPDATE service_subcategories SET description = 'AC maintenance and repairs' WHERE name = 'AC servicing & repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Boiler troubleshooting and fixes' WHERE name = 'Boiler Repair' AND description IS NULL;
UPDATE service_subcategories SET description = 'Thermostats, smart controls' WHERE name = 'Controls & efficiency' AND description IS NULL;
UPDATE service_subcategories SET description = 'HVAC duct cleaning and sanitization' WHERE name = 'Duct Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Heat pump system installation' WHERE name = 'Heat Pump Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Central heating systems' WHERE name = 'Heating' AND description IS NULL;
UPDATE service_subcategories SET description = 'Boilers, radiators, underfloor heating' WHERE name = 'Heating systems' AND description IS NULL;
UPDATE service_subcategories SET description = 'Radiator installation and replacement' WHERE name = 'Radiator Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Ventilation systems, air purifiers' WHERE name = 'Ventilation & air quality' AND description IS NULL;

-- Add descriptions to Kitchen & Bathroom subcategories
UPDATE service_subcategories SET description = 'Bathroom layout and design planning' WHERE name = 'Bathroom Design' AND description IS NULL;
UPDATE service_subcategories SET description = 'Complete bathroom installation' WHERE name = 'Bathroom Fitting and Renovation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Kitchen layout and design planning' WHERE name = 'Kitchen Design' AND description IS NULL;
UPDATE service_subcategories SET description = 'Complete kitchen installation' WHERE name = 'Kitchen Fitting and Renovation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Granite, quartz, laminate surfaces' WHERE name = 'Kitchen Worktops' AND description IS NULL;
UPDATE service_subcategories SET description = 'Floor and wall tiling' WHERE name = 'Tiling' AND description IS NULL;
UPDATE service_subcategories SET description = 'Walk-in shower installations' WHERE name = 'Wetrooms' AND description IS NULL;
UPDATE service_subcategories SET description = 'Accessible, walk-in bathrooms' WHERE name = 'Wetrooms and Specialist Bathrooms' AND description IS NULL;
UPDATE service_subcategories SET description = 'Kitchen cabinets and storage solutions' WHERE name = 'Worktops, Units and Storage' AND description IS NULL;

-- Add descriptions to Legal & Regulatory subcategories
UPDATE service_subcategories SET description = 'Property surveys and inspections' WHERE name = 'Building Inspections' AND description IS NULL;
UPDATE service_subcategories SET description = 'Planning permissions, building permits' WHERE name = 'Building Permits and Licences' AND description IS NULL;
UPDATE service_subcategories SET description = 'Business licenses and compliance' WHERE name = 'Commercial, Licences and Operating' AND description IS NULL;
UPDATE service_subcategories SET description = 'Shared wall legal agreements' WHERE name = 'Party Wall Agreements' AND description IS NULL;
UPDATE service_subcategories SET description = 'Planning applications and approvals' WHERE name = 'Planning and Permissions' AND description IS NULL;
UPDATE service_subcategories SET description = 'Property surveys, legal documentation' WHERE name = 'Reports, Surveys and Legal Support' AND description IS NULL;
UPDATE service_subcategories SET description = 'Safety certificates, compliance checks' WHERE name = 'Technical and Safety Compliance' AND description IS NULL;

-- Add descriptions to Painting & Decorating subcategories
UPDATE service_subcategories SET description = 'Office and retail painting' WHERE name = 'Commercial Painting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Garden fence painting and staining' WHERE name = 'Fence Painting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Period property restoration' WHERE name = 'Restoration' AND description IS NULL;
UPDATE service_subcategories SET description = 'Textured finishes, feature walls' WHERE name = 'Specialist coatings & effects' AND description IS NULL;
UPDATE service_subcategories SET description = 'Professional spray painting services' WHERE name = 'Spray Painting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Wallpaper hanging and removal' WHERE name = 'Wallpapering' AND description IS NULL;
UPDATE service_subcategories SET description = 'Exterior timber treatment' WHERE name = 'Woodwork, decking & pergolas' AND description IS NULL;

-- Add descriptions to Plumbing subcategories
UPDATE service_subcategories SET description = 'Boiler installation and replacement' WHERE name = 'Boilers' AND description IS NULL;
UPDATE service_subcategories SET description = 'Emergency plumbing repairs' WHERE name = 'Emergency Plumbing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Water and gas piping' WHERE name = 'Pipework' AND description IS NULL;
UPDATE service_subcategories SET description = 'Preventative maintenance checks' WHERE name = 'Routine Maintenance' AND description IS NULL;
UPDATE service_subcategories SET description = 'Taps, toilets, sinks installation' WHERE name = 'Sanitary Fittings' AND description IS NULL;
UPDATE service_subcategories SET description = 'Boiler servicing and tune-ups' WHERE name = 'Servicing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Shower installation and upgrades' WHERE name = 'Showers' AND description IS NULL;
UPDATE service_subcategories SET description = 'Hot water systems' WHERE name = 'Water Heaters' AND description IS NULL;

-- Add descriptions to Roofing subcategories
UPDATE service_subcategories SET description = 'Chimney repair and maintenance' WHERE name = 'Chimneys' AND description IS NULL;
UPDATE service_subcategories SET description = 'Emergency roof leak repairs' WHERE name = 'Emergency Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Flat roof installation' WHERE name = 'Flat Roofing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Guttering and downpipes' WHERE name = 'Guttering' AND description IS NULL;
UPDATE service_subcategories SET description = 'Roof inspections and surveys' WHERE name = 'Inspections' AND description IS NULL;
UPDATE service_subcategories SET description = 'Roof insulation installation' WHERE name = 'Insulation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Sloped roof installation' WHERE name = 'Pitched Roofing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Roof patching and fixes' WHERE name = 'Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Complete roof replacement' WHERE name = 'Roof Replacement' AND description IS NULL;
UPDATE service_subcategories SET description = 'Velux and roof windows' WHERE name = 'Skylights' AND description IS NULL;

-- Add descriptions to Security & Safety subcategories
UPDATE service_subcategories SET description = 'CCTV camera installation' WHERE name = 'CCTV Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Property gates and access systems' WHERE name = 'Gate Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Home security system installation' WHERE name = 'Home Security' AND description IS NULL;
UPDATE service_subcategories SET description = 'Lock installation and replacement' WHERE name = 'Locks & Locksmiths' AND description IS NULL;
UPDATE service_subcategories SET description = 'Smart home security' WHERE name = 'Smart Security' AND description IS NULL;

-- Add descriptions to Structural & Construction subcategories
UPDATE service_subcategories SET description = 'Ceiling installation and repair' WHERE name = 'Ceilings' AND description IS NULL;
UPDATE service_subcategories SET description = 'Damp treatment and prevention' WHERE name = 'Damp Proofing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Demolition and site clearance' WHERE name = 'Demolition' AND description IS NULL;
UPDATE service_subcategories SET description = 'Home extensions and additions' WHERE name = 'Extensions' AND description IS NULL;
UPDATE service_subcategories SET description = 'Building foundations' WHERE name = 'Foundations' AND description IS NULL;
UPDATE service_subcategories SET description = 'New build construction' WHERE name = 'New Builds' AND description IS NULL;
UPDATE service_subcategories SET description = 'Structural repairs and reinforcement' WHERE name = 'Structural Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Underpinning and foundation strengthening' WHERE name = 'Underpinning' AND description IS NULL;

-- Add descriptions to Windows & Doors subcategories
UPDATE service_subcategories SET description = 'Bifold door installation' WHERE name = 'Bifold Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Conservatory construction' WHERE name = 'Conservatories' AND description IS NULL;
UPDATE service_subcategories SET description = 'Door installation and replacement' WHERE name = 'Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Front door installation' WHERE name = 'Front Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Internal door installation' WHERE name = 'Internal Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Patio door installation' WHERE name = 'Patio Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Sliding door installation' WHERE name = 'Sliding Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Double and triple glazing' WHERE name = 'Windows' AND description IS NULL;

-- Add descriptions to Cleaning Services subcategories
UPDATE service_subcategories SET description = 'After-builders deep clean' WHERE name = 'After-build Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Carpet and upholstery cleaning' WHERE name = 'Carpet Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Commercial office cleaning' WHERE name = 'Commercial Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Thorough deep cleaning service' WHERE name = 'Deep Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'End of tenancy cleaning' WHERE name = 'End of Tenancy Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Window cleaning services' WHERE name = 'Window Cleaning' AND description IS NULL;

-- Add descriptions to Electrical subcategories
UPDATE service_subcategories SET description = 'Emergency electrical repairs' WHERE name = 'Emergency Services' AND description IS NULL;
UPDATE service_subcategories SET description = 'EV charging point installation' WHERE name = 'EV Charging' AND description IS NULL;
UPDATE service_subcategories SET description = 'Electrical fault diagnosis' WHERE name = 'Fault Finding' AND description IS NULL;
UPDATE service_subcategories SET description = 'Light fixture installation' WHERE name = 'Lighting Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Electrical testing and certification' WHERE name = 'PAT Testing & Certification' AND description IS NULL;
UPDATE service_subcategories SET description = 'Full property rewiring' WHERE name = 'Rewiring' AND description IS NULL;
UPDATE service_subcategories SET description = 'Smart home automation' WHERE name = 'Smart Home' AND description IS NULL;
UPDATE service_subcategories SET description = 'Socket and switch installation' WHERE name = 'Sockets & Switches' AND description IS NULL;

-- Add descriptions to Flooring subcategories
UPDATE service_subcategories SET description = 'Carpet fitting and installation' WHERE name = 'Carpet Fitting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Hardwood floor installation' WHERE name = 'Hardwood Flooring' AND description IS NULL;
UPDATE service_subcategories SET description = 'Laminate floor installation' WHERE name = 'Laminate Flooring' AND description IS NULL;
UPDATE service_subcategories SET description = 'Luxury vinyl tile flooring' WHERE name = 'LVT Flooring' AND description IS NULL;
UPDATE service_subcategories SET description = 'Floor sanding and refinishing' WHERE name = 'Sanding & Refinishing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Stone and marble flooring' WHERE name = 'Stone Flooring' AND description IS NULL;
UPDATE service_subcategories SET description = 'Vinyl flooring installation' WHERE name = 'Vinyl Flooring' AND description IS NULL;
