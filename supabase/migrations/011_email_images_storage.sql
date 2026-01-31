-- =============================================================================
-- Email Images Storage Bucket
-- =============================================================================
-- This migration creates a public storage bucket for email template images.
-- Images uploaded here will be publicly accessible via URL.
-- =============================================================================

-- Create the storage bucket for email images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-images',
  'email-images',
  true,  -- Public bucket so images can be viewed in emails
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- =============================================================================
-- Storage Policies
-- =============================================================================

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload email images" ON storage.objects;
CREATE POLICY "Authenticated users can upload email images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'email-images');

-- Allow authenticated users to update their own images
DROP POLICY IF EXISTS "Users can update own email images" ON storage.objects;
CREATE POLICY "Users can update own email images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'email-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own images
DROP POLICY IF EXISTS "Users can delete own email images" ON storage.objects;
CREATE POLICY "Users can delete own email images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'email-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access (needed for emails to display images)
DROP POLICY IF EXISTS "Public can view email images" ON storage.objects;
CREATE POLICY "Public can view email images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'email-images');
