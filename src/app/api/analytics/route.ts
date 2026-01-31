import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const days = parseInt(searchParams.get('days') || '30')

    // Determine organization filter
    const isSuperAdminWithoutOrg = profile?.role === 'super_admin' && !profile.organization_id
    const orgId = !isSuperAdminWithoutOrg ? profile?.organization_id : null

    switch (type) {
      case 'overview': {
        // Get overview stats
        let leadsQuery = client.from('leads').select('id', { count: 'exact', head: true })
        let groupsQuery = client.from('contact_groups').select('id', { count: 'exact', head: true })
        let templatesQuery = client.from('email_templates').select('id', { count: 'exact', head: true })
        let campaignsQuery = client.from('email_campaigns').select('id', { count: 'exact', head: true })
        let recipientsQuery = client.from('email_campaign_recipients').select('id, status')
        let leadsMonthQuery = client.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', getMonthStart())
        let campaignsMonthQuery = client.from('email_campaigns').select('id', { count: 'exact', head: true }).gte('created_at', getMonthStart())

        if (orgId) {
          leadsQuery = leadsQuery.eq('organization_id', orgId)
          groupsQuery = groupsQuery.eq('organization_id', orgId)
          templatesQuery = templatesQuery.eq('organization_id', orgId)
          campaignsQuery = campaignsQuery.eq('organization_id', orgId)
          recipientsQuery = recipientsQuery.eq('organization_id', orgId)
          leadsMonthQuery = leadsMonthQuery.eq('organization_id', orgId)
          campaignsMonthQuery = campaignsMonthQuery.eq('organization_id', orgId)
        }

        const [
          leadsResult,
          groupsResult,
          templatesResult,
          campaignsResult,
          recipientsResult,
          leadsThisMonthResult,
          campaignsThisMonthResult,
        ] = await Promise.all([
          leadsQuery,
          groupsQuery,
          templatesQuery,
          campaignsQuery,
          recipientsQuery,
          leadsMonthQuery,
          campaignsMonthQuery,
        ])

        const recipients = recipientsResult.data || []
        const totalEmails = recipients.length
        const sentEmails = recipients.filter((r: { status: string }) => r.status === 'sent').length

        return NextResponse.json({
          data: {
            total_leads: leadsResult.count || 0,
            total_groups: groupsResult.count || 0,
            total_templates: templatesResult.count || 0,
            total_campaigns: campaignsResult.count || 0,
            total_emails_sent: sentEmails,
            delivery_rate: totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100 * 100) / 100 : 0,
            leads_this_month: leadsThisMonthResult.count || 0,
            campaigns_this_month: campaignsThisMonthResult.count || 0,
          },
        })
      }

      case 'campaign_stats': {
        // Get campaigns with their status
        let campaignQuery = client.from('email_campaigns').select('id, status')
        if (orgId) {
          campaignQuery = campaignQuery.eq('organization_id', orgId)
        }

        const { data: campaigns, error: campaignError } = await campaignQuery

        if (campaignError) {
          return NextResponse.json({ error: campaignError.message }, { status: 500 })
        }

        const campaignList = campaigns || []
        const campaignIds = campaignList.map((c: { id: string }) => c.id)

        // Get email stats per campaign
        let recipientStats: { campaign_id: string; status: string }[] = []
        if (campaignIds.length > 0) {
          const { data: recipients } = await client
            .from('email_campaign_recipients')
            .select('campaign_id, status')
            .in('campaign_id', campaignIds)
          recipientStats = recipients || []
        }

        // Group recipient stats by campaign
        const campaignRecipients: Record<string, { sent: number; failed: number; pending: number; total: number }> = {}
        recipientStats.forEach((r) => {
          if (!campaignRecipients[r.campaign_id]) {
            campaignRecipients[r.campaign_id] = { sent: 0, failed: 0, pending: 0, total: 0 }
          }
          campaignRecipients[r.campaign_id].total++
          if (r.status === 'sent') campaignRecipients[r.campaign_id].sent++
          else if (r.status === 'failed') campaignRecipients[r.campaign_id].failed++
          else if (r.status === 'pending') campaignRecipients[r.campaign_id].pending++
        })

        // Calculate stats per status
        const statusStats: Record<string, { count: number; sent: number; failed: number; pending: number; total: number }> = {
          completed: { count: 0, sent: 0, failed: 0, pending: 0, total: 0 },
          running: { count: 0, sent: 0, failed: 0, pending: 0, total: 0 },
          draft: { count: 0, sent: 0, failed: 0, pending: 0, total: 0 },
          failed: { count: 0, sent: 0, failed: 0, pending: 0, total: 0 },
        }

        campaignList.forEach((c: { id: string; status: string }) => {
          const status = c.status || 'draft'
          if (statusStats[status]) {
            statusStats[status].count++
            const recipients = campaignRecipients[c.id] || { sent: 0, failed: 0, pending: 0, total: 0 }
            statusStats[status].sent += recipients.sent
            statusStats[status].failed += recipients.failed
            statusStats[status].pending += recipients.pending
            statusStats[status].total += recipients.total
          }
        })

        // Calculate totals
        const totalSent = Object.values(statusStats).reduce((sum, s) => sum + s.sent, 0)
        const totalFailed = Object.values(statusStats).reduce((sum, s) => sum + s.failed, 0)
        const totalRecipients = Object.values(statusStats).reduce((sum, s) => sum + s.total, 0)

        return NextResponse.json({
          data: {
            total_campaigns: campaignList.length,
            completed_campaigns: statusStats.completed.count,
            running_campaigns: statusStats.running.count,
            draft_campaigns: statusStats.draft.count,
            failed_campaigns: statusStats.failed.count,
            // Detailed stats per status
            status_details: {
              completed: statusStats.completed,
              running: statusStats.running,
              draft: statusStats.draft,
              failed: statusStats.failed,
            },
            // Totals
            total_sent: totalSent,
            total_failed: totalFailed,
            total_recipients: totalRecipients,
          },
        })
      }

      case 'email_stats': {
        let query = client.from('email_campaign_recipients').select('status')
        if (orgId) {
          query = query.eq('organization_id', orgId)
        }

        const { data, error } = await query

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const recipients = data || []
        const total = recipients.length
        const sent = recipients.filter((r: { status: string }) => r.status === 'sent').length
        const pending = recipients.filter((r: { status: string }) => r.status === 'pending').length
        const failed = recipients.filter((r: { status: string }) => r.status === 'failed').length

        return NextResponse.json({
          data: {
            total_emails: total,
            sent_emails: sent,
            pending_emails: pending,
            failed_emails: failed,
            delivery_rate: total > 0 ? Math.round((sent / total) * 100 * 100) / 100 : 0,
            failure_rate: total > 0 ? Math.round((failed / total) * 100 * 100) / 100 : 0,
          },
        })
      }

      case 'daily_activity': {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        let query = client
          .from('email_campaign_recipients')
          .select('sent_at, status')
          .gte('sent_at', startDate.toISOString())
          .not('sent_at', 'is', null)

        if (orgId) {
          query = query.eq('organization_id', orgId)
        }

        const { data, error } = await query

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Group by date
        const dailyStats: Record<string, { sent: number; failed: number }> = {}
        ;(data || []).forEach((item: { sent_at: string; status: string }) => {
          const date = item.sent_at.split('T')[0]
          if (!dailyStats[date]) {
            dailyStats[date] = { sent: 0, failed: 0 }
          }
          if (item.status === 'sent') {
            dailyStats[date].sent++
          } else if (item.status === 'failed') {
            dailyStats[date].failed++
          }
        })

        // Convert to array and sort
        const activityData = Object.entries(dailyStats)
          .map(([date, stats]) => ({
            activity_date: date,
            emails_sent: stats.sent,
            emails_failed: stats.failed,
          }))
          .sort((a, b) => b.activity_date.localeCompare(a.activity_date))

        return NextResponse.json({ data: activityData })
      }

      case 'leads_growth': {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        let query = client
          .from('leads')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (orgId) {
          query = query.eq('organization_id', orgId)
        }

        const { data, error } = await query

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Group by date
        const dailyCounts: Record<string, number> = {}
        ;(data || []).forEach((item: { created_at: string }) => {
          const date = item.created_at.split('T')[0]
          dailyCounts[date] = (dailyCounts[date] || 0) + 1
        })

        // Convert to array with cumulative total
        let cumulative = 0
        const growthData = Object.entries(dailyCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => {
            cumulative += count
            return {
              created_date: date,
              leads_count: count,
              cumulative_total: cumulative,
            }
          })
          .reverse()

        return NextResponse.json({ data: growthData })
      }

      case 'recent_campaigns': {
        const limit = parseInt(searchParams.get('limit') || '5')

        let query = client
          .from('email_campaigns')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (orgId) {
          query = query.eq('organization_id', orgId)
        }

        const { data: campaigns, error } = await query

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get recipient counts for each campaign
        const campaignIds = (campaigns || []).map((c: { id: string }) => c.id)

        if (campaignIds.length === 0) {
          return NextResponse.json({ data: [] })
        }

        const { data: recipients } = await client
          .from('email_campaign_recipients')
          .select('campaign_id, status')
          .in('campaign_id', campaignIds)

        // Calculate counts per campaign
        const recipientCounts: Record<string, { total: number; sent: number; failed: number; pending: number }> = {}
        ;(recipients || []).forEach((r: { campaign_id: string; status: string }) => {
          if (!recipientCounts[r.campaign_id]) {
            recipientCounts[r.campaign_id] = { total: 0, sent: 0, failed: 0, pending: 0 }
          }
          recipientCounts[r.campaign_id].total++
          if (r.status === 'sent') recipientCounts[r.campaign_id].sent++
          else if (r.status === 'failed') recipientCounts[r.campaign_id].failed++
          else if (r.status === 'pending') recipientCounts[r.campaign_id].pending++
        })

        const campaignData = (campaigns || []).map((c: { id: string; name: string; status: string; created_at: string }) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          created_at: c.created_at,
          total_recipients: recipientCounts[c.id]?.total || 0,
          sent_count: recipientCounts[c.id]?.sent || 0,
          failed_count: recipientCounts[c.id]?.failed || 0,
          pending_count: recipientCounts[c.id]?.pending || 0,
        }))

        return NextResponse.json({ data: campaignData })
      }

      case 'top_campaigns': {
        const limit = parseInt(searchParams.get('limit') || '5')

        let query = client
          .from('email_campaigns')
          .select('id, name, status')
          .eq('status', 'completed')

        if (orgId) {
          query = query.eq('organization_id', orgId)
        }

        const { data: campaigns, error } = await query

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get recipient counts for each campaign
        const campaignIds = (campaigns || []).map((c: { id: string }) => c.id)

        if (campaignIds.length === 0) {
          return NextResponse.json({ data: [] })
        }

        const { data: recipients } = await client
          .from('email_campaign_recipients')
          .select('campaign_id, status')
          .in('campaign_id', campaignIds)

        // Calculate counts and delivery rate
        const recipientCounts: Record<string, { total: number; sent: number }> = {}
        ;(recipients || []).forEach((r: { campaign_id: string; status: string }) => {
          if (!recipientCounts[r.campaign_id]) {
            recipientCounts[r.campaign_id] = { total: 0, sent: 0 }
          }
          recipientCounts[r.campaign_id].total++
          if (r.status === 'sent') recipientCounts[r.campaign_id].sent++
        })

        const campaignData = (campaigns || [])
          .map((c: { id: string; name: string; status: string }) => {
            const counts = recipientCounts[c.id] || { total: 0, sent: 0 }
            return {
              id: c.id,
              name: c.name,
              status: c.status,
              total_recipients: counts.total,
              sent_count: counts.sent,
              delivery_rate: counts.total > 0 ? Math.round((counts.sent / counts.total) * 100 * 100) / 100 : 0,
            }
          })
          .sort((a: { delivery_rate: number; sent_count: number }, b: { delivery_rate: number; sent_count: number }) =>
            b.delivery_rate - a.delivery_rate || b.sent_count - a.sent_count)
          .slice(0, limit)

        return NextResponse.json({ data: campaignData })
      }

      case 'weekly_comparison': {
        const thisWeekStart = getWeekStart()
        const lastWeekStart = new Date(thisWeekStart)
        lastWeekStart.setDate(lastWeekStart.getDate() - 7)

        // Build queries with org filter
        let twEmailsQuery = client.from('email_campaign_recipients').select('id', { count: 'exact', head: true }).gte('sent_at', thisWeekStart.toISOString())
        let twCampaignsQuery = client.from('email_campaigns').select('id', { count: 'exact', head: true }).gte('created_at', thisWeekStart.toISOString())
        let twLeadsQuery = client.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', thisWeekStart.toISOString())
        let lwEmailsQuery = client.from('email_campaign_recipients').select('id', { count: 'exact', head: true }).gte('sent_at', lastWeekStart.toISOString()).lt('sent_at', thisWeekStart.toISOString())
        let lwCampaignsQuery = client.from('email_campaigns').select('id', { count: 'exact', head: true }).gte('created_at', lastWeekStart.toISOString()).lt('created_at', thisWeekStart.toISOString())
        let lwLeadsQuery = client.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', lastWeekStart.toISOString()).lt('created_at', thisWeekStart.toISOString())

        if (orgId) {
          twEmailsQuery = twEmailsQuery.eq('organization_id', orgId)
          twCampaignsQuery = twCampaignsQuery.eq('organization_id', orgId)
          twLeadsQuery = twLeadsQuery.eq('organization_id', orgId)
          lwEmailsQuery = lwEmailsQuery.eq('organization_id', orgId)
          lwCampaignsQuery = lwCampaignsQuery.eq('organization_id', orgId)
          lwLeadsQuery = lwLeadsQuery.eq('organization_id', orgId)
        }

        const [twEmails, twCampaigns, twLeads, lwEmails, lwCampaigns, lwLeads] = await Promise.all([
          twEmailsQuery,
          twCampaignsQuery,
          twLeadsQuery,
          lwEmailsQuery,
          lwCampaignsQuery,
          lwLeadsQuery,
        ])

        const twEmailCount = twEmails.count || 0
        const lwEmailCount = lwEmails.count || 0
        const twCampaignCount = twCampaigns.count || 0
        const lwCampaignCount = lwCampaigns.count || 0
        const twLeadCount = twLeads.count || 0
        const lwLeadCount = lwLeads.count || 0

        return NextResponse.json({
          data: {
            this_week_emails: twEmailCount,
            last_week_emails: lwEmailCount,
            this_week_campaigns: twCampaignCount,
            last_week_campaigns: lwCampaignCount,
            this_week_leads: twLeadCount,
            last_week_leads: lwLeadCount,
            email_change_percent: lwEmailCount > 0 ? Math.round(((twEmailCount - lwEmailCount) / lwEmailCount) * 100 * 100) / 100 : 0,
            campaign_change_percent: lwCampaignCount > 0 ? Math.round(((twCampaignCount - lwCampaignCount) / lwCampaignCount) * 100 * 100) / 100 : 0,
            lead_change_percent: lwLeadCount > 0 ? Math.round(((twLeadCount - lwLeadCount) / lwLeadCount) * 100 * 100) / 100 : 0,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMonthStart(): string {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function getWeekStart(): Date {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}
