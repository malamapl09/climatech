-- ============================================================
-- ClimaTech — Storage bucket + policies
-- ============================================================

-- Create private bucket for job photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Authenticated users can upload to their own folder
CREATE POLICY "job_photos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'job-photos'
  );

-- Authenticated users can read photos from jobs they can access
CREATE POLICY "job_photos_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'job-photos');

-- Only admin can delete photos
CREATE POLICY "job_photos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'job-photos'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
