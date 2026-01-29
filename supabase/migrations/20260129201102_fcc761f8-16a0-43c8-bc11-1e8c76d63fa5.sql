-- Create storage bucket for professional cover photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-photos',
  'cover-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (safety)
DROP POLICY IF EXISTS "Public can view cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover photos" ON storage.objects;

-- Allow public read access to cover photos
CREATE POLICY "Public can view cover photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

-- Allow authenticated users to upload cover photos
CREATE POLICY "Authenticated can upload cover photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-photos');

-- Allow users to update their own cover photos
CREATE POLICY "Users can update own cover photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own cover photos
CREATE POLICY "Users can delete own cover photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);