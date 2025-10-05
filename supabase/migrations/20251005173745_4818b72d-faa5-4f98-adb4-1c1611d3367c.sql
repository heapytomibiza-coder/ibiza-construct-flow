-- Sprint 1: Storage Setup
-- Create storage buckets and RLS policies for professional documents and portfolio

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Professional documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-documents',
  'professional-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Professional portfolio bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-portfolio',
  'professional-portfolio',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES - professional-documents (private)
-- ============================================================================

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- STORAGE RLS POLICIES - professional-portfolio (public)
-- ============================================================================

-- Users can upload their own portfolio images
CREATE POLICY "Users can upload own portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view portfolio images (bucket is public)
CREATE POLICY "Anyone can view portfolio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'professional-portfolio');

-- Users can update their own portfolio images
CREATE POLICY "Users can update own portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own portfolio images
CREATE POLICY "Users can delete own portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);