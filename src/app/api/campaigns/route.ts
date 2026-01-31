import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'
import { generateCampaignName } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('template_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let query = client
      .from('email_campaigns')
      .select(`
        *,
        template:email_templates(id, name, subject),
        recipients:email_campaign_recipients(id, status, to_name, to_email, sent_at, lead_id)
      `)
      .order('created_at', { ascending: false })

    // Filter by organization
    const isSuperAdminWithoutOrg = profile?.role === 'super_admin' && !profile.organization_id
    if (!isSuperAdminWithoutOrg && profile?.organization_id) {
      query = query.eq('organization_id', profile.organization_id)
    }

    // Filter by template_id
    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ data: [] })
    }

    // Add recipient counts
    const campaignsWithCounts = (data as Array<{
      id: string
      user_id: string
      template_id: string
      name: string
      status: string
      created_at: string
      updated_at: string
      organization_id: string | null
      template: { id: string; name: string; subject: string } | null
      recipients: { id: string; status: string }[] | null
    }>).map((campaign) => ({
      ...campaign,
      recipientCounts: {
        total: campaign.recipients?.length || 0,
        pending: campaign.recipients?.filter((r) => r.status === 'pending').length || 0,
        sent: campaign.recipients?.filter((r) => r.status === 'sent').length || 0,
        failed: campaign.recipients?.filter((r) => r.status === 'failed').length || 0,
      },
    }))

    return NextResponse.json({ data: campaignsWithCounts })
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, leadIds, groupIds } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 })
    }

    // Get template
    const { data: template, error: templateError } = await client
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Collect all leads
    let allLeads: { id: string; name: string; email: string }[] = []

    // Get leads from leadIds
    if (leadIds?.length > 0) {
      const { data: leads } = await client
        .from('leads')
        .select('id, name, email')
        .in('id', leadIds)

      if (leads) {
        allLeads = [...allLeads, ...leads]
      }
    }

    // Get leads from groups
    if (groupIds?.length > 0) {
      const { data: groupMembers } = await client
        .from('contact_group_members')
        .select('lead_id')
        .in('group_id', groupIds)

      if (groupMembers && groupMembers.length > 0) {
        const leadIdsFromGroups = (groupMembers as { lead_id: string }[]).map((m) => m.lead_id)
        const { data: groupLeadsData } = await client
          .from('leads')
          .select('id, name, email')
          .in('id', leadIdsFromGroups)

        if (groupLeadsData) {
          allLeads = [...allLeads, ...(groupLeadsData as { id: string; name: string; email: string }[])]
        }
      }
    }

    // Dedupe by email
    const uniqueLeads = Array.from(
      new Map(allLeads.map((l) => [l.email.toLowerCase(), l])).values()
    )

    if (uniqueLeads.length === 0) {
      return NextResponse.json({ error: 'No recipients selected' }, { status: 400 })
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await client
      .from('email_campaigns')
      .insert({
        user_id: user.id,
        template_id: templateId,
        name: generateCampaignName(template.name),
        status: 'running',
        organization_id: profile?.organization_id || null,
      })
      .select()
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: campaignError?.message || 'Failed to create campaign' }, { status: 500 })
    }

    // Create recipients
    const recipients = uniqueLeads.map((lead) => ({
      campaign_id: campaign.id,
      user_id: user.id,
      lead_id: lead.id,
      to_email: lead.email.toLowerCase(),
      to_name: lead.name,
      status: 'pending',
      organization_id: profile?.organization_id || null,
    }))

    const { error: recipientsError } = await client
      .from('email_campaign_recipients')
      .insert(recipients)

    if (recipientsError) {
      // Rollback campaign
      await client.from('email_campaigns').delete().eq('id', campaign.id)
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: campaign }, { status: 201 })
  } catch (error) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
