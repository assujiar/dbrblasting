import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCampaignName } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('template_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let query = supabase
      .from('email_campaigns')
      .select(`
        *,
        template:email_templates(id, name, subject),
        recipients:email_campaign_recipients(id, status, to_name, to_email, sent_at, lead_id)
      `)
      .order('created_at', { ascending: false })

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
      template_id: string | null
      name: string
      status: string
      created_at: string
      updated_at: string
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, leadIds, groupIds } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 })
    }

    // Get template
    const { data: template, error: templateError } = await supabase
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
      const { data: leads } = await supabase
        .from('leads')
        .select('id, name, email')
        .in('id', leadIds)

      if (leads) {
        allLeads = [...allLeads, ...leads]
      }
    }

    // Get leads from groups
    if (groupIds?.length > 0) {
      const { data: groupMembers } = await supabase
        .from('contact_group_members')
        .select('lead_id')
        .in('group_id', groupIds)

      if (groupMembers && groupMembers.length > 0) {
        const leadIdsFromGroups = (groupMembers as { lead_id: string }[]).map((m) => m.lead_id)
        const { data: groupLeadsData } = await supabase
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
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        user_id: user.id,
        template_id: templateId,
        name: generateCampaignName(template.name),
        status: 'running',
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
    }))

    const { error: recipientsError } = await supabase
      .from('email_campaign_recipients')
      .insert(recipients)

    if (recipientsError) {
      // Rollback campaign
      await supabase.from('email_campaigns').delete().eq('id', campaign.id)
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: campaign }, { status: 201 })
  } catch (error) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
