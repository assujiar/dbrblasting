-- =============================================================================
-- Organization Logos Storage & In-App Notifications
-- =============================================================================

-- =============================================================================
-- PART 1: Organization Logos Storage Bucket
-- =============================================================================

-- Create the storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,  -- Public bucket so logos can be viewed anywhere
  2097152,  -- 2MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Allow org admins and super admins to upload logos
DROP POLICY IF EXISTS "Admins can upload organization logos" ON storage.objects;
CREATE POLICY "Admins can upload organization logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos'
  AND (
    -- Super admins can upload any logo
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
    OR
    -- Org admins can upload logo for their organization
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'org_admin'
      AND organization_id::text = (storage.foldername(name))[1]
    )
  )
);

-- Allow admins to update logos
DROP POLICY IF EXISTS "Admins can update organization logos" ON storage.objects;
CREATE POLICY "Admins can update organization logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'org_admin'
      AND organization_id::text = (storage.foldername(name))[1]
    )
  )
);

-- Allow admins to delete logos
DROP POLICY IF EXISTS "Admins can delete organization logos" ON storage.objects;
CREATE POLICY "Admins can delete organization logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'org_admin'
      AND organization_id::text = (storage.foldername(name))[1]
    )
  )
);

-- Allow public read access to organization logos
DROP POLICY IF EXISTS "Public can view organization logos" ON storage.objects;
CREATE POLICY "Public can view organization logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');


-- =============================================================================
-- PART 2: In-App Notifications System
-- =============================================================================

-- Create notification type enum
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'info',
    'success',
    'warning',
    'error',
    'announcement',
    'campaign_complete',
    'campaign_failed',
    'system'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Target (can be for specific user, organization, or all users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false, -- For system-wide announcements
  -- Content
  type notification_type DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Optional link when clicking notification
  action_label TEXT, -- Optional button text
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  -- Expiry
  expires_at TIMESTAMPTZ,
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_global ON public.notifications(is_global);
CREATE INDEX IF NOT EXISTS idx_notifications_is_dismissed ON public.notifications(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (
    -- User's direct notifications
    user_id = auth.uid()
    OR
    -- Organization-wide notifications
    (
      user_id IS NULL
      AND organization_id IN (
        SELECT organization_id FROM public.user_profiles
        WHERE user_id = auth.uid()
      )
    )
    OR
    -- Global notifications
    is_global = true
  );

-- Policy: Users can update their own notification status (read/dismissed)
CREATE POLICY "Users can update own notification status" ON public.notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    (
      user_id IS NULL
      AND organization_id IN (
        SELECT organization_id FROM public.user_profiles
        WHERE user_id = auth.uid()
      )
    )
    OR
    is_global = true
  )
  WITH CHECK (
    -- Can only update read/dismissed status
    user_id = auth.uid()
    OR
    (
      user_id IS NULL
      AND organization_id IN (
        SELECT organization_id FROM public.user_profiles
        WHERE user_id = auth.uid()
      )
    )
    OR
    is_global = true
  );

-- Policy: Only admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'org_admin')
    )
  );

-- Policy: Only super_admin can delete notifications
CREATE POLICY "Super admins can delete notifications" ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Create user notification dismissals table (for tracking dismissals of org/global notifications)
CREATE TABLE IF NOT EXISTS public.notification_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user ON public.notification_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_notification ON public.notification_dismissals(notification_id);

-- Enable RLS
ALTER TABLE public.notification_dismissals ENABLE ROW LEVEL SECURITY;

-- Users can view their own dismissals
CREATE POLICY "Users can view own dismissals" ON public.notification_dismissals
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own dismissals
CREATE POLICY "Users can insert own dismissals" ON public.notification_dismissals
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own dismissals
CREATE POLICY "Users can delete own dismissals" ON public.notification_dismissals
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to update notification timestamps
CREATE OR REPLACE FUNCTION update_notification_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  IF NEW.is_dismissed = true AND OLD.is_dismissed = false THEN
    NEW.dismissed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification timestamp updates
DROP TRIGGER IF EXISTS notification_timestamps ON public.notifications;
CREATE TRIGGER notification_timestamps
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamps();

-- Helper function to send notification to user
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, action_url, action_label, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_action_label, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to send organization-wide notification
CREATE OR REPLACE FUNCTION send_org_notification(
  p_organization_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (organization_id, type, title, message, action_url, action_label, metadata)
  VALUES (p_organization_id, p_type, p_title, p_message, p_action_url, p_action_label, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to send global notification
CREATE OR REPLACE FUNCTION send_global_notification(
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (is_global, type, title, message, action_url, action_label, expires_at, metadata)
  VALUES (true, p_type, p_title, p_message, p_action_url, p_action_label, p_expires_at, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
