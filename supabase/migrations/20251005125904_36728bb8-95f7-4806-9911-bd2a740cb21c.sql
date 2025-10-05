-- Phase 14: Enhanced Real-time Collaboration Features

-- ============================================
-- 1. PROFESSIONAL AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'away', 'offline')),
  custom_message TEXT,
  available_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_professional_availability_professional_id ON professional_availability(professional_id);
CREATE INDEX idx_professional_availability_status ON professional_availability(status) WHERE status IN ('available', 'busy');

-- Enable RLS
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view availability of any professional"
  ON professional_availability FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their own availability"
  ON professional_availability FOR ALL
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE professional_availability;

-- ============================================
-- 2. SHARED DOCUMENTS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  last_edited_by UUID REFERENCES profiles(id),
  last_edited_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES shared_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES shared_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  change_type TEXT NOT NULL,
  change_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shared_documents_job_id ON shared_documents(job_id);
CREATE INDEX idx_shared_documents_created_by ON shared_documents(created_by);
CREATE INDEX idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX idx_document_edits_document_id ON document_edits(document_id);

-- Enable RLS
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_edits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_documents
CREATE POLICY "Users can view documents they're collaborators on"
  ON shared_documents FOR SELECT
  USING (
    id IN (
      SELECT document_id FROM document_collaborators WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create documents"
  ON shared_documents FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Editors and admins can update documents"
  ON shared_documents FOR UPDATE
  USING (
    id IN (
      SELECT document_id FROM document_collaborators 
      WHERE user_id = auth.uid() AND permission IN ('edit', 'admin')
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Admins can delete documents"
  ON shared_documents FOR DELETE
  USING (
    id IN (
      SELECT document_id FROM document_collaborators 
      WHERE user_id = auth.uid() AND permission = 'admin'
    )
    OR created_by = auth.uid()
  );

-- RLS Policies for document_collaborators
CREATE POLICY "Users can view collaborators on their documents"
  ON document_collaborators FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM shared_documents WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Document creators can manage collaborators"
  ON document_collaborators FOR ALL
  USING (
    document_id IN (
      SELECT id FROM shared_documents WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for document_edits
CREATE POLICY "Users can view edits on documents they can access"
  ON document_edits FOR SELECT
  USING (
    document_id IN (
      SELECT document_id FROM document_collaborators WHERE user_id = auth.uid()
    )
    OR document_id IN (
      SELECT id FROM shared_documents WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert edits"
  ON document_edits FOR INSERT
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE shared_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE document_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE document_edits;

-- ============================================
-- 3. ENHANCE EXISTING TABLES
-- ============================================

-- Enhance job_applicants
ALTER TABLE job_applicants
ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS interview_notes TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_job_applicants_interview_scheduled ON job_applicants(interview_scheduled_at) WHERE interview_scheduled_at IS NOT NULL;

-- Enhance activity_feed
ALTER TABLE activity_feed
ADD COLUMN IF NOT EXISTS notification_type TEXT CHECK (notification_type IN ('message', 'job_update', 'offer', 'payment', 'system')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_activity_feed_notification_type ON activity_feed(notification_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_priority ON activity_feed(priority) WHERE priority IN ('high', 'urgent');

-- Enhance offer_negotiations
ALTER TABLE offer_negotiations
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS counter_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_offer_negotiations_expires_at ON offer_negotiations(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Trigger to update professional_availability timestamp
CREATE OR REPLACE FUNCTION update_professional_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professional_availability_updated_at
  BEFORE UPDATE ON professional_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_availability_timestamp();

-- Trigger to track document edits
CREATE OR REPLACE FUNCTION track_document_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert edit record
  INSERT INTO document_edits (document_id, user_id, change_type, change_data)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'version', NEW.version,
      'content_changed', OLD.content IS DISTINCT FROM NEW.content
    )
  );
  
  -- Update last_edited info
  NEW.last_edited_by = auth.uid();
  NEW.last_edited_at = now();
  NEW.version = OLD.version + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_shared_document_edits
  BEFORE UPDATE ON shared_documents
  FOR EACH ROW
  EXECUTE FUNCTION track_document_edit();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get online professionals
CREATE OR REPLACE FUNCTION get_online_professionals(professional_ids UUID[] DEFAULT NULL)
RETURNS TABLE (
  professional_id UUID,
  status TEXT,
  custom_message TEXT,
  available_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.professional_id,
    pa.status,
    pa.custom_message,
    pa.available_until,
    pa.updated_at
  FROM professional_availability pa
  WHERE 
    (professional_ids IS NULL OR pa.professional_id = ANY(professional_ids))
    AND pa.status IN ('available', 'busy')
    AND (pa.available_until IS NULL OR pa.available_until > now())
  ORDER BY 
    CASE pa.status
      WHEN 'available' THEN 1
      WHEN 'busy' THEN 2
      ELSE 3
    END,
    pa.updated_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;