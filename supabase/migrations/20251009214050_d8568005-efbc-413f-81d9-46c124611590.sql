-- Create portfolio_images table for professional portfolios
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_photos table for job before/after photos
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  photo_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for portfolio_images
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Professionals can manage their own portfolio images
CREATE POLICY "Professionals manage own portfolio" ON portfolio_images
  FOR ALL USING (auth.uid() = professional_id);

-- Anyone can view portfolio images (public profiles)
CREATE POLICY "Anyone can view portfolios" ON portfolio_images
  FOR SELECT USING (true);

-- RLS for job_photos - only job participants can view
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Professionals can upload job photos
CREATE POLICY "Professionals can upload job photos" ON job_photos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Job participants can view job photos
CREATE POLICY "Job participants can view job photos" ON job_photos
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    job_id IN (SELECT id FROM jobs WHERE client_id = auth.uid())
  );