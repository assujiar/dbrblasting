import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServerComponentClient } from '@supabase/ssr'

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const templateId: string = body.templateId
  const leadIds: string[] = body.leadIds || []
  if (!templateId || !Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: 'Missing templateId or leadIds' }, { status: 400 })
  }
  // Fetch template to generate campaign name
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('subject')
    .eq('id', templateId)
    .single()
  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }
  const campaignName = `${template.subject.substring(0, 50)} – ${new Date().toISOString()}`
  // Create campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .insert({ user_id: user.id, template_id: templateId, name: campaignName, status: 'running' })
    .select('*')
    .single()
  if (campaignError || !campaign) {
    return NextResponse.json({ error: campaignError?.message ?? 'Failed to create campaign' }, { status: 500 })
  }
  // Fetch leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id,name,email')
    .in('id', leadIds)
  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500 })
  }
  // Prepare recipients
  const recipients = leads
    .filter((l) => l.email)
    .map((l) => ({
      campaign_id: campaign.id,
      user_id: user.id,
      lead_id: l.id,
      to_email: l.email,
      to_name: l.name,
      status: 'pending',
    }))
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No valid recipients' }, { status: 400 })
  }
  const { error: recipError } = await supabase.from('email_campaign_recipients').insert(recipients)
  if (recipError) {
    return NextResponse.json({ error: recipError.message }, { status: 500 })
  }
  return NextResponse.json({ campaignId: campaign.id })
}