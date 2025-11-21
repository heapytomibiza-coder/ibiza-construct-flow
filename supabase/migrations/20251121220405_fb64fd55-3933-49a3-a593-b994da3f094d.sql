-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view service images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete service images" ON storage.objects;

-- Allow public read access to service images
CREATE POLICY "Public can view service images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- Allow authenticated users to upload service images
CREATE POLICY "Authenticated can upload service images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

-- Allow service owners to update their images
CREATE POLICY "Owners can update service images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'service-images');

-- Allow service owners to delete their images
CREATE POLICY "Owners can delete service images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'service-images');