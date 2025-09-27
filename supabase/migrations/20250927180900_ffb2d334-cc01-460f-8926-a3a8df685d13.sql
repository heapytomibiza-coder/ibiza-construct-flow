-- Step 1: Migrate data from services table to services_micro table  
-- Add the missing hierarchical data to services_micro

INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics)
SELECT DISTINCT 
  s.category,
  s.subcategory, 
  s.micro,
  '[]'::jsonb as questions_micro,
  '[]'::jsonb as questions_logistics
FROM services s
WHERE NOT EXISTS (
  SELECT 1 FROM services_micro sm 
  WHERE sm.category = s.category 
  AND sm.subcategory = s.subcategory 
  AND sm.micro = s.micro
)
ORDER BY s.category, s.subcategory, s.micro;