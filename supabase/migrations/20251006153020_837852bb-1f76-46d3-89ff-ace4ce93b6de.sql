-- ============================================================================
-- Phase 15.1 – Enhanced Filing & Evidence System
-- ============================================================================

-- 1) Add new columns to disputes table
ALTER TABLE public.disputes
  ADD COLUMN IF NOT EXISTS dispute_category text CHECK (dispute_category IN ('payment', 'quality', 'conduct', 'timeline')),
  ADD COLUMN IF NOT EXISTS required_evidence_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pre_dispute_contact_attempted boolean DEFAULT false;

-- 2) Add evidence_category to dispute_evidence
ALTER TABLE public.dispute_evidence
  ADD COLUMN IF NOT EXISTS evidence_category text CHECK (
    evidence_category IN ('photos', 'documents', 'messages', 'receipts', 'work_logs', 'contracts', 'invoices', 'other')
  );

-- 3) Create dedicated dispute-evidence storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dispute-evidence',
  'dispute-evidence',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/quicktime', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 4) Storage RLS policies for dispute-evidence bucket
CREATE POLICY "Dispute parties can view their evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dispute-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT d.id::text
    FROM disputes d
    WHERE auth.uid() IN (d.created_by, d.disputed_against)
  )
);

CREATE POLICY "Dispute parties can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dispute-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT d.id::text
    FROM disputes d
    WHERE auth.uid() IN (d.created_by, d.disputed_against)
  )
);

CREATE POLICY "Admins can manage all dispute evidence"
ON storage.objects FOR ALL
USING (
  bucket_id = 'dispute-evidence' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- 5) Auto-log evidence uploads to timeline
CREATE OR REPLACE FUNCTION log_dispute_evidence_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (
    NEW.dispute_id,
    'evidence_uploaded',
    'New evidence uploaded: ' || COALESCE(NEW.evidence_category, 'other'),
    jsonb_build_object(
      'evidence_id', NEW.id,
      'category', NEW.evidence_category,
      'file_name', NEW.file_name
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_evidence_upload ON dispute_evidence;
CREATE TRIGGER trg_log_evidence_upload
  AFTER INSERT ON dispute_evidence
  FOR EACH ROW
  EXECUTE FUNCTION log_dispute_evidence_upload();