
-- Phase 3: Data Integrity Fixes

-- 1. Deactivate duplicate micro services (keep the first one, deactivate others)
WITH duplicates AS (
  SELECT slug, 
         id,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM service_micro_categories
  WHERE slug IN ('door-installation', 'wetroom-installation', 'heat-pump-installation')
)
UPDATE service_micro_categories
SET is_active = false
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2. Deactivate orphaned question packs (their micro services don't exist)
UPDATE question_packs
SET is_active = false
WHERE micro_slug IN ('leak-detection-repair', 'ac-performance-noise', 'ac-system-upgrade-replacement', 'ac-unit-relocation')
AND is_active = true;

-- 3. Mark Transport & Logistics category as inactive since it has no content
UPDATE service_categories
SET is_active = false
WHERE slug = 'transport-logistics';

-- Add comment documenting these changes
COMMENT ON TABLE service_micro_categories IS 'Micro service categories. Duplicates deactivated on 2025-12-03: door-installation, wetroom-installation, heat-pump-installation';
