-- =============================================================================
-- Fix Storage RLS Infinite Recursion
-- =============================================================================
-- The storage.objects policies trigger infinite recursion when checking
-- user_profiles RLS. Fix by using simpler policies that don't need profile checks.
-- =============================================================================

-- Create AI logos bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-logos',
  'ai-logos',
  true,  -- Public bucket so logos can be used in generated emails
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Drop all existing storage policies and recreate with simpler checks
-- =============================================================================

-- Drop email-images policies
DROP POLICY IF EXISTS "Authenticated users can upload email images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own email images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own email images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view email images" ON storage.objects;

-- Drop app-assets policies
DROP POLICY IF EXISTS "Public read access for app assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload app assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update app assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete app assets" ON storage.objects;

-- =============================================================================
-- Recreate policies with simple auth checks (no user_profiles access)
-- =============================================================================

-- PUBLIC READ: Anyone can view public bucket objects
CREATE POLICY "Public can view public buckets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('email-images', 'app-assets', 'ai-logos'));

-- AUTHENTICATED UPLOAD: Any authenticated user can upload to these buckets
-- Use owner_id = auth.uid() to track ownership without querying user_profiles
CREATE POLICY "Auth users can upload to public buckets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('email-images', 'app-assets', 'ai-logos')
);

-- AUTHENTICATED UPDATE: Users can update their own uploads
CREATE POLICY "Auth users can update own objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('email-images', 'app-assets', 'ai-logos')
  AND owner_id::uuid = auth.uid()
)
WITH CHECK (
  bucket_id IN ('email-images', 'app-assets', 'ai-logos')
);

-- AUTHENTICATED DELETE: Users can delete their own uploads
CREATE POLICY "Auth users can delete own objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('email-images', 'app-assets', 'ai-logos')
  AND owner_id::uuid = auth.uid()
);
