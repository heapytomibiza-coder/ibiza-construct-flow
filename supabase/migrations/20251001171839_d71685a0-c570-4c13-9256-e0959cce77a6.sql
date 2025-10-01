-- Clear existing generic data and populate with 12+6 construction categories

-- First, clear all existing data
DELETE FROM services_unified_v1;

-- ========================================
-- 12 MAIN CONSTRUCTION CATEGORIES
-- ========================================

-- 1. BUILDER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Builder', 'Foundations & Groundworks', 'Foundation Construction'),
('Builder', 'Foundations & Groundworks', 'Excavation & Site Preparation'),
('Builder', 'Foundations & Groundworks', 'Basement Construction'),
('Builder', 'Structural Works', 'Bricklaying & Blockwork'),
('Builder', 'Structural Works', 'Concrete Pouring'),
('Builder', 'Structural Works', 'Structural Repairs'),
('Builder', 'Extensions & Renovations', 'Home Extensions'),
('Builder', 'Extensions & Renovations', 'Loft Conversions'),
('Builder', 'Extensions & Renovations', 'Garage Conversions'),
('Builder', 'Restoration', 'Period Property Restoration'),
('Builder', 'Restoration', 'Stone Wall Restoration');

-- 2. PLUMBER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Plumber', 'Leak Repairs', 'Pipe Leak Repair'),
('Plumber', 'Leak Repairs', 'Tap & Faucet Leaks'),
('Plumber', 'Leak Repairs', 'Toilet Leak Repair'),
('Plumber', 'Installation', 'Bathroom Installation'),
('Plumber', 'Installation', 'Toilet Installation'),
('Plumber', 'Installation', 'Shower Installation'),
('Plumber', 'Installation', 'Sink Installation'),
('Plumber', 'Heating', 'Boiler Installation'),
('Plumber', 'Heating', 'Boiler Repair'),
('Plumber', 'Heating', 'Radiator Installation'),
('Plumber', 'Drainage', 'Drain Unblocking'),
('Plumber', 'Drainage', 'Sewer Line Repair');

-- 3. ELECTRICIAN
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Electrician', 'Wiring & Rewiring', 'Full House Rewiring'),
('Electrician', 'Wiring & Rewiring', 'Partial Rewiring'),
('Electrician', 'Installation', 'Socket Installation'),
('Electrician', 'Installation', 'Light Fixture Installation'),
('Electrician', 'Installation', 'Fuse Box Upgrade'),
('Electrician', 'Installation', 'EV Charger Installation'),
('Electrician', 'Smart Home', 'Smart Home Wiring'),
('Electrician', 'Smart Home', 'Smart Lighting Setup'),
('Electrician', 'Repairs', 'Electrical Fault Finding'),
('Electrician', 'Repairs', 'Emergency Electrician'),
('Electrician', 'Safety', 'Electrical Safety Inspection'),
('Electrician', 'Safety', 'RCD Installation');

-- 4. CARPENTER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Carpenter', 'Doors', 'Door Hanging'),
('Carpenter', 'Doors', 'Door Frame Repair'),
('Carpenter', 'Doors', 'Security Door Installation'),
('Carpenter', 'Flooring', 'Wood Flooring Installation'),
('Carpenter', 'Flooring', 'Floor Sanding'),
('Carpenter', 'Flooring', 'Parquet Installation'),
('Carpenter', 'Joinery', 'Custom Shelving'),
('Carpenter', 'Joinery', 'Built-in Wardrobes'),
('Carpenter', 'Joinery', 'Kitchen Fitting'),
('Carpenter', 'Structural', 'Timber Frame Construction'),
('Carpenter', 'Structural', 'Roof Carpentry'),
('Carpenter', 'Restoration', 'Antique Furniture Repair');

-- 5. HANDYMAN
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Handyman', 'General Repairs', 'Small Repairs'),
('Handyman', 'General Repairs', 'Door & Window Repairs'),
('Handyman', 'General Repairs', 'Furniture Repair'),
('Handyman', 'Assembly', 'IKEA Furniture Assembly'),
('Handyman', 'Assembly', 'Flat Pack Assembly'),
('Handyman', 'Mounting', 'TV Mounting'),
('Handyman', 'Mounting', 'Picture Hanging'),
('Handyman', 'Mounting', 'Curtain Rail Installation'),
('Handyman', 'Odd Jobs', 'General Odd Jobs'),
('Handyman', 'Odd Jobs', 'Home Maintenance'),
('Handyman', 'Seasonal', 'Gutter Cleaning'),
('Handyman', 'Seasonal', 'Pressure Washing');

-- 6. PAINTER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Painter', 'Interior Painting', 'Wall Painting'),
('Painter', 'Interior Painting', 'Ceiling Painting'),
('Painter', 'Interior Painting', 'Room Painting'),
('Painter', 'Interior Painting', 'Staircase Painting'),
('Painter', 'Exterior Painting', 'House Exterior Painting'),
('Painter', 'Exterior Painting', 'Fence Painting'),
('Painter', 'Exterior Painting', 'Garage Door Painting'),
('Painter', 'Decorating', 'Wallpapering'),
('Painter', 'Decorating', 'Wallpaper Removal'),
('Painter', 'Decorating', 'Feature Walls'),
('Painter', 'Specialist', 'Spray Painting'),
('Painter', 'Specialist', 'Textured Finishes');

-- 7. TILER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Tiler', 'Floor Tiling', 'Kitchen Floor Tiling'),
('Tiler', 'Floor Tiling', 'Bathroom Floor Tiling'),
('Tiler', 'Floor Tiling', 'Patio Tiling'),
('Tiler', 'Wall Tiling', 'Bathroom Wall Tiling'),
('Tiler', 'Wall Tiling', 'Kitchen Backsplash'),
('Tiler', 'Wall Tiling', 'Shower Wall Tiling'),
('Tiler', 'Specialist', 'Mosaic Tiling'),
('Tiler', 'Specialist', 'Large Format Tiles'),
('Tiler', 'Repairs', 'Tile Replacement'),
('Tiler', 'Repairs', 'Grout Repair & Resealing');

-- 8. PLASTERER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Plasterer', 'Wall Plastering', 'Full Wall Plastering'),
('Plasterer', 'Wall Plastering', 'Patch Plastering'),
('Plasterer', 'Wall Plastering', 'Skim Coating'),
('Plasterer', 'Ceiling Plastering', 'Ceiling Plastering'),
('Plasterer', 'Ceiling Plastering', 'Artex Removal'),
('Plasterer', 'Drywall', 'Drywall Installation'),
('Plasterer', 'Drywall', 'Partition Walls'),
('Plasterer', 'Decorative', 'Decorative Plaster'),
('Plasterer', 'Decorative', 'Coving Installation'),
('Plasterer', 'Repairs', 'Crack Repair'),
('Plasterer', 'Repairs', 'Damp Patch Repair');

-- 9. ROOFER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Roofer', 'Roof Repairs', 'Tile Roof Repair'),
('Roofer', 'Roof Repairs', 'Flat Roof Repair'),
('Roofer', 'Roof Repairs', 'Leak Repair'),
('Roofer', 'New Roofing', 'New Roof Installation'),
('Roofer', 'New Roofing', 'Roof Replacement'),
('Roofer', 'New Roofing', 'Re-Roofing'),
('Roofer', 'Gutters', 'Gutter Installation'),
('Roofer', 'Gutters', 'Gutter Repair'),
('Roofer', 'Gutters', 'Gutter Cleaning'),
('Roofer', 'Specialist', 'Skylight Installation'),
('Roofer', 'Specialist', 'Roof Insulation'),
('Roofer', 'Specialist', 'Chimney Repair');

-- 10. LANDSCAPER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Landscaper', 'Garden Design', 'Garden Design & Planning'),
('Landscaper', 'Garden Design', 'Landscape Design'),
('Landscaper', 'Maintenance', 'Garden Maintenance'),
('Landscaper', 'Maintenance', 'Lawn Care'),
('Landscaper', 'Maintenance', 'Hedge Trimming'),
('Landscaper', 'Hardscaping', 'Patio Installation'),
('Landscaper', 'Hardscaping', 'Driveway Installation'),
('Landscaper', 'Hardscaping', 'Path & Walkway Installation'),
('Landscaper', 'Features', 'Garden Wall Construction'),
('Landscaper', 'Features', 'Decking Installation'),
('Landscaper', 'Features', 'Pergola Construction'),
('Landscaper', 'Planting', 'Tree Planting'),
('Landscaper', 'Planting', 'Flower Bed Installation');

-- 11. POOL BUILDER
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Pool Builder', 'New Pools', 'Swimming Pool Construction'),
('Pool Builder', 'New Pools', 'Concrete Pool Installation'),
('Pool Builder', 'New Pools', 'Fiberglass Pool Installation'),
('Pool Builder', 'Renovation', 'Pool Renovation'),
('Pool Builder', 'Renovation', 'Pool Resurfacing'),
('Pool Builder', 'Renovation', 'Pool Tiling'),
('Pool Builder', 'Maintenance', 'Pool Maintenance Service'),
('Pool Builder', 'Maintenance', 'Pool Cleaning'),
('Pool Builder', 'Equipment', 'Pool Pump Installation'),
('Pool Builder', 'Equipment', 'Pool Heating Installation'),
('Pool Builder', 'Equipment', 'Pool Filter Installation');

-- 12. HVAC
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('HVAC', 'Air Conditioning', 'AC Installation'),
('HVAC', 'Air Conditioning', 'AC Repair'),
('HVAC', 'Air Conditioning', 'AC Maintenance'),
('HVAC', 'Air Conditioning', 'Split Unit Installation'),
('HVAC', 'Heating', 'Central Heating Installation'),
('HVAC', 'Heating', 'Underfloor Heating'),
('HVAC', 'Heating', 'Heat Pump Installation'),
('HVAC', 'Ventilation', 'Ventilation System Installation'),
('HVAC', 'Ventilation', 'Extractor Fan Installation'),
('HVAC', 'Energy', 'Energy Efficiency Assessment'),
('HVAC', 'Energy', 'Smart Thermostat Installation');

-- ========================================
-- 6 SPECIALIST CATEGORIES
-- ========================================

-- 1. ARCHITECTS & DESIGN
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Architects & Design', 'Architects', 'Full Home Design'),
('Architects & Design', 'Architects', 'Renovation Plans'),
('Architects & Design', 'Architects', 'Extension Plans'),
('Architects & Design', 'Architects', 'Building Permit Applications'),
('Architects & Design', 'Technical Architect', 'Site Supervision'),
('Architects & Design', 'Technical Architect', 'Compliance Checks'),
('Architects & Design', 'Technical Architect', 'Construction Certification'),
('Architects & Design', 'Engineers', 'Structural Engineering'),
('Architects & Design', 'Engineers', 'Civil Engineering'),
('Architects & Design', 'Engineers', 'MEP Engineering'),
('Architects & Design', 'Interior Design', 'Space Planning'),
('Architects & Design', 'Interior Design', 'Kitchen Design'),
('Architects & Design', 'Interior Design', 'Bathroom Design'),
('Architects & Design', 'Surveying', 'Land Surveying'),
('Architects & Design', 'Surveying', 'Topographic Surveys'),
('Architects & Design', 'Surveying', 'Boundary Marking');

-- 2. STRUCTURAL WORKS
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Structural Works', 'Groundworks', 'Excavation'),
('Structural Works', 'Groundworks', 'Site Clearing'),
('Structural Works', 'Groundworks', 'Grading & Leveling'),
('Structural Works', 'Foundations', 'Foundation Construction'),
('Structural Works', 'Foundations', 'Piling'),
('Structural Works', 'Foundations', 'Basement Construction'),
('Structural Works', 'Masonry', 'Stone Masonry'),
('Structural Works', 'Masonry', 'Brick Construction'),
('Structural Works', 'Concrete', 'Concrete Structures'),
('Structural Works', 'Concrete', 'Reinforced Concrete'),
('Structural Works', 'Steel', 'Steel Frame Construction'),
('Structural Works', 'Steel', 'Structural Welding');

-- 3. FLOORS, DOORS & WINDOWS
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Floors, Doors & Windows', 'Flooring', 'Wood Flooring'),
('Floors, Doors & Windows', 'Flooring', 'Tile Flooring'),
('Floors, Doors & Windows', 'Flooring', 'Vinyl Flooring'),
('Floors, Doors & Windows', 'Flooring', 'Carpet Installation'),
('Floors, Doors & Windows', 'Doors', 'Door Installation'),
('Floors, Doors & Windows', 'Doors', 'Security Doors'),
('Floors, Doors & Windows', 'Doors', 'Sliding Doors'),
('Floors, Doors & Windows', 'Windows', 'Window Installation'),
('Floors, Doors & Windows', 'Windows', 'Double Glazing'),
('Floors, Doors & Windows', 'Windows', 'Window Replacement'),
('Floors, Doors & Windows', 'Glazing', 'Skylight Installation'),
('Floors, Doors & Windows', 'Glazing', 'Glass Balustrades');

-- 4. KITCHEN & BATHROOM
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Kitchen & Bathroom', 'Kitchen', 'Full Kitchen Installation'),
('Kitchen & Bathroom', 'Kitchen', 'Kitchen Renovation'),
('Kitchen & Bathroom', 'Kitchen', 'Kitchen Design'),
('Kitchen & Bathroom', 'Kitchen', 'Worktop Installation'),
('Kitchen & Bathroom', 'Bathroom', 'Bathroom Installation'),
('Kitchen & Bathroom', 'Bathroom', 'Bathroom Renovation'),
('Kitchen & Bathroom', 'Bathroom', 'Wetroom Installation'),
('Kitchen & Bathroom', 'Bathroom', 'Shower Room Installation'),
('Kitchen & Bathroom', 'Joinery', 'Custom Cabinetry'),
('Kitchen & Bathroom', 'Joinery', 'Built-in Storage'),
('Kitchen & Bathroom', 'Plumbing', 'Kitchen Plumbing'),
('Kitchen & Bathroom', 'Plumbing', 'Bathroom Plumbing');

-- 5. COMMERCIAL PROJECTS
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Commercial Projects', 'Project Management', 'Commercial Project Management'),
('Commercial Projects', 'Project Management', 'Cost Control'),
('Commercial Projects', 'Project Management', 'Site Management'),
('Commercial Projects', 'MEP Systems', 'Commercial Electrical'),
('Commercial Projects', 'MEP Systems', 'Commercial HVAC'),
('Commercial Projects', 'MEP Systems', 'Fire Safety Systems'),
('Commercial Projects', 'Fit-Out', 'Office Fit-Out'),
('Commercial Projects', 'Fit-Out', 'Retail Fit-Out'),
('Commercial Projects', 'Fit-Out', 'Restaurant Fit-Out'),
('Commercial Projects', 'Infrastructure', 'Facade Installation'),
('Commercial Projects', 'Infrastructure', 'Commercial Roofing'),
('Commercial Projects', 'Infrastructure', 'Car Park Construction');

-- 6. LEGAL & REGULATORY
INSERT INTO services_unified_v1 (category, subcategory, micro) VALUES
('Legal & Regulatory', 'Legal', 'Construction Lawyer'),
('Legal & Regulatory', 'Legal', 'Contract Review'),
('Legal & Regulatory', 'Legal', 'Dispute Resolution'),
('Legal & Regulatory', 'Permits', 'Building Permits'),
('Legal & Regulatory', 'Permits', 'Planning Permission'),
('Legal & Regulatory', 'Permits', 'Zoning Applications'),
('Legal & Regulatory', 'Compliance', 'Building Inspection'),
('Legal & Regulatory', 'Compliance', 'Safety Certification'),
('Legal & Regulatory', 'Compliance', 'Energy Certificates'),
('Legal & Regulatory', 'Consulting', 'Urban Planning'),
('Legal & Regulatory', 'Consulting', 'Environmental Consulting'),
('Legal & Regulatory', 'Insurance', 'Construction Insurance'),
('Legal & Regulatory', 'Insurance', 'Liability Insurance');