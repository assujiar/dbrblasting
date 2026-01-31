-- Create public storage bucket for app assets (logo, favicon, etc.)
-- This bucket is public and doesn't require RLS

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-assets',
  'app-assets',
  true,  -- Public bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access (no auth required)
CREATE POLICY "Public read access for app assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-assets');

-- Allow authenticated users to upload (you can restrict this further to super_admin only)
CREATE POLICY "Authenticated users can upload app assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update app assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-assets')
WITH CHECK (bucket_id = 'app-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete app assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-assets');
