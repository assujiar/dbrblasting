-- =============================================================================
-- Analytics Functions for Dashboard
-- =============================================================================
-- This migration creates analytics functions with proper RLS support for:
-- - Campaign performance metrics
-- - Email delivery statistics
-- - Lead growth tracking
-- - Daily/weekly/monthly trends
-- =============================================================================

-- =============================================================================
-- Function: Get campaign statistics
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_campaign_stats()
RETURNS TABLE(
  total_campaigns BIGINT,
  completed_campaigns BIGINT,
  running_campaigns BIGINT,
  draft_campaigns BIGINT,
  failed_campaigns BIGINT
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get user's organization and admin status
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    -- Super admin sees all campaigns (or filtered by org if they have one)
    IF user_org_id IS NOT NULL THEN
      RETURN QUERY
      SELECT
        COUNT(*)::BIGINT as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_campaigns,
        COUNT(*) FILTER (WHERE status = 'running')::BIGINT as running_campaigns,
        COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_campaigns,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_campaigns
      FROM public.email_campaigns
      WHERE organization_id = user_org_id;
    ELSE
      RETURN QUERY
      SELECT
        COUNT(*)::BIGINT as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_campaigns,
        COUNT(*) FILTER (WHERE status = 'running')::BIGINT as running_campaigns,
        COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_campaigns,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_campaigns
      FROM public.email_campaigns;
    END IF;
  ELSE
    -- Regular users see their org's campaigns
    RETURN QUERY
    SELECT
      COUNT(*)::BIGINT as total_campaigns,
      COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_campaigns,
      COUNT(*) FILTER (WHERE status = 'running')::BIGINT as running_campaigns,
      COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_campaigns,
      COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_campaigns
    FROM public.email_campaigns
    WHERE user_id = auth.uid()
       OR (organization_id IS NOT NULL AND organization_id = user_org_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get email delivery statistics
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_email_delivery_stats()
RETURNS TABLE(
  total_emails BIGINT,
  sent_emails BIGINT,
  pending_emails BIGINT,
  failed_emails BIGINT,
  delivery_rate NUMERIC,
  failure_rate NUMERIC
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
  total_count BIGINT;
  sent_count BIGINT;
  pending_count BIGINT;
  failed_count BIGINT;
BEGIN
  -- Get user's organization and admin status
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'sent'),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'failed')
      INTO total_count, sent_count, pending_count, failed_count
      FROM public.email_campaign_recipients
      WHERE organization_id = user_org_id;
    ELSE
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'sent'),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'failed')
      INTO total_count, sent_count, pending_count, failed_count
      FROM public.email_campaign_recipients;
    END IF;
  ELSE
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'sent'),
      COUNT(*) FILTER (WHERE status = 'pending'),
      COUNT(*) FILTER (WHERE status = 'failed')
    INTO total_count, sent_count, pending_count, failed_count
    FROM public.email_campaign_recipients
    WHERE user_id = auth.uid()
       OR (organization_id IS NOT NULL AND organization_id = user_org_id);
  END IF;

  RETURN QUERY SELECT
    total_count,
    sent_count,
    pending_count,
    failed_count,
    CASE WHEN total_count > 0 THEN ROUND((sent_count::NUMERIC / total_count::NUMERIC) * 100, 2) ELSE 0 END,
    CASE WHEN total_count > 0 THEN ROUND((failed_count::NUMERIC / total_count::NUMERIC) * 100, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get daily email activity for last N days
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_daily_email_activity(days_count INTEGER DEFAULT 30)
RETURNS TABLE(
  activity_date DATE,
  emails_sent BIGINT,
  emails_failed BIGINT
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      RETURN QUERY
      SELECT
        DATE(sent_at) as activity_date,
        COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as emails_sent,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as emails_failed
      FROM public.email_campaign_recipients
      WHERE sent_at >= CURRENT_DATE - days_count
        AND organization_id = user_org_id
      GROUP BY DATE(sent_at)
      ORDER BY activity_date DESC;
    ELSE
      RETURN QUERY
      SELECT
        DATE(sent_at) as activity_date,
        COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as emails_sent,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as emails_failed
      FROM public.email_campaign_recipients
      WHERE sent_at >= CURRENT_DATE - days_count
      GROUP BY DATE(sent_at)
      ORDER BY activity_date DESC;
    END IF;
  ELSE
    RETURN QUERY
    SELECT
      DATE(sent_at) as activity_date,
      COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as emails_sent,
      COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as emails_failed
    FROM public.email_campaign_recipients
    WHERE sent_at >= CURRENT_DATE - days_count
      AND (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
    GROUP BY DATE(sent_at)
    ORDER BY activity_date DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get leads growth over time
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_leads_growth(days_count INTEGER DEFAULT 30)
RETURNS TABLE(
  created_date DATE,
  leads_count BIGINT,
  cumulative_total BIGINT
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      RETURN QUERY
      WITH daily_counts AS (
        SELECT
          DATE(created_at) as dt,
          COUNT(*)::BIGINT as cnt
        FROM public.leads
        WHERE created_at >= CURRENT_DATE - days_count
          AND organization_id = user_org_id
        GROUP BY DATE(created_at)
      )
      SELECT
        dt as created_date,
        cnt as leads_count,
        SUM(cnt) OVER (ORDER BY dt)::BIGINT as cumulative_total
      FROM daily_counts
      ORDER BY dt DESC;
    ELSE
      RETURN QUERY
      WITH daily_counts AS (
        SELECT
          DATE(created_at) as dt,
          COUNT(*)::BIGINT as cnt
        FROM public.leads
        WHERE created_at >= CURRENT_DATE - days_count
        GROUP BY DATE(created_at)
      )
      SELECT
        dt as created_date,
        cnt as leads_count,
        SUM(cnt) OVER (ORDER BY dt)::BIGINT as cumulative_total
      FROM daily_counts
      ORDER BY dt DESC;
    END IF;
  ELSE
    RETURN QUERY
    WITH daily_counts AS (
      SELECT
        DATE(created_at) as dt,
        COUNT(*)::BIGINT as cnt
      FROM public.leads
      WHERE created_at >= CURRENT_DATE - days_count
        AND (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
      GROUP BY DATE(created_at)
    )
    SELECT
      dt as created_date,
      cnt as leads_count,
      SUM(cnt) OVER (ORDER BY dt)::BIGINT as cumulative_total
    FROM daily_counts
    ORDER BY dt DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get recent campaigns with details
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_recent_campaigns(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id UUID,
  name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  total_recipients BIGINT,
  sent_count BIGINT,
  failed_count BIGINT,
  pending_count BIGINT
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      RETURN QUERY
      SELECT
        c.id,
        c.name,
        c.status,
        c.created_at,
        COUNT(r.id)::BIGINT as total_recipients,
        COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
        COUNT(r.id) FILTER (WHERE r.status = 'failed')::BIGINT as failed_count,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')::BIGINT as pending_count
      FROM public.email_campaigns c
      LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
      WHERE c.organization_id = user_org_id
      GROUP BY c.id, c.name, c.status, c.created_at
      ORDER BY c.created_at DESC
      LIMIT limit_count;
    ELSE
      RETURN QUERY
      SELECT
        c.id,
        c.name,
        c.status,
        c.created_at,
        COUNT(r.id)::BIGINT as total_recipients,
        COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
        COUNT(r.id) FILTER (WHERE r.status = 'failed')::BIGINT as failed_count,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')::BIGINT as pending_count
      FROM public.email_campaigns c
      LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
      GROUP BY c.id, c.name, c.status, c.created_at
      ORDER BY c.created_at DESC
      LIMIT limit_count;
    END IF;
  ELSE
    RETURN QUERY
    SELECT
      c.id,
      c.name,
      c.status,
      c.created_at,
      COUNT(r.id)::BIGINT as total_recipients,
      COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
      COUNT(r.id) FILTER (WHERE r.status = 'failed')::BIGINT as failed_count,
      COUNT(r.id) FILTER (WHERE r.status = 'pending')::BIGINT as pending_count
    FROM public.email_campaigns c
    LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
    WHERE c.user_id = auth.uid()
       OR (c.organization_id IS NOT NULL AND c.organization_id = user_org_id)
    GROUP BY c.id, c.name, c.status, c.created_at
    ORDER BY c.created_at DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get top performing campaigns
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_top_campaigns(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id UUID,
  name TEXT,
  status TEXT,
  total_recipients BIGINT,
  sent_count BIGINT,
  delivery_rate NUMERIC
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      RETURN QUERY
      SELECT
        c.id,
        c.name,
        c.status,
        COUNT(r.id)::BIGINT as total_recipients,
        COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
        CASE WHEN COUNT(r.id) > 0
          THEN ROUND((COUNT(r.id) FILTER (WHERE r.status = 'sent')::NUMERIC / COUNT(r.id)::NUMERIC) * 100, 2)
          ELSE 0
        END as delivery_rate
      FROM public.email_campaigns c
      LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
      WHERE c.organization_id = user_org_id
        AND c.status = 'completed'
      GROUP BY c.id, c.name, c.status
      ORDER BY delivery_rate DESC, sent_count DESC
      LIMIT limit_count;
    ELSE
      RETURN QUERY
      SELECT
        c.id,
        c.name,
        c.status,
        COUNT(r.id)::BIGINT as total_recipients,
        COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
        CASE WHEN COUNT(r.id) > 0
          THEN ROUND((COUNT(r.id) FILTER (WHERE r.status = 'sent')::NUMERIC / COUNT(r.id)::NUMERIC) * 100, 2)
          ELSE 0
        END as delivery_rate
      FROM public.email_campaigns c
      LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
      WHERE c.status = 'completed'
      GROUP BY c.id, c.name, c.status
      ORDER BY delivery_rate DESC, sent_count DESC
      LIMIT limit_count;
    END IF;
  ELSE
    RETURN QUERY
    SELECT
      c.id,
      c.name,
      c.status,
      COUNT(r.id)::BIGINT as total_recipients,
      COUNT(r.id) FILTER (WHERE r.status = 'sent')::BIGINT as sent_count,
      CASE WHEN COUNT(r.id) > 0
        THEN ROUND((COUNT(r.id) FILTER (WHERE r.status = 'sent')::NUMERIC / COUNT(r.id)::NUMERIC) * 100, 2)
        ELSE 0
      END as delivery_rate
    FROM public.email_campaigns c
    LEFT JOIN public.email_campaign_recipients r ON r.campaign_id = c.id
    WHERE (c.user_id = auth.uid() OR (c.organization_id IS NOT NULL AND c.organization_id = user_org_id))
      AND c.status = 'completed'
    GROUP BY c.id, c.name, c.status
    ORDER BY delivery_rate DESC, sent_count DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get dashboard overview stats
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_overview()
RETURNS TABLE(
  total_leads BIGINT,
  total_groups BIGINT,
  total_templates BIGINT,
  total_campaigns BIGINT,
  total_emails_sent BIGINT,
  delivery_rate NUMERIC,
  leads_this_month BIGINT,
  campaigns_this_month BIGINT
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
  v_total_leads BIGINT;
  v_total_groups BIGINT;
  v_total_templates BIGINT;
  v_total_campaigns BIGINT;
  v_total_sent BIGINT;
  v_total_recipients BIGINT;
  v_leads_month BIGINT;
  v_campaigns_month BIGINT;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_total_leads FROM public.leads WHERE organization_id = user_org_id;
      SELECT COUNT(*) INTO v_total_groups FROM public.contact_groups WHERE organization_id = user_org_id;
      SELECT COUNT(*) INTO v_total_templates FROM public.email_templates WHERE organization_id = user_org_id;
      SELECT COUNT(*) INTO v_total_campaigns FROM public.email_campaigns WHERE organization_id = user_org_id;
      SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'sent')
        INTO v_total_recipients, v_total_sent
        FROM public.email_campaign_recipients WHERE organization_id = user_org_id;
      SELECT COUNT(*) INTO v_leads_month FROM public.leads
        WHERE organization_id = user_org_id AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
      SELECT COUNT(*) INTO v_campaigns_month FROM public.email_campaigns
        WHERE organization_id = user_org_id AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
    ELSE
      SELECT COUNT(*) INTO v_total_leads FROM public.leads;
      SELECT COUNT(*) INTO v_total_groups FROM public.contact_groups;
      SELECT COUNT(*) INTO v_total_templates FROM public.email_templates;
      SELECT COUNT(*) INTO v_total_campaigns FROM public.email_campaigns;
      SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'sent')
        INTO v_total_recipients, v_total_sent
        FROM public.email_campaign_recipients;
      SELECT COUNT(*) INTO v_leads_month FROM public.leads
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
      SELECT COUNT(*) INTO v_campaigns_month FROM public.email_campaigns
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
    END IF;
  ELSE
    SELECT COUNT(*) INTO v_total_leads FROM public.leads
      WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id);
    SELECT COUNT(*) INTO v_total_groups FROM public.contact_groups
      WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id);
    SELECT COUNT(*) INTO v_total_templates FROM public.email_templates
      WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id);
    SELECT COUNT(*) INTO v_total_campaigns FROM public.email_campaigns
      WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id);
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'sent')
      INTO v_total_recipients, v_total_sent
      FROM public.email_campaign_recipients
      WHERE user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id);
    SELECT COUNT(*) INTO v_leads_month FROM public.leads
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
    SELECT COUNT(*) INTO v_campaigns_month FROM public.email_campaigns
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
  END IF;

  RETURN QUERY SELECT
    v_total_leads,
    v_total_groups,
    v_total_templates,
    v_total_campaigns,
    v_total_sent,
    CASE WHEN v_total_recipients > 0 THEN ROUND((v_total_sent::NUMERIC / v_total_recipients::NUMERIC) * 100, 2) ELSE 0 END,
    v_leads_month,
    v_campaigns_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Function: Get weekly comparison stats
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_weekly_comparison()
RETURNS TABLE(
  this_week_emails BIGINT,
  last_week_emails BIGINT,
  this_week_campaigns BIGINT,
  last_week_campaigns BIGINT,
  this_week_leads BIGINT,
  last_week_leads BIGINT,
  email_change_percent NUMERIC,
  campaign_change_percent NUMERIC,
  lead_change_percent NUMERIC
) AS $$
DECLARE
  user_org_id UUID;
  is_admin BOOLEAN;
  tw_emails BIGINT;
  lw_emails BIGINT;
  tw_campaigns BIGINT;
  lw_campaigns BIGINT;
  tw_leads BIGINT;
  lw_leads BIGINT;
BEGIN
  SELECT organization_id INTO user_org_id FROM public.user_profiles WHERE user_id = auth.uid();
  is_admin := public.is_super_admin();

  IF is_admin THEN
    IF user_org_id IS NOT NULL THEN
      -- This week
      SELECT COUNT(*) INTO tw_emails FROM public.email_campaign_recipients
        WHERE organization_id = user_org_id AND sent_at >= DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO tw_campaigns FROM public.email_campaigns
        WHERE organization_id = user_org_id AND created_at >= DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO tw_leads FROM public.leads
        WHERE organization_id = user_org_id AND created_at >= DATE_TRUNC('week', CURRENT_DATE);
      -- Last week
      SELECT COUNT(*) INTO lw_emails FROM public.email_campaign_recipients
        WHERE organization_id = user_org_id
          AND sent_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND sent_at < DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO lw_campaigns FROM public.email_campaigns
        WHERE organization_id = user_org_id
          AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND created_at < DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO lw_leads FROM public.leads
        WHERE organization_id = user_org_id
          AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND created_at < DATE_TRUNC('week', CURRENT_DATE);
    ELSE
      -- This week - all data
      SELECT COUNT(*) INTO tw_emails FROM public.email_campaign_recipients
        WHERE sent_at >= DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO tw_campaigns FROM public.email_campaigns
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO tw_leads FROM public.leads
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE);
      -- Last week - all data
      SELECT COUNT(*) INTO lw_emails FROM public.email_campaign_recipients
        WHERE sent_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND sent_at < DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO lw_campaigns FROM public.email_campaigns
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND created_at < DATE_TRUNC('week', CURRENT_DATE);
      SELECT COUNT(*) INTO lw_leads FROM public.leads
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND created_at < DATE_TRUNC('week', CURRENT_DATE);
    END IF;
  ELSE
    -- This week
    SELECT COUNT(*) INTO tw_emails FROM public.email_campaign_recipients
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND sent_at >= DATE_TRUNC('week', CURRENT_DATE);
    SELECT COUNT(*) INTO tw_campaigns FROM public.email_campaigns
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE);
    SELECT COUNT(*) INTO tw_leads FROM public.leads
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE);
    -- Last week
    SELECT COUNT(*) INTO lw_emails FROM public.email_campaign_recipients
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND sent_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
        AND sent_at < DATE_TRUNC('week', CURRENT_DATE);
    SELECT COUNT(*) INTO lw_campaigns FROM public.email_campaigns
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
        AND created_at < DATE_TRUNC('week', CURRENT_DATE);
    SELECT COUNT(*) INTO lw_leads FROM public.leads
      WHERE (user_id = auth.uid() OR (organization_id IS NOT NULL AND organization_id = user_org_id))
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
        AND created_at < DATE_TRUNC('week', CURRENT_DATE);
  END IF;

  RETURN QUERY SELECT
    tw_emails,
    lw_emails,
    tw_campaigns,
    lw_campaigns,
    tw_leads,
    lw_leads,
    CASE WHEN lw_emails > 0 THEN ROUND(((tw_emails - lw_emails)::NUMERIC / lw_emails::NUMERIC) * 100, 2) ELSE 0 END,
    CASE WHEN lw_campaigns > 0 THEN ROUND(((tw_campaigns - lw_campaigns)::NUMERIC / lw_campaigns::NUMERIC) * 100, 2) ELSE 0 END,
    CASE WHEN lw_leads > 0 THEN ROUND(((tw_leads - lw_leads)::NUMERIC / lw_leads::NUMERIC) * 100, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- Grant execute permissions
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.get_campaign_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_delivery_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_email_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leads_growth(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_campaigns(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_campaigns(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_comparison() TO authenticated;
