-- Create storage buckets for portfolio and job photos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('portfolio', 'portfolio', true),
  ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create portfolio_images table for professional's self-uploaded work
CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_photos table for before/after photos of completed jobs
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  image_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_images
CREATE POLICY "Anyone can view portfolio images"
  ON public.portfolio_images
  FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their portfolio"
  ON public.portfolio_images
  FOR ALL
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- RLS Policies for job_photos
CREATE POLICY "Anyone can view job photos"
  ON public.job_photos
  FOR SELECT
  USING (true);

CREATE POLICY "Job participants can upload photos"
  ON public.job_photos
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploaders can manage their photos"
  ON public.job_photos
  FOR ALL
  USING (auth.uid() = uploaded_by);

-- Storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own portfolio images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'portfolio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own portfolio images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'portfolio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for job-photos bucket
CREATE POLICY "Anyone can view job photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'job-photos');

CREATE POLICY "Authenticated users can upload job photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'job-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own job photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'job-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own job photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'job-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_images_professional 
  ON public.portfolio_images(professional_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_images_order 
  ON public.portfolio_images(professional_id, display_order);

CREATE INDEX IF NOT EXISTS idx_job_photos_job 
  ON public.job_photos(job_id);

CREATE INDEX IF NOT EXISTS idx_job_photos_type 
  ON public.job_photos(job_id, photo_type);