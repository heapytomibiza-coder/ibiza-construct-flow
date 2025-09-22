-- Service Catalog Restructuring: Complete Implementation
-- Phase 1-3: Core Trades + Building Design & Planning

-- Clear existing services to start fresh
DELETE FROM service_questions;
DELETE FROM services;

-- CORE TRADES (12 Categories)

-- 1. BUILDER
INSERT INTO services (category, subcategory, micro) VALUES
('Builder', 'General Building & Repairs', 'General Building'),
('Builder', 'General Building & Repairs', 'General Repairs'),
('Builder', 'Renovations & Extensions', 'Home Renovations'),
('Builder', 'Renovations & Extensions', 'House Extensions'),
('Builder', 'Loft & Garage Conversions', 'Loft Conversions'),
('Builder', 'Loft & Garage Conversions', 'Garage Conversions'),
('Builder', 'Foundations & Concrete', 'Foundations'),
('Builder', 'Foundations & Concrete', 'Concrete Work'),
('Builder', 'Bricklaying & Masonry', 'Bricklaying'),
('Builder', 'Bricklaying & Masonry', 'Masonry Work'),
('Builder', 'Stonework & Restoration', 'Stonework'),
('Builder', 'Stonework & Restoration', 'Building Restoration'),
('Builder', 'Timber Framing & Roof Carpentry', 'Timber Framing'),
('Builder', 'Timber Framing & Roof Carpentry', 'Roof Carpentry'),
('Builder', 'Structural Steel & Welding', 'Structural Steel'),
('Builder', 'Structural Steel & Welding', 'Welding Services'),
('Builder', 'Formwork Carpentry', 'Formwork');

-- 2. PLUMBER
INSERT INTO services (category, subcategory, micro) VALUES
('Plumber', 'Plumbing Repairs', 'Tap Repairs'),
('Plumber', 'Plumbing Repairs', 'Leak Repairs'),
('Plumber', 'Plumbing Repairs', 'Blockage Clearing'),
('Plumber', 'Bathroom Installations', 'Toilet Installation'),
('Plumber', 'Bathroom Installations', 'Shower Installation'),
('Plumber', 'Bathroom Installations', 'Bath Installation'),
('Plumber', 'Bathroom Installations', 'Sink Installation'),
('Plumber', 'Kitchen Plumbing', 'Kitchen Sinks'),
('Plumber', 'Kitchen Plumbing', 'Dishwasher Installation'),
('Plumber', 'Kitchen Plumbing', 'Kitchen Appliances'),
('Plumber', 'Boilers & Water Heaters', 'Gas Boilers'),
('Plumber', 'Boilers & Water Heaters', 'Electric Water Heaters'),
('Plumber', 'Boilers & Water Heaters', 'Solar Water Heaters'),
('Plumber', 'Heating Systems', 'Radiator Installation'),
('Plumber', 'Heating Systems', 'Underfloor Heating'),
('Plumber', 'Heating Systems', 'Heating Manifolds'),
('Plumber', 'Pipe Replacement & Upgrades', 'Copper Pipes'),
('Plumber', 'Pipe Replacement & Upgrades', 'PVC Pipes'),
('Plumber', 'Pipe Replacement & Upgrades', 'Main Water Lines'),
('Plumber', 'Gas Installations & Safety', 'Gas Line Installation'),
('Plumber', 'Gas Installations & Safety', 'Gas Safety Checks'),
('Plumber', 'Water Systems', 'Water Filtration'),
('Plumber', 'Water Systems', 'Water Softeners');

-- 3. ELECTRICIAN
INSERT INTO services (category, subcategory, micro) VALUES
('Electrician', 'Wiring & Rewiring', 'Full House Rewiring'),
('Electrician', 'Wiring & Rewiring', 'Partial Rewiring'),
('Electrician', 'Wiring & Rewiring', 'New Circuits'),
('Electrician', 'Fuse Box Upgrades', 'Consumer Unit Upgrades'),
('Electrician', 'Circuit Protection', 'Circuit Breakers'),
('Electrician', 'Circuit Protection', 'RCD Installation'),
('Electrician', 'Circuit Protection', 'Surge Protection'),
('Electrician', 'Indoor Lighting', 'Ceiling Lights'),
('Electrician', 'Indoor Lighting', 'LED Installation'),
('Electrician', 'Indoor Lighting', 'Accent Lighting'),
('Electrician', 'Outdoor Lighting', 'Garden Lighting'),
('Electrician', 'Outdoor Lighting', 'Security Lighting'),
('Electrician', 'Smart Home & Networking', 'Smart Home Systems'),
('Electrician', 'Smart Home & Networking', 'Network Cabling'),
('Electrician', 'Security Systems', 'Alarm Systems'),
('Electrician', 'Security Systems', 'CCTV Installation'),
('Electrician', 'Security Systems', 'Access Control'),
('Electrician', 'EV Charging', 'EV Charging Points'),
('Electrician', 'Testing & Certification', 'Electrical Testing'),
('Electrician', 'Testing & Certification', 'Safety Certification');

-- 4. CARPENTER / JOINER
INSERT INTO services (category, subcategory, micro) VALUES
('Carpenter', 'Doors & Frames', 'Door Fitting'),
('Carpenter', 'Doors & Frames', 'Door Frames'),
('Carpenter', 'Doors & Frames', 'Sliding Doors'),
('Carpenter', 'Doors & Frames', 'Security Doors'),
('Carpenter', 'Windows & Glazing', 'Window Frames'),
('Carpenter', 'Windows & Glazing', 'Glazing Joinery'),
('Carpenter', 'Kitchens & Cabinetry', 'Fitted Kitchens'),
('Carpenter', 'Kitchens & Cabinetry', 'Kitchen Cupboards'),
('Carpenter', 'Kitchens & Cabinetry', 'Kitchen Units'),
('Carpenter', 'Wardrobes & Storage', 'Built-in Wardrobes'),
('Carpenter', 'Wardrobes & Storage', 'Storage Solutions'),
('Carpenter', 'Bespoke Joinery', 'Custom Shelving'),
('Carpenter', 'Bespoke Joinery', 'Bespoke Furniture'),
('Carpenter', 'Timber Structures', 'Roof Carpentry'),
('Carpenter', 'Timber Structures', 'Pergolas'),
('Carpenter', 'Timber Structures', 'Decking'),
('Carpenter', 'Furniture Services', 'Furniture Repairs'),
('Carpenter', 'Furniture Services', 'Furniture Restoration');

-- 5. HANDYMAN / ODD JOBS
INSERT INTO services (category, subcategory, micro) VALUES
('Handyman', 'General Repairs', 'General Odd Jobs'),
('Handyman', 'General Repairs', 'Home Repairs'),
('Handyman', 'Assembly & Mounting', 'Furniture Assembly'),
('Handyman', 'Assembly & Mounting', 'TV Mounting'),
('Handyman', 'Assembly & Mounting', 'Picture Hanging'),
('Handyman', 'Assembly & Mounting', 'Curtain Installation'),
('Handyman', 'Minor Plumbing', 'Dripping Taps'),
('Handyman', 'Minor Plumbing', 'Toilet Repairs'),
('Handyman', 'Minor Electrical', 'Light Bulb Replacement'),
('Handyman', 'Minor Electrical', 'Socket Installation'),
('Handyman', 'Minor Electrical', 'Doorbell Installation'),
('Handyman', 'Small Carpentry', 'Trim Repairs'),
('Handyman', 'Small Carpentry', 'Frame Repairs'),
('Handyman', 'Small Carpentry', 'Shelf Installation'),
('Handyman', 'Flat-Pack Assembly', 'IKEA Assembly'),
('Handyman', 'Cleaning & Maintenance', 'Post-Construction Cleaning'),
('Handyman', 'Demolition & Removal', 'Small Demolition'),
('Handyman', 'Demolition & Removal', 'Waste Removal');

-- 6. PAINTER & DECORATOR
INSERT INTO services (category, subcategory, micro) VALUES
('Painter & Decorator', 'Plastering', 'Wall Plastering'),
('Painter & Decorator', 'Plastering', 'Ceiling Plastering'),
('Painter & Decorator', 'Plastering', 'Skimming'),
('Painter & Decorator', 'Drywall & Ceilings', 'Drywall Installation'),
('Painter & Decorator', 'Drywall & Ceilings', 'False Ceilings'),
('Painter & Decorator', 'Drywall & Ceilings', 'Suspended Ceilings'),
('Painter & Decorator', 'Drywall & Ceilings', 'Partition Walls'),
('Painter & Decorator', 'Interior Painting', 'Wall Painting'),
('Painter & Decorator', 'Interior Painting', 'Ceiling Painting'),
('Painter & Decorator', 'Interior Painting', 'Woodwork Painting'),
('Painter & Decorator', 'Exterior Painting', 'Facade Painting'),
('Painter & Decorator', 'Exterior Painting', 'Weatherproof Coatings'),
('Painter & Decorator', 'Decorative Finishes', 'Stucco'),
('Painter & Decorator', 'Decorative Finishes', 'Venetian Plaster'),
('Painter & Decorator', 'Decorative Finishes', 'Textured Finishes'),
('Painter & Decorator', 'Wallpaper', 'Wallpaper Installation'),
('Painter & Decorator', 'Wallpaper', 'Wallpaper Removal'),
('Painter & Decorator', 'Decorative Plasterwork', 'Mouldings'),
('Painter & Decorator', 'Decorative Plasterwork', 'Cornices');

-- 7. TILER
INSERT INTO services (category, subcategory, micro) VALUES
('Tiler', 'Floor Tiling', 'Ceramic Floor Tiles'),
('Tiler', 'Floor Tiling', 'Porcelain Floor Tiles'),
('Tiler', 'Floor Tiling', 'Stone Floor Tiles'),
('Tiler', 'Wall Tiling', 'Bathroom Wall Tiles'),
('Tiler', 'Wall Tiling', 'Kitchen Wall Tiles'),
('Tiler', 'Wall Tiling', 'Splashbacks'),
('Tiler', 'Outdoor Tiling', 'Patio Tiling'),
('Tiler', 'Outdoor Tiling', 'External Tiling'),
('Tiler', 'Decorative Tiling', 'Mosaic Tiling'),
('Tiler', 'Decorative Tiling', 'Feature Walls'),
('Tiler', 'Pool Tiling', 'Swimming Pool Tiles'),
('Tiler', 'Large Format', 'Large Format Slabs');

-- 8. PLASTERER
INSERT INTO services (category, subcategory, micro) VALUES
('Plasterer', 'Plastering & Skimming', 'Wall Plastering'),
('Plasterer', 'Plastering & Skimming', 'Ceiling Plastering'),
('Plasterer', 'Plastering & Skimming', 'Patch Repairs'),
('Plasterer', 'Drywall & Ceilings', 'Drywall Partitions'),
('Plasterer', 'Drywall & Ceilings', 'Fire-Rated Systems'),
('Plasterer', 'Drywall & Ceilings', 'Acoustic Systems'),
('Plasterer', 'Decorative Plasterwork', 'Cornices'),
('Plasterer', 'Decorative Plasterwork', 'Coving'),
('Plasterer', 'Decorative Plasterwork', 'Mouldings'),
('Plasterer', 'Rendering', 'Internal Rendering'),
('Plasterer', 'Rendering', 'External Rendering'),
('Plasterer', 'Repairs & Prep', 'Surface Preparation'),
('Plasterer', 'Repairs & Prep', 'Crack Repairs');

-- 9. ROOFER
INSERT INTO services (category, subcategory, micro) VALUES
('Roofer', 'Roof Repairs', 'Tile Replacement'),
('Roofer', 'Roof Repairs', 'Roof Flashing'),
('Roofer', 'Roof Repairs', 'Leak Repairs'),
('Roofer', 'Flat Roofing', 'Flat Roof Installation'),
('Roofer', 'Flat Roofing', 'Roof Membranes'),
('Roofer', 'Flat Roofing', 'Liquid Roofing Systems'),
('Roofer', 'Roof Replacement', 'Full Roof Replacement'),
('Roofer', 'Roof Replacement', 'Timber Repairs'),
('Roofer', 'Gutters', 'Gutter Installation'),
('Roofer', 'Gutters', 'Gutter Repairs'),
('Roofer', 'Facade & Cladding', 'Facade Rendering'),
('Roofer', 'Facade & Cladding', 'Wall Cladding'),
('Roofer', 'Exterior Coatings', 'Weatherproof Coatings'),
('Roofer', 'Exterior Coatings', 'Anti-Mould Treatments'),
('Roofer', 'Roof Windows', 'Skylight Installation'),
('Roofer', 'Roof Windows', 'Roof Window Installation');

-- 10. LANDSCAPER / GARDENER
INSERT INTO services (category, subcategory, micro) VALUES
('Landscaper', 'Garden Design', 'Garden Planning'),
('Landscaper', 'Garden Design', 'Planting Design'),
('Landscaper', 'Garden Design', 'Tree Planting'),
('Landscaper', 'Garden Design', 'Hedge Installation'),
('Landscaper', 'Garden Design', 'Lawn Installation'),
('Landscaper', 'Irrigation', 'Drip Irrigation'),
('Landscaper', 'Irrigation', 'Sprinkler Systems'),
('Landscaper', 'Irrigation', 'Irrigation Controllers'),
('Landscaper', 'Patios & Driveways', 'Stone Patios'),
('Landscaper', 'Patios & Driveways', 'Concrete Driveways'),
('Landscaper', 'Patios & Driveways', 'Gravel Driveways'),
('Landscaper', 'Patios & Driveways', 'Block Paving'),
('Landscaper', 'Decks & Structures', 'Wooden Decking'),
('Landscaper', 'Decks & Structures', 'Composite Decking'),
('Landscaper', 'Decks & Structures', 'Garden Pergolas'),
('Landscaper', 'Lawn Care', 'Turfing'),
('Landscaper', 'Lawn Care', 'Lawn Maintenance'),
('Landscaper', 'Tree Services', 'Tree Surgery'),
('Landscaper', 'Tree Services', 'Hedge Trimming'),
('Landscaper', 'Garden Features', 'Outdoor Lighting'),
('Landscaper', 'Garden Features', 'Water Features');

-- 11. POOL BUILDER / POOL MAINTENANCE
INSERT INTO services (category, subcategory, micro) VALUES
('Pool Builder', 'Pool Construction', 'Concrete Pools'),
('Pool Builder', 'Pool Construction', 'Fiberglass Pools'),
('Pool Builder', 'Pool Construction', 'Liner Pools'),
('Pool Builder', 'Pool Maintenance', 'Pool Servicing'),
('Pool Builder', 'Pool Maintenance', 'Pool Cleaning'),
('Pool Builder', 'Pool Maintenance', 'Chemical Balancing'),
('Pool Builder', 'Pool Equipment', 'Pool Pumps'),
('Pool Builder', 'Pool Equipment', 'Pool Filters'),
('Pool Builder', 'Pool Equipment', 'Pool Heaters'),
('Pool Builder', 'Pool Equipment', 'Pool Covers'),
('Pool Builder', 'Pool Repairs', 'Leak Detection'),
('Pool Builder', 'Pool Repairs', 'Pool Relining'),
('Pool Builder', 'Pool Finishes', 'Mosaic Tiling'),
('Pool Builder', 'Pool Finishes', 'Ceramic Pool Tiles'),
('Pool Builder', 'Pool Finishes', 'Glass Pool Tiles');

-- 12. AIRCON / HVAC
INSERT INTO services (category, subcategory, micro) VALUES
('HVAC', 'Air Conditioning', 'Split System AC'),
('HVAC', 'Air Conditioning', 'Ducted AC'),
('HVAC', 'Air Conditioning', 'Multi-Split AC'),
('HVAC', 'Air Conditioning', 'Portable AC'),
('HVAC', 'Ventilation', 'Kitchen Extraction'),
('HVAC', 'Ventilation', 'Bathroom Extraction'),
('HVAC', 'Ventilation', 'Whole-Home Ventilation'),
('HVAC', 'Heat Pumps', 'Air-to-Air Heat Pumps'),
('HVAC', 'Heat Pumps', 'Air-to-Water Heat Pumps'),
('HVAC', 'Heat Pumps', 'Hybrid Heat Pumps'),
('HVAC', 'AC Maintenance', 'AC Servicing'),
('HVAC', 'AC Maintenance', 'Gas Refill'),
('HVAC', 'Integration', 'Underfloor Heating Integration'),
('HVAC', 'Commercial Systems', 'Commercial HVAC');

-- BUILDING DESIGN & PLANNING APPLICATIONS (8 Categories)

-- 13. Full Home Design
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Full Home Design', 'Architectural Concept Design'),
('Building Design', 'Full Home Design', 'Site Analysis & Survey'),
('Building Design', 'Full Home Design', 'Floor Plans & Layouts'),
('Building Design', 'Full Home Design', '3D Models & Visualisations'),
('Building Design', 'Full Home Design', 'Facade & Elevation Design'),
('Building Design', 'Full Home Design', 'Structural Coordination'),
('Building Design', 'Full Home Design', 'Sustainable Design'),
('Building Design', 'Full Home Design', 'Interior Space Planning'),
('Building Design', 'Full Home Design', 'Landscape Integration'),
('Building Design', 'Full Home Design', 'Building Regulations Compliance'),
('Building Design', 'Full Home Design', 'Construction Documentation'),
('Building Design', 'Full Home Design', 'Project Feasibility Studies');

-- 14. Renovation Plans & Extensions
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Renovation Plans', 'Building Survey & Measurements'),
('Building Design', 'Renovation Plans', 'Space Reconfiguration'),
('Building Design', 'Renovation Plans', 'Single-Storey Extensions'),
('Building Design', 'Renovation Plans', 'Multi-Storey Extensions'),
('Building Design', 'Renovation Plans', 'Conservatory Design'),
('Building Design', 'Renovation Plans', 'Garage Conversion Plans'),
('Building Design', 'Renovation Plans', 'Open-Plan Redesign'),
('Building Design', 'Renovation Plans', 'Bathroom Additions'),
('Building Design', 'Renovation Plans', 'Structural Integration'),
('Building Design', 'Renovation Plans', 'Load-Bearing Wall Removal'),
('Building Design', 'Renovation Plans', 'Planning Applications'),
('Building Design', 'Renovation Plans', 'Renovation Feasibility');

-- 15. Loft & Basement Conversions
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Loft Conversions', 'Feasibility Assessment'),
('Building Design', 'Loft Conversions', 'Loft Layout Planning'),
('Building Design', 'Loft Conversions', 'Basement Waterproofing Design'),
('Building Design', 'Loft Conversions', 'Staircase Integration'),
('Building Design', 'Loft Conversions', 'Skylight Design'),
('Building Design', 'Loft Conversions', 'Dormer Window Design'),
('Building Design', 'Loft Conversions', 'Basement Lighting Solutions'),
('Building Design', 'Loft Conversions', 'Fire Safety Planning'),
('Building Design', 'Loft Conversions', 'Structural Reinforcement'),
('Building Design', 'Loft Conversions', 'Utility Relocation'),
('Building Design', 'Loft Conversions', 'Building Regulation Drawings'),
('Building Design', 'Loft Conversions', 'Space Optimisation');

-- 16. Building Permit Applications
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Building Permits', 'Site Plan Preparation'),
('Building Design', 'Building Permits', 'Location Maps'),
('Building Design', 'Building Permits', 'Submission Drawings'),
('Building Design', 'Building Permits', 'Structural Safety Reports'),
('Building Design', 'Building Permits', 'Fire Safety Reports'),
('Building Design', 'Building Permits', 'Energy Performance Reports'),
('Building Design', 'Building Permits', 'Environmental Impact Assessments'),
('Building Design', 'Building Permits', 'Accessibility Documentation'),
('Building Design', 'Building Permits', 'Utility Connection Approvals'),
('Building Design', 'Building Permits', 'Drainage Plans'),
('Building Design', 'Building Permits', 'Traffic Statements'),
('Building Design', 'Building Permits', 'Authority Liaison');

-- 17. Energy Efficiency Certificates
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Energy Certificates', 'Energy Performance Assessment'),
('Building Design', 'Energy Certificates', 'Thermal Imaging Analysis'),
('Building Design', 'Energy Certificates', 'Air Tightness Testing'),
('Building Design', 'Energy Certificates', 'Solar Gain Analysis'),
('Building Design', 'Energy Certificates', 'Insulation Recommendations'),
('Building Design', 'Energy Certificates', 'Window Performance Assessment'),
('Building Design', 'Energy Certificates', 'HVAC Efficiency Audit'),
('Building Design', 'Energy Certificates', 'Renewable Energy Integration'),
('Building Design', 'Energy Certificates', 'Lighting Review'),
('Building Design', 'Energy Certificates', 'Water Efficiency Report'),
('Building Design', 'Energy Certificates', 'Certification Issuance');

-- 18. Drafting Services
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'Drafting Services', 'Site Plans'),
('Building Design', 'Drafting Services', 'Floor Plans'),
('Building Design', 'Drafting Services', 'Elevation Drawings'),
('Building Design', 'Drafting Services', 'Cross-Sections'),
('Building Design', 'Drafting Services', 'Structural Details'),
('Building Design', 'Drafting Services', 'MEP Schematics'),
('Building Design', 'Drafting Services', 'Interior Layout Drafting'),
('Building Design', 'Drafting Services', 'Roof Plans'),
('Building Design', 'Drafting Services', 'Staircase Details'),
('Building Design', 'Drafting Services', 'Construction Notes'),
('Building Design', 'Drafting Services', 'CAD Conversion'),
('Building Design', 'Drafting Services', 'Drawing Revisions');

-- 19. 3D Models & Visualisations
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', '3D Visualisation', '3D Massing Models'),
('Building Design', '3D Visualisation', 'Photorealistic Renderings'),
('Building Design', '3D Visualisation', 'VR Walkthroughs'),
('Building Design', '3D Visualisation', 'AR Integration'),
('Building Design', '3D Visualisation', 'Flythrough Animations'),
('Building Design', '3D Visualisation', 'Interior 3D Renderings'),
('Building Design', '3D Visualisation', 'Exterior 3D Renderings'),
('Building Design', '3D Visualisation', 'Lighting Simulations'),
('Building Design', '3D Visualisation', 'Shadow Studies'),
('Building Design', '3D Visualisation', 'Material Simulations'),
('Building Design', '3D Visualisation', 'Marketing Visuals'),
('Building Design', '3D Visualisation', 'Interactive Models');

-- 20. As-Built Documentation
INSERT INTO services (category, subcategory, micro) VALUES
('Building Design', 'As-Built Documentation', 'Measurement Surveys'),
('Building Design', 'As-Built Documentation', 'Construction Verification'),
('Building Design', 'As-Built Documentation', 'As-Built Floor Plans'),
('Building Design', 'As-Built Documentation', 'As-Built Elevations'),
('Building Design', 'As-Built Documentation', 'As-Built MEP Drawings'),
('Building Design', 'As-Built Documentation', 'Structural Records'),
('Building Design', 'As-Built Documentation', 'Equipment Location Plans'),
('Building Design', 'As-Built Documentation', 'Safety Compliance Records'),
('Building Design', 'As-Built Documentation', 'Utility Records'),
('Building Design', 'As-Built Documentation', '3D Scan to CAD'),
('Building Design', 'As-Built Documentation', 'Authority Submissions'),
('Building Design', 'As-Built Documentation', 'Handover Documentation');