-- =============================================================================
-- Fix RLS Infinite Recursion
-- =============================================================================
-- The issue: RLS policies on user_profiles query user_profiles to check roles,
-- causing infinite recursion.
--
-- Solution: Use SECURITY DEFINER functions to check roles. These functions
-- run with elevated privileges and bypass RLS, preventing recursion.
-- =============================================================================

-- First, ensure helper functions exist and are SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper to check if user is org_admin
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'org_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper to check if user can manage resource in their org (org_admin only)
CREATE OR REPLACE FUNCTION public.can_manage_in_org(resource_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    public.get_user_role() = 'org_admin'
    AND resource_org_id = public.get_user_organization_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Fix user_profiles RLS (the main source of infinite recursion)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view profiles" ON public.user_profiles
  FOR SELECT
  USING (
    -- Users can always see their own profile
    user_id = auth.uid()
    OR
    -- Super admin can see all profiles
    public.is_super_admin()
    OR
    -- Org admin can see profiles in their org
    (
      public.get_user_role() = 'org_admin'
      AND organization_id = public.get_user_organization_id()
    )
  );

DROP POLICY IF EXISTS "Users can insert profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR
    public.is_super_admin()
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update profiles" ON public.user_profiles
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    public.is_super_admin()
  );

-- =============================================================================
-- Fix organizations RLS
-- =============================================================================

DROP POLICY IF EXISTS "Super admins can view all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can view own organization" ON public.organizations;
CREATE POLICY "Users can view organizations" ON public.organizations
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Super admins can insert organizations" ON public.organizations;
CREATE POLICY "Super admins can insert organizations" ON public.organizations
  FOR INSERT
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can update organizations" ON public.organizations;
CREATE POLICY "Super admins can update organizations" ON public.organizations
  FOR UPDATE
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete organizations" ON public.organizations;
CREATE POLICY "Super admins can delete organizations" ON public.organizations
  FOR DELETE
  USING (public.is_super_admin());

-- =============================================================================
-- Fix leads RLS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
CREATE POLICY "Users can view leads" ON public.leads
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
CREATE POLICY "Users can insert leads" ON public.leads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
CREATE POLICY "Users can update leads" ON public.leads
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Users can delete leads" ON public.leads;
CREATE POLICY "Users can delete leads" ON public.leads
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- =============================================================================
-- Fix contact_groups RLS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view groups" ON public.contact_groups;
CREATE POLICY "Users can view groups" ON public.contact_groups
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Users can insert groups" ON public.contact_groups;
CREATE POLICY "Users can insert groups" ON public.contact_groups
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update groups" ON public.contact_groups;
CREATE POLICY "Users can update groups" ON public.contact_groups
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Users can delete groups" ON public.contact_groups;
CREATE POLICY "Users can delete groups" ON public.contact_groups
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- =============================================================================
-- Fix contact_group_members RLS
-- =============================================================================

DROP POLICY IF EXISTS "Group members: user can view their memberships" ON public.contact_group_members;
CREATE POLICY "Users can view group members" ON public.contact_group_members
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Group members: user can insert memberships" ON public.contact_group_members;
CREATE POLICY "Users can insert group members" ON public.contact_group_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Group members: user can update their memberships" ON public.contact_group_members;
CREATE POLICY "Users can update group members" ON public.contact_group_members
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Group members: user can delete their memberships" ON public.contact_group_members;
CREATE POLICY "Users can delete group members" ON public.contact_group_members
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- =============================================================================
-- Fix email_templates RLS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view templates" ON public.email_templates;
CREATE POLICY "Users can view templates" ON public.email_templates
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Users can insert templates" ON public.email_templates;
CREATE POLICY "Users can insert templates" ON public.email_templates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update templates" ON public.email_templates;
CREATE POLICY "Users can update templates" ON public.email_templates
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Users can delete templates" ON public.email_templates;
CREATE POLICY "Users can delete templates" ON public.email_templates
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- =============================================================================
-- Fix email_campaigns RLS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view campaigns" ON public.email_campaigns;
CREATE POLICY "Users can view campaigns" ON public.email_campaigns
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Users can insert campaigns" ON public.email_campaigns;
CREATE POLICY "Users can insert campaigns" ON public.email_campaigns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update campaigns" ON public.email_campaigns;
CREATE POLICY "Users can update campaigns" ON public.email_campaigns
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Users can delete campaigns" ON public.email_campaigns;
CREATE POLICY "Users can delete campaigns" ON public.email_campaigns
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- =============================================================================
-- Fix email_campaign_recipients RLS
-- =============================================================================

DROP POLICY IF EXISTS "Recipients: user can view their campaign recipients" ON public.email_campaign_recipients;
CREATE POLICY "Users can view recipients" ON public.email_campaign_recipients
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    organization_id = public.get_user_organization_id()
  );

DROP POLICY IF EXISTS "Recipients: user can insert recipients for their campaigns" ON public.email_campaign_recipients;
CREATE POLICY "Users can insert recipients" ON public.email_campaign_recipients
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Recipients: user can update recipients for their campaigns" ON public.email_campaign_recipients;
CREATE POLICY "Users can update recipients" ON public.email_campaign_recipients
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

DROP POLICY IF EXISTS "Recipients: user can delete recipients for their campaigns" ON public.email_campaign_recipients;
CREATE POLICY "Users can delete recipients" ON public.email_campaign_recipients
  FOR DELETE
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    public.can_manage_in_org(organization_id)
  );

-- Add organization_id column to contact_group_members if not exists
ALTER TABLE public.contact_group_members
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add organization_id column to email_campaign_recipients if not exists
ALTER TABLE public.email_campaign_recipients
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_contact_group_members_organization ON public.contact_group_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_organization ON public.email_campaign_recipients(organization_id);
