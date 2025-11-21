-- Fix jobs.micro_id from UUID to TEXT to support slug-based references
-- This aligns the database schema with the application code which stores slugs

BEGIN;

-- 1. Drop any existing foreign key constraints on micro_id
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_micro_id_fkey;

-- 2. Change micro_id column type from UUID to TEXT
-- Using USING clause to convert existing UUIDs to text
ALTER TABLE jobs 
  ALTER COLUMN micro_id TYPE TEXT 
  USING micro_id::TEXT;

-- 3. Add index on micro_id for lookup performance
CREATE INDEX IF NOT EXISTS idx_jobs_micro_id ON jobs(micro_id);

-- 4. Add check constraint to ensure slug format (lowercase, numbers, hyphens only)
ALTER TABLE jobs 
  ADD CONSTRAINT micro_id_slug_format 
  CHECK (micro_id ~ '^[a-z0-9-]+$');

-- 5. Add column comment for documentation
COMMENT ON COLUMN jobs.micro_id IS 'Micro-service slug identifier (e.g., "full-house-rewiring")';

COMMIT;