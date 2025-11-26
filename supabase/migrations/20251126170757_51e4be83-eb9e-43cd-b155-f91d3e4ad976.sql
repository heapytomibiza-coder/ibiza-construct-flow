
-- Add helpful descriptions/examples to all subcategories

-- Architects & Design
UPDATE service_subcategories SET description = 'Building condition surveys, defect reports, valuations' WHERE name = 'Building Surveyors' AND description IS NULL;
UPDATE service_subcategories SET description = '3D models, architectural renders, virtual walkthroughs' WHERE name = '3D Visualization' AND description IS NULL;
UPDATE service_subcategories SET description = 'Planning applications, permits, regulatory advice' WHERE name = 'Planning Consultants' AND description IS NULL;

-- Carpentry
UPDATE service_subcategories SET description = 'Made-to-measure wardrobes, walk-in closets' WHERE name = 'Fitted Wardrobes' AND description IS NULL;
UPDATE service_subcategories SET description = 'Custom joinery, fitted units, specialist woodwork' WHERE name = 'Bespoke Joinery' AND description IS NULL;

-- Cleaning
UPDATE service_subcategories SET description = 'Regular home cleaning, weekly maintenance' WHERE name = 'House Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Office cleaning, retail space maintenance' WHERE name = 'Commercial Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Spring cleaning, post-renovation cleaning' WHERE name = 'Deep Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Move-out cleaning, property handover' WHERE name = 'End of Tenancy' AND description IS NULL;
UPDATE service_subcategories SET description = 'Professional carpet and upholstery cleaning' WHERE name = 'Carpet Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Interior and exterior window cleaning' WHERE name = 'Window Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Professional oven and appliance cleaning' WHERE name = 'Oven Cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Driveway, patio, exterior pressure washing' WHERE name = 'Pressure Washing' AND description IS NULL;

-- Commercial & Industrial
UPDATE service_subcategories SET description = 'Office renovations, workspace design' WHERE name = 'Office Fit-Outs and Refurbishments' AND description IS NULL;
UPDATE service_subcategories SET description = 'Restaurant, bar, hotel fit-outs' WHERE name = 'Retail, Hospitality and Leisure' AND description IS NULL;
UPDATE service_subcategories SET description = 'Factory, storage, manufacturing spaces' WHERE name = 'Industrial, Warehouse and Storage' AND description IS NULL;
UPDATE service_subcategories SET description = 'Building repairs, maintenance contracts' WHERE name = 'Commercial Maintenance and Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Warehouse construction and fitting' WHERE name = 'Warehouses' AND description IS NULL;
UPDATE service_subcategories SET description = 'Restaurant design, commercial kitchens' WHERE name = 'Restaurant Fit-outs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Fire safety, accessibility, compliance' WHERE name = 'Building Services and Compliance' AND description IS NULL;
UPDATE service_subcategories SET description = 'Property maintenance, site management' WHERE name = 'Facilities Management' AND description IS NULL;

-- Construction
UPDATE service_subcategories SET description = 'Foundations, footings, groundwork' WHERE name = 'Foundation Work' AND description IS NULL;
UPDATE service_subcategories SET description = 'Structural fixes, underpinning, stabilization' WHERE name = 'Structural Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Home extensions, room additions' WHERE name = 'Extensions' AND description IS NULL;
UPDATE service_subcategories SET description = 'Brickwork, stonework, concrete work' WHERE name = 'Brickwork, Masonry & Concrete' AND description IS NULL;
UPDATE service_subcategories SET description = 'Roof repairs, re-roofing, flat roofs' WHERE name = 'Roofing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Floor and wall tiling, waterproofing' WHERE name = 'Tiling & Waterproofing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Patios, walls, outdoor structures' WHERE name = 'Outdoor Construction' AND description IS NULL;
UPDATE service_subcategories SET description = 'Property renovations, refurbishments' WHERE name = 'Renovations & Home Upgrades' AND description IS NULL;

-- Electrical
UPDATE service_subcategories SET description = 'Socket installation, light fitting, general electrical' WHERE name = 'General Electrical' AND description IS NULL;
UPDATE service_subcategories SET description = 'Fault finding, trip switches, safety checks' WHERE name = 'Faults, Repairs & Safety' AND description IS NULL;
UPDATE service_subcategories SET description = 'Full rewiring, new circuits, upgrades' WHERE name = 'Rewiring & New Circuits' AND description IS NULL;
UPDATE service_subcategories SET description = 'Light installation, LED upgrades, spotlights' WHERE name = 'Lighting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Smart switches, home automation, WiFi controls' WHERE name = 'Smart Home' AND description IS NULL;
UPDATE service_subcategories SET description = 'Consumer unit upgrades, fuse box replacement' WHERE name = 'Fuse Boxes & Consumer Units' AND description IS NULL;
UPDATE service_subcategories SET description = 'Lighting circuits, power points, sockets' WHERE name = 'Lighting & Power' AND description IS NULL;
UPDATE service_subcategories SET description = 'Garden lighting, EV chargers, outdoor power' WHERE name = 'Outdoor & External Electrics' AND description IS NULL;

-- Floors, Doors & Windows
UPDATE service_subcategories SET description = 'Wood, laminate, vinyl, tile flooring' WHERE name = 'Flooring Installation and Replacement' AND description IS NULL;
UPDATE service_subcategories SET description = 'Interior door fitting, frames, hardware' WHERE name = 'Internal Doors' AND description IS NULL;
UPDATE service_subcategories SET description = 'Front doors, patio doors, security doors' WHERE name = 'External Doors and Entrances' AND description IS NULL;
UPDATE service_subcategories SET description = 'Window replacement, double glazing, repairs' WHERE name = 'Windows and Glazing' AND description IS NULL;

-- Gardening & Landscaping  
UPDATE service_subcategories SET description = 'Lawn mowing, turfing, grass maintenance' WHERE name = 'Lawn Care' AND description IS NULL;
UPDATE service_subcategories SET description = 'Regular garden upkeep, weeding, pruning' WHERE name = 'Garden maintenance' AND description IS NULL;
UPDATE service_subcategories SET description = 'Landscape design, garden makeovers' WHERE name = 'Garden design & landscaping' AND description IS NULL;
UPDATE service_subcategories SET description = 'Garden clearance, overgrown areas' WHERE name = 'Garden clearance & tidy-ups' AND description IS NULL;
UPDATE service_subcategories SET description = 'Paving, patios, garden walls, paths' WHERE name = 'Paving & Hardscaping' AND description IS NULL;
UPDATE service_subcategories SET description = 'Sprinkler systems, irrigation installation' WHERE name = 'Irrigation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Tree pruning, hedge cutting, removal' WHERE name = 'Tree & hedge care' AND description IS NULL;
UPDATE service_subcategories SET description = 'Decking, fencing, garden structures' WHERE name = 'Outdoor structures' AND description IS NULL;

-- Handyman & General Services
UPDATE service_subcategories SET description = 'Small repairs, odd jobs, general fixes' WHERE name = 'General Handyman' AND description IS NULL;
UPDATE service_subcategories SET description = 'Furniture assembly, flat-pack building' WHERE name = 'Assembly' AND description IS NULL;
UPDATE service_subcategories SET description = 'Picture hanging, shelf fitting, TV mounting' WHERE name = 'Installation & Hanging' AND description IS NULL;
UPDATE service_subcategories SET description = 'Exterior cleaning, patio cleaning' WHERE name = 'Exterior Maintenance' AND description IS NULL;

-- HVAC
UPDATE service_subcategories SET description = 'Air conditioning installation and servicing' WHERE name = 'Air Conditioning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Heating system installation and repairs' WHERE name = 'Heating Systems' AND description IS NULL;
UPDATE service_subcategories SET description = 'Ventilation, extractor fans, air quality' WHERE name = 'Ventilation' AND description IS NULL;

-- Kitchen & Bathroom
UPDATE service_subcategories SET description = 'New kitchen design and installation' WHERE name = 'Kitchen Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Kitchen refurbishment, unit replacement' WHERE name = 'Kitchen Refurbishment' AND description IS NULL;
UPDATE service_subcategories SET description = 'Bathroom design and full installation' WHERE name = 'Bathroom Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Bathroom upgrades, suite replacement' WHERE name = 'Bathroom Refurbishment' AND description IS NULL;
UPDATE service_subcategories SET description = 'Worktops, splashbacks, appliances' WHERE name = 'Kitchen Fittings' AND description IS NULL;
UPDATE service_subcategories SET description = 'Tiling, showers, sanitary ware' WHERE name = 'Bathroom Fittings' AND description IS NULL;

-- Legal & Regulatory
UPDATE service_subcategories SET description = 'Planning permission, building permits' WHERE name = 'Planning & Permits' AND description IS NULL;
UPDATE service_subcategories SET description = 'Building regulations, compliance checks' WHERE name = 'Building Regulations' AND description IS NULL;
UPDATE service_subcategories SET description = 'Business licenses, operating permits' WHERE name = 'Licenses & Compliance' AND description IS NULL;

-- Painting & Decorating
UPDATE service_subcategories SET description = 'Room painting, ceilings, walls, woodwork' WHERE name = 'Interior painting & decorating' AND description IS NULL;
UPDATE service_subcategories SET description = 'House exterior, render, fascias, fences' WHERE name = 'Exterior painting & façades' AND description IS NULL;
UPDATE service_subcategories SET description = 'Kitchens, furniture, cabinet refinishing' WHERE name = 'Cabinet & furniture painting' AND description IS NULL;
UPDATE service_subcategories SET description = 'Wallpapering, feature walls, murals' WHERE name = 'Specialist decorating' AND description IS NULL;

-- Plumbing
UPDATE service_subcategories SET description = 'Boiler service, heating repairs' WHERE name = 'Boiler & Heating' AND description IS NULL;
UPDATE service_subcategories SET description = 'Leaks, blockages, pipe repairs' WHERE name = 'Repairs & Emergencies' AND description IS NULL;
UPDATE service_subcategories SET description = 'Bathroom fitting, shower installation' WHERE name = 'Bathroom Plumbing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Sink, tap, appliance installation' WHERE name = 'Kitchen Plumbing' AND description IS NULL;
UPDATE service_subcategories SET description = 'Drain unblocking, CCTV surveys' WHERE name = 'Drainage' AND description IS NULL;

-- Pool & Spa
UPDATE service_subcategories SET description = 'New pool construction, design' WHERE name = 'Pool Installation' AND description IS NULL;
UPDATE service_subcategories SET description = 'Regular cleaning, chemical balancing' WHERE name = 'Pool maintenance & cleaning' AND description IS NULL;
UPDATE service_subcategories SET description = 'Pool leaks, equipment repairs' WHERE name = 'Pool Repairs' AND description IS NULL;
UPDATE service_subcategories SET description = 'Pumps, heaters, filtration systems' WHERE name = 'Pool Equipment' AND description IS NULL;
UPDATE service_subcategories SET description = 'Hot tub installation and servicing' WHERE name = 'Spa & Hot Tubs' AND description IS NULL;

-- Removals & Storage
UPDATE service_subcategories SET description = 'House moving, packing services' WHERE name = 'House Removals' AND description IS NULL;
UPDATE service_subcategories SET description = 'Office relocation, commercial moves' WHERE name = 'Office Removals' AND description IS NULL;
UPDATE service_subcategories SET description = 'Single item delivery, furniture moving' WHERE name = 'Man & Van' AND description IS NULL;
UPDATE service_subcategories SET description = 'Short and long-term storage solutions' WHERE name = 'Storage Services' AND description IS NULL;

-- Security
UPDATE service_subcategories SET description = 'Burglar alarms, home security systems' WHERE name = 'Alarm Systems' AND description IS NULL;
UPDATE service_subcategories SET description = 'CCTV installation, surveillance cameras' WHERE name = 'CCTV & Surveillance' AND description IS NULL;
UPDATE service_subcategories SET description = 'Smart locks, access control, intercoms' WHERE name = 'Smart Security' AND description IS NULL;
UPDATE service_subcategories SET description = 'Lock changes, lockout services' WHERE name = 'Locksmith Services' AND description IS NULL;

-- Transport & Logistics (when active)
UPDATE service_subcategories SET description = 'Courier, parcel delivery, same-day' WHERE name = 'Courier Services' AND description IS NULL;
UPDATE service_subcategories SET description = 'Freight transport, large deliveries' WHERE name = 'Freight & Haulage' AND description IS NULL;
UPDATE service_subcategories SET description = 'Vehicle repairs, mobile mechanics' WHERE name = 'Vehicle Services' AND description IS NULL;
