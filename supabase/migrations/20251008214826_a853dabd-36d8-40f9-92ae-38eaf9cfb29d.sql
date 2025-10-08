-- Phase 1: Minimal Admin CMS - Database Foundation
-- Safe, additive changes only. Zero impact on /post flow.

-- 1) Enrich services_micro with admin management columns
ALTER TABLE services_micro
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_index int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS services_micro_active_sort_idx
  ON services_micro(is_active, sort_index);

-- 2) Version snapshots table - track all admin changes
CREATE TABLE IF NOT EXISTS services_micro_versions (
  version_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  services_micro_id uuid NOT NULL,
  snapshot jsonb NOT NULL,
  change_summary text,
  actor uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_micro_versions_lookup_idx
  ON services_micro_versions(services_micro_id, created_at DESC);

-- 3) Profile verification fields for admin moderation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status text
    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- Add constraint separately to avoid issues with existing data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_verification_status_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('pending','approved','rejected','under_review'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_verification_queue_idx
  ON profiles(verification_status);

-- 4) Admin audit helper function (uses existing admin_audit_log table)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_meta jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO admin_audit_log(
    id, admin_id, action, entity_type, entity_id, changes,
    ip_address, user_agent, created_at
  ) VALUES (
    gen_random_uuid(), 
    auth.uid(), 
    p_action, 
    p_entity_type, 
    p_entity_id, 
    p_meta,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 5) Enable RLS on services_micro
ALTER TABLE services_micro ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_manage_services_micro ON services_micro;
DROP POLICY IF EXISTS public_read_active_services ON services_micro;

-- Admin can manage all services
CREATE POLICY admin_manage_services_micro
  ON services_micro FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can only read active services (or admins can see all)
CREATE POLICY public_read_active_services
  ON services_micro FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- 6) Enable RLS on versions table (admin-only access)
ALTER TABLE services_micro_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_view_versions ON services_micro_versions;
DROP POLICY IF EXISTS admin_insert_versions ON services_micro_versions;

CREATE POLICY admin_view_versions
  ON services_micro_versions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY admin_insert_versions
  ON services_micro_versions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));