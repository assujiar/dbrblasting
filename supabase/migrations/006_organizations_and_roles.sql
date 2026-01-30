-- =============================================================================
-- Organizations and Role-Based Access Control Migration
-- =============================================================================

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  -- SMTP Configuration for the organization
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_secure BOOLEAN DEFAULT false,
  smtp_from_name TEXT,
  smtp_from_email TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role and organization columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);

-- Add organization_id to leads for multi-tenant filtering
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_organization ON public.leads(organization_id);

-- Add organization_id to contact_groups for multi-tenant filtering
ALTER TABLE public.contact_groups
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_contact_groups_organization ON public.contact_groups(organization_id);

-- Add organization_id to email_templates for multi-tenant filtering
ALTER TABLE public.email_templates
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_email_templates_organization ON public.email_templates(organization_id);

-- Add organization_id to email_campaigns for multi-tenant filtering
ALTER TABLE public.email_campaigns
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_organization ON public.email_campaigns(organization_id);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can see all organizations
CREATE POLICY "Super admins can view all organizations" ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Policy: Super admins can insert organizations
CREATE POLICY "Super admins can insert organizations" ON public.organizations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Policy: Super admins can update organizations
CREATE POLICY "Super admins can update organizations" ON public.organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Policy: Super admins can delete organizations
CREATE POLICY "Super admins can delete organizations" ON public.organizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Policy: Org admins can view their own organization
CREATE POLICY "Org admins can view own organization" ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('org_admin', 'user')
    )
  );

-- Update existing RLS policies for leads to include organization filtering
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view leads" ON public.leads
  FOR SELECT
  USING (
    -- Super admin can see all
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    -- Users can see their own leads
    user_id = auth.uid()
    OR
    -- Users in same organization can see org leads
    organization_id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can insert leads" ON public.leads
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
CREATE POLICY "Users can update leads" ON public.leads
  FOR UPDATE
  USING (
    -- Super admin can update all
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
CREATE POLICY "Users can delete leads" ON public.leads
  FOR DELETE
  USING (
    -- Super admin can delete all
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

-- Update RLS for contact_groups
DROP POLICY IF EXISTS "Users can view their own groups" ON public.contact_groups;
CREATE POLICY "Users can view groups" ON public.contact_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own groups" ON public.contact_groups;
CREATE POLICY "Users can insert groups" ON public.contact_groups
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own groups" ON public.contact_groups;
CREATE POLICY "Users can update groups" ON public.contact_groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own groups" ON public.contact_groups;
CREATE POLICY "Users can delete groups" ON public.contact_groups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

-- Update RLS for email_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
CREATE POLICY "Users can view templates" ON public.email_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.email_templates;
CREATE POLICY "Users can insert templates" ON public.email_templates
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
CREATE POLICY "Users can update templates" ON public.email_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;
CREATE POLICY "Users can delete templates" ON public.email_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

-- Update RLS for email_campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can view campaigns" ON public.email_campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can insert campaigns" ON public.email_campaigns
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can update campaigns" ON public.email_campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can delete campaigns" ON public.email_campaigns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
    OR
    user_id = auth.uid()
  );

-- Update user_profiles RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view profiles" ON public.user_profiles
  FOR SELECT
  USING (
    -- Super admin can see all profiles
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
    OR
    -- Org admin can see profiles in their org
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.role = 'org_admin'
      )
      AND organization_id IN (
        SELECT organization_id FROM public.user_profiles
        WHERE user_id = auth.uid()
      )
    )
    OR
    -- Users can see their own profile
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update profiles" ON public.user_profiles
  FOR UPDATE
  USING (
    -- Super admin can update all
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
    OR
    -- Users can update their own
    user_id = auth.uid()
  );

-- Function to auto-set organization_id when user creates records
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user's organization_id if not already set
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM public.user_profiles
    WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-set organization_id
DROP TRIGGER IF EXISTS set_leads_org_id ON public.leads;
CREATE TRIGGER set_leads_org_id
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION set_organization_id();

DROP TRIGGER IF EXISTS set_groups_org_id ON public.contact_groups;
CREATE TRIGGER set_groups_org_id
  BEFORE INSERT ON public.contact_groups
  FOR EACH ROW EXECUTE FUNCTION set_organization_id();

DROP TRIGGER IF EXISTS set_templates_org_id ON public.email_templates;
CREATE TRIGGER set_templates_org_id
  BEFORE INSERT ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION set_organization_id();

DROP TRIGGER IF EXISTS set_campaigns_org_id ON public.email_campaigns;
CREATE TRIGGER set_campaigns_org_id
  BEFORE INSERT ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION set_organization_id();

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a default organization (can be updated later)
INSERT INTO public.organizations (name, slug, description, is_active)
VALUES ('Default Organization', 'default', 'Default organization for existing users', true)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON public.email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON public.email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_group ON public.contact_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_lead ON public.contact_group_members(lead_id);
