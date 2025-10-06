-- ======================================================================
-- Storage Security: Admin-only Reports Bucket
-- ======================================================================

-- Create private bucket for admin reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-reports','admin-reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects (admin-only access)

-- SELECT (download/list) — admin only
DROP POLICY IF EXISTS pol_admin_reports_select ON storage.objects;
CREATE POLICY pol_admin_reports_select ON storage.objects
FOR SELECT USING (
  bucket_id = 'admin-reports'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- INSERT (upload) — admin only
DROP POLICY IF EXISTS pol_admin_reports_insert ON storage.objects;
CREATE POLICY pol_admin_reports_insert ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'admin-reports'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- UPDATE — admin only
DROP POLICY IF EXISTS pol_admin_reports_update ON storage.objects;
CREATE POLICY pol_admin_reports_update ON storage.objects
FOR UPDATE USING (
  bucket_id = 'admin-reports'
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'admin-reports'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- DELETE — admin only
DROP POLICY IF EXISTS pol_admin_reports_delete ON storage.objects;
CREATE POLICY pol_admin_reports_delete ON storage.objects
FOR DELETE USING (
  bucket_id = 'admin-reports'
  AND has_role(auth.uid(), 'admin'::app_role)
);