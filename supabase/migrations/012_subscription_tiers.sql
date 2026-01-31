-- =============================================================================
-- Organization Subscription Tiers
-- =============================================================================
-- This migration adds subscription tiering for organizations with feature limits:
-- - basic: 3 campaigns, 50 recipients/day
-- - regular: 5 campaigns, 100 recipients/day
-- - pro: 10 campaigns, 500 recipients/day
-- =============================================================================

-- Create subscription tier enum
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('basic', 'regular', 'pro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add subscription_tier column to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'basic';

-- Create table to track daily email usage per organization
CREATE TABLE IF NOT EXISTS public.organization_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, usage_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_daily_usage_org ON public.organization_daily_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_daily_usage_date ON public.organization_daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_org_daily_usage_org_date ON public.organization_daily_usage(organization_id, usage_date);

-- Enable RLS on usage table
ALTER TABLE public.organization_daily_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_daily_usage
DROP POLICY IF EXISTS "Super admins can manage all usage" ON public.organization_daily_usage;
CREATE POLICY "Super admins can manage all usage" ON public.organization_daily_usage
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Org admins can view own org usage" ON public.organization_daily_usage;
CREATE POLICY "Org admins can view own org usage" ON public.organization_daily_usage
  FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- =============================================================================
-- Helper Functions for Tier Limits
-- =============================================================================

-- Function to get tier limits
CREATE OR REPLACE FUNCTION public.get_tier_limits(tier subscription_tier)
RETURNS TABLE(max_campaigns INTEGER, max_recipients_per_day INTEGER) AS $$
BEGIN
  CASE tier
    WHEN 'basic' THEN
      RETURN QUERY SELECT 3, 50;
    WHEN 'regular' THEN
      RETURN QUERY SELECT 5, 100;
    WHEN 'pro' THEN
      RETURN QUERY SELECT 10, 500;
    ELSE
      RETURN QUERY SELECT 3, 50; -- Default to basic
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get organization's current tier limits
CREATE OR REPLACE FUNCTION public.get_organization_tier_limits(org_id UUID)
RETURNS TABLE(max_campaigns INTEGER, max_recipients_per_day INTEGER) AS $$
DECLARE
  org_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO org_tier
  FROM public.organizations
  WHERE id = org_id;

  IF org_tier IS NULL THEN
    org_tier := 'basic';
  END IF;

  RETURN QUERY SELECT * FROM public.get_tier_limits(org_tier);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get today's email count for an organization
CREATE OR REPLACE FUNCTION public.get_organization_daily_email_count(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
  email_count INTEGER;
BEGIN
  SELECT COALESCE(emails_sent, 0) INTO email_count
  FROM public.organization_daily_usage
  WHERE organization_id = org_id
  AND usage_date = CURRENT_DATE;

  RETURN COALESCE(email_count, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get campaign count for an organization
CREATE OR REPLACE FUNCTION public.get_organization_campaign_count(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
  campaign_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campaign_count
  FROM public.email_campaigns
  WHERE organization_id = org_id;

  RETURN COALESCE(campaign_count, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if organization can send more emails today
CREATE OR REPLACE FUNCTION public.can_send_emails(org_id UUID, email_count INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current usage
  SELECT public.get_organization_daily_email_count(org_id) INTO current_count;

  -- Get max allowed for this tier
  SELECT max_recipients_per_day INTO max_allowed
  FROM public.get_organization_tier_limits(org_id);

  RETURN (current_count + email_count) <= max_allowed;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if organization can create more campaigns
CREATE OR REPLACE FUNCTION public.can_create_campaign(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current campaign count
  SELECT public.get_organization_campaign_count(org_id) INTO current_count;

  -- Get max allowed for this tier
  SELECT max_campaigns INTO max_allowed
  FROM public.get_organization_tier_limits(org_id);

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to increment daily email count (call after sending emails)
CREATE OR REPLACE FUNCTION public.increment_daily_email_count(org_id UUID, count INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.organization_daily_usage (organization_id, usage_date, emails_sent)
  VALUES (org_id, CURRENT_DATE, count)
  ON CONFLICT (organization_id, usage_date)
  DO UPDATE SET
    emails_sent = organization_daily_usage.emails_sent + EXCLUDED.emails_sent,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- View for organization usage summary
-- =============================================================================

CREATE OR REPLACE VIEW public.organization_usage_summary AS
SELECT
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_tier,
  tl.max_campaigns,
  tl.max_recipients_per_day,
  COALESCE(public.get_organization_campaign_count(o.id), 0) AS current_campaign_count,
  COALESCE(public.get_organization_daily_email_count(o.id), 0) AS today_email_count
FROM public.organizations o
CROSS JOIN LATERAL public.get_tier_limits(o.subscription_tier) tl;

-- Grant access to the view
GRANT SELECT ON public.organization_usage_summary TO authenticated;
