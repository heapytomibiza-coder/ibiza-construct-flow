-- Add photo-related columns to professional_service_items table
ALTER TABLE public.professional_service_items 
ADD COLUMN primary_image_url TEXT,
ADD COLUMN gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN video_url TEXT,
ADD COLUMN image_alt_text TEXT;

-- Create storage bucket for service images
INSERT INTO storage.buckets 
  (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('service-images', 'service-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

-- Create storage policies for service images
CREATE POLICY "Service images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-images');

CREATE POLICY "Professionals can upload service images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND roles ? 'professional'
  )
);

CREATE POLICY "Professionals can update their service images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND roles ? 'professional'
  )
);

CREATE POLICY "Professionals can delete their service images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND roles ? 'professional'
  )
);