-- =============================================================================
-- Schema Fixes Migration
-- Fixes mismatches between migrations and ensures consistency
-- =============================================================================

-- =============================================================================
-- 1. ENSURE TRIGGER FUNCTION EXISTS
-- Some migrations use different function names, ensure both exist
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create alias function if it doesn't exist (for compatibility)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. ENSURE updated_at COLUMNS EXIST ON ALL TABLES
-- =============================================================================

-- Add updated_at to contact_group_members if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'contact_group_members'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.contact_group_members
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at to email_campaign_recipients if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaign_recipients'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.email_campaign_recipients
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- =============================================================================
-- 3. ENSURE TRIGGERS EXIST FOR updated_at
-- =============================================================================

-- contact_group_members trigger
DROP TRIGGER IF EXISTS touch_contact_group_members ON public.contact_group_members;
DROP TRIGGER IF EXISTS update_contact_group_members_updated_at ON public.contact_group_members;
CREATE TRIGGER update_contact_group_members_updated_at
  BEFORE UPDATE ON public.contact_group_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- email_campaign_recipients trigger
DROP TRIGGER IF EXISTS touch_email_campaign_recipients ON public.email_campaign_recipients;
DROP TRIGGER IF EXISTS update_email_campaign_recipients_updated_at ON public.email_campaign_recipients;
CREATE TRIGGER update_email_campaign_recipients_updated_at
  BEFORE UPDATE ON public.email_campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- user_profiles trigger (ensure it uses correct function)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- organizations trigger
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. ENSURE CHECK CONSTRAINTS EXIST FOR STATUS FIELDS
-- =============================================================================

-- email_campaigns status constraint
DO $$
BEGIN
  -- Check if constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'email_campaigns'
    AND constraint_name = 'email_campaigns_status_check'
  ) THEN
    -- Try to add the constraint
    BEGIN
      ALTER TABLE public.email_campaigns
      ADD CONSTRAINT email_campaigns_status_check
      CHECK (status IN ('draft', 'running', 'completed', 'failed'));
    EXCEPTION WHEN duplicate_object THEN
      -- Constraint already exists with different name, ignore
      NULL;
    END;
  END IF;
END $$;

-- email_campaign_recipients status constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'email_campaign_recipients'
    AND constraint_name = 'email_campaign_recipients_status_check'
  ) THEN
    BEGIN
      ALTER TABLE public.email_campaign_recipients
      ADD CONSTRAINT email_campaign_recipients_status_check
      CHECK (status IN ('pending', 'sent', 'failed'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- =============================================================================
-- 5. UPDATE campaigns_with_counts FUNCTION
-- Now includes all relevant fields including organization_id
-- =============================================================================

CREATE OR REPLACE FUNCTION public.campaigns_with_counts()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  organization_id UUID,
  template_id UUID,
  name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT,
  sent_count BIGINT,
  failed_count BIGINT,
  pending_count BIGINT
) LANGUAGE SQL STABLE AS $$
  SELECT
    c.id,
    c.user_id,
    c.organization_id,
    c.template_id,
    c.name,
    c.status,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*) FROM public.email_campaign_recipients r WHERE r.campaign_id = c.id) AS total_count,
    (SELECT COUNT(*) FROM public.email_campaign_recipients r WHERE r.campaign_id = c.id AND r.status = 'sent') AS sent_count,
    (SELECT COUNT(*) FROM public.email_campaign_recipients r WHERE r.campaign_id = c.id AND r.status = 'failed') AS failed_count,
    (SELECT COUNT(*) FROM public.email_campaign_recipients r WHERE r.campaign_id = c.id AND r.status = 'pending') AS pending_count
  FROM public.email_campaigns c
  WHERE c.user_id = auth.uid()
  ORDER BY c.created_at DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.campaigns_with_counts() TO anon, authenticated;

-- =============================================================================
-- 6. FIX RLS POLICIES - Ensure all policies exist with correct names
-- Using IF NOT EXISTS pattern to avoid conflicts
-- =============================================================================

-- Fix contact_group_members RLS policies (these might be missing)
DO $$
BEGIN
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'contact_group_members'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.contact_group_members ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop any conflicting policies and recreate
DROP POLICY IF EXISTS "Group members: user can view their memberships" ON public.contact_group_members;
DROP POLICY IF EXISTS "Group members: user can insert memberships" ON public.contact_group_members;
DROP POLICY IF EXISTS "Group members: user can update their memberships" ON public.contact_group_members;
DROP POLICY IF EXISTS "Group members: user can delete their memberships" ON public.contact_group_members;
DROP POLICY IF EXISTS "Users can view their own group members" ON public.contact_group_members;
DROP POLICY IF EXISTS "Users can insert their own group members" ON public.contact_group_members;
DROP POLICY IF EXISTS "Users can delete their own group members" ON public.contact_group_members;

-- Create consistent policies for contact_group_members
CREATE POLICY "Users can view group members" ON public.contact_group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert group members" ON public.contact_group_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update group members" ON public.contact_group_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete group members" ON public.contact_group_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

-- Fix email_campaign_recipients RLS policies
DROP POLICY IF EXISTS "Recipients: user can view their campaign recipients" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Recipients: user can insert recipients for their campaigns" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Recipients: user can update recipients for their campaigns" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Recipients: user can delete recipients for their campaigns" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Users can view their own recipients" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Users can insert their own recipients" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON public.email_campaign_recipients;

CREATE POLICY "Users can view recipients" ON public.email_campaign_recipients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert recipients" ON public.email_campaign_recipients
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update recipients" ON public.email_campaign_recipients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete recipients" ON public.email_campaign_recipients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR user_id = auth.uid()
  );

-- =============================================================================
-- 7. ENSURE ALL REQUIRED INDEXES EXIST
-- =============================================================================

-- Indexes for contact_group_members
CREATE INDEX IF NOT EXISTS idx_contact_group_members_user_id ON public.contact_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_group_id ON public.contact_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_lead_id ON public.contact_group_members(lead_id);

-- Indexes for email_campaign_recipients
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_user_id ON public.email_campaign_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id ON public.email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_lead_id ON public.email_campaign_recipients(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON public.email_campaign_recipients(status);

-- =============================================================================
-- 8. HELPER FUNCTION: Get user role (for use in RLS without circular dependency)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
  role_value user_role;
BEGIN
  SELECT role INTO role_value
  FROM public.user_profiles
  WHERE user_id = user_uuid;

  RETURN COALESCE(role_value, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- 9. FIX user_profiles SELECT policy to avoid circular dependency
-- =============================================================================

-- Drop all existing SELECT policies on user_profiles
DROP POLICY IF EXISTS "Users can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;

-- Create a simple non-circular policy
-- Super admins, org admins in same org, or own profile
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    public.get_user_role(auth.uid()) = 'super_admin'
    OR
    (
      public.get_user_role(auth.uid()) = 'org_admin'
      AND organization_id = (
        SELECT organization_id FROM public.user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- DONE
-- =============================================================================
