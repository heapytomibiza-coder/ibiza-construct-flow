/**
 * UUID Migration Tracking
 * Phase 5: Data Migration Support
 * 
 * Track migration of existing jobs to use micro_uuid references
 */

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS public.uuid_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  micro_slug TEXT NOT NULL,
  micro_uuid UUID,
  migration_status TEXT NOT NULL CHECK (migration_status IN ('pending', 'success', 'failed', 'skipped')),
  error_message TEXT,
  migrated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_uuid_migration_log_status 
  ON public.uuid_migration_log(migration_status);
CREATE INDEX IF NOT EXISTS idx_uuid_migration_log_job_id 
  ON public.uuid_migration_log(job_id);

-- Enable RLS
ALTER TABLE public.uuid_migration_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin can view migration logs"
  ON public.uuid_migration_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to migrate jobs without UUIDs
CREATE OR REPLACE FUNCTION public.migrate_job_uuids()
RETURNS TABLE (
  job_id UUID,
  micro_slug TEXT,
  found_uuid UUID,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_record RECORD;
  found_micro RECORD;
  migration_status TEXT;
  error_msg TEXT;
BEGIN
  -- Loop through jobs without micro_uuid
  FOR job_record IN 
    SELECT j.id, j.micro_id, j.micro_uuid
    FROM public.jobs j
    WHERE j.micro_uuid IS NULL
    ORDER BY j.created_at DESC
  LOOP
    BEGIN
      -- Try to find UUID from micro_services table
      SELECT id, slug INTO found_micro
      FROM public.micro_services
      WHERE slug = job_record.micro_id
      LIMIT 1;

      IF found_micro.id IS NOT NULL THEN
        -- Update job with found UUID
        UPDATE public.jobs
        SET micro_uuid = found_micro.id
        WHERE id = job_record.id;

        migration_status := 'success';
        found_uuid := found_micro.id;
        error_msg := NULL;
      ELSE
        -- No UUID found, skip
        migration_status := 'skipped';
        found_uuid := NULL;
        error_msg := 'No matching micro_service found';
      END IF;

      -- Log migration
      INSERT INTO public.uuid_migration_log (
        job_id, 
        micro_slug, 
        micro_uuid, 
        migration_status,
        error_message
      )
      VALUES (
        job_record.id,
        job_record.micro_id,
        found_uuid,
        migration_status,
        error_msg
      );

      -- Return result
      job_id := job_record.id;
      micro_slug := job_record.micro_id;
      status := migration_status;

      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      -- Log error
      INSERT INTO public.uuid_migration_log (
        job_id,
        micro_slug,
        micro_uuid,
        migration_status,
        error_message
      )
      VALUES (
        job_record.id,
        job_record.micro_id,
        NULL,
        'failed',
        SQLERRM
      );

      job_id := job_record.id;
      micro_slug := job_record.micro_id;
      found_uuid := NULL;
      status := 'failed';

      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Function to get migration statistics
CREATE OR REPLACE FUNCTION public.get_uuid_migration_stats()
RETURNS TABLE (
  total_jobs BIGINT,
  jobs_with_uuid BIGINT,
  jobs_without_uuid BIGINT,
  successful_migrations BIGINT,
  failed_migrations BIGINT,
  skipped_migrations BIGINT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.jobs)::BIGINT,
    (SELECT COUNT(*) FROM public.jobs WHERE micro_uuid IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.jobs WHERE micro_uuid IS NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.uuid_migration_log WHERE migration_status = 'success')::BIGINT,
    (SELECT COUNT(*) FROM public.uuid_migration_log WHERE migration_status = 'failed')::BIGINT,
    (SELECT COUNT(*) FROM public.uuid_migration_log WHERE migration_status = 'skipped')::BIGINT,
    (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE micro_uuid IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC * 100)
      END
      FROM public.jobs
    );
END;
$$;

COMMENT ON FUNCTION public.migrate_job_uuids() IS 'Migrate existing jobs to include micro_uuid references from micro_services table';
COMMENT ON FUNCTION public.get_uuid_migration_stats() IS 'Get statistics on UUID migration progress';
COMMENT ON TABLE public.uuid_migration_log IS 'Tracks migration of jobs to use micro_uuid field';