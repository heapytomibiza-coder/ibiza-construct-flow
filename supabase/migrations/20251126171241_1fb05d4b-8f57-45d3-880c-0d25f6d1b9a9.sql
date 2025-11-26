
-- Add helpful descriptions to micro-services for better UX

-- Custom Furniture (Carpentry)
UPDATE service_micro_categories SET description = 'Custom-designed dining, coffee, or side tables' WHERE name = 'Bespoke tables' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Built-in or freestanding shelving solutions' WHERE name = 'Shelving & storage units' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Entertainment centers and media storage' WHERE name = 'TV & media units' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Custom bed frames and headboard designs' WHERE name = 'Beds & headboards' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Window seating, dining benches, storage benches' WHERE name = 'Built-in benches & seating' AND description IS NULL;

-- Add descriptions for other common micro-services
UPDATE service_micro_categories SET description = 'Complete wall painting and decorating' WHERE name = 'Wall painting' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Professional floor installation services' WHERE name = 'Floor installation' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Full bathroom design and fit-out' WHERE name = 'Bathroom installation' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Complete kitchen design and installation' WHERE name = 'Kitchen installation' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Electrical repairs and installations' WHERE name = 'Electrical work' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Plumbing repairs and installations' WHERE name = 'Plumbing work' AND description IS NULL;

-- General repairs and maintenance
UPDATE service_micro_categories SET description = 'Small repairs, odd jobs, and general fixes' WHERE name LIKE '%handyman%' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Assembly and installation services' WHERE name LIKE '%assembly%' AND description IS NULL;
UPDATE service_micro_categories SET description = 'Professional painting services' WHERE name LIKE '%painting%' AND description IS NULL;
