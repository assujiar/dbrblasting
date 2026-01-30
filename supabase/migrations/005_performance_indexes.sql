-- ============================================================================
-- PERFORMANCE INDEXES
-- Additional indexes to optimize queries for new features
-- ============================================================================

-- Index for filtering campaigns by template_id (template detail page)
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template_id
  ON public.email_campaigns(template_id);

-- Index for filtering campaign recipients by lead_id (lead email history)
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_lead_id
  ON public.email_campaign_recipients(lead_id);

-- Index for date range filtering on campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at
  ON public.email_campaigns(created_at DESC);

-- Index for date range filtering on campaign recipients
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_created_at
  ON public.email_campaign_recipients(created_at DESC);

-- Composite index for filtering group members by lead
CREATE INDEX IF NOT EXISTS idx_contact_group_members_lead_id
  ON public.contact_group_members(lead_id);

-- Index for faster lead lookup by email (for Excel import deduplication)
CREATE INDEX IF NOT EXISTS idx_leads_email
  ON public.leads(user_id, LOWER(email));
