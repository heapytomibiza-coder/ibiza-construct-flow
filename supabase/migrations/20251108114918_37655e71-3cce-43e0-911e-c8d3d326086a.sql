-- Add email and phone to professional profiles
ALTER TABLE public.professional_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Create storage buckets for verification documents and cover photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('cover-photos', 'cover-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS for verification documents (only owner and admins can view)
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS for cover photos (public read, owner write)
CREATE POLICY "Users can upload their own cover photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

CREATE POLICY "Users can update their own cover photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add verification documents URLs array to professional_verifications
ALTER TABLE public.professional_verifications 
ADD COLUMN IF NOT EXISTS document_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.professional_profiles.contact_email IS 'Professional contact email for clients';
COMMENT ON COLUMN public.professional_profiles.contact_phone IS 'Professional contact phone for clients';
COMMENT ON COLUMN public.professional_verifications.document_urls IS 'Array of storage URLs for verification documents';