import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { renderTemplate } from '@/lib/utils'
import { sendEmail } from '@/lib/email'

/**
 * POST /api/campaign/worker
 * Body: { campaignId: string }
 * Processes up to EMAIL_BATCH_SIZE pending recipients for the given campaign.
 * Returns the number of processed recipients and remaining pending recipients.
 *
 * This route is intended to be called repeatedly by the client to drain the
 * queue. By keeping each invocation short, we avoid Vercel function timeouts
 * (see Vercel docs for runtime limits【679579239636242†L94-L113】).
 */
export async function POST(request: Request) {
  const supabaseServer = createServerSupabaseClient()
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const campaignId: string = body.campaignId
  if (!campaignId) {
    return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
  }
  const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 20)
  // Use service role key to bypass RLS when updating rows in batch
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Fetch pending recipients for this campaign belonging to the current user
  const { data: recipients } = await supabaseAdmin
    .from('email_campaign_recipients')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .eq('user_id', user.id)
    .limit(batchSize)
  if (!recipients || recipients.length === 0) {
    // Mark campaign completed if no recipients remain
    await supabaseAdmin
      .from('email_campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId)
    return NextResponse.json({ processed: 0, remaining: 0 })
  }
  // Fetch template and leads snapshot for recipients
  const { data: campaign } = await supabaseAdmin
    .from('email_campaigns')
    .select('template_id')
    .eq('id', campaignId)
    .single()
  const templateId = campaign?.template_id
  if (!templateId) {
    return NextResponse.json({ error: 'Campaign has no template' }, { status: 400 })
  }
  const { data: template } = await supabaseAdmin
    .from('email_templates')
    .select('subject, html_body')
    .eq('id', templateId)
    .single()
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }
  let processed = 0
  for (const recipient of recipients) {
    processed++
    try {
      // Fetch lead info for personalization if lead_id is present
      let lead: any = { name: recipient.to_name, email: recipient.to_email }
      if (recipient.lead_id) {
        const { data: l } = await supabaseAdmin
          .from('leads')
          .select('name, email, company, phone')
          .eq('id', recipient.lead_id)
          .single()
        if (l) lead = l
      }
      const html = renderTemplate(template.html_body, lead)
      await sendEmail(recipient.to_email, template.subject, html)
      await supabaseAdmin
        .from('email_campaign_recipients')
        .update({ status: 'sent', error: null, sent_at: new Date().toISOString() })
        .eq('id', recipient.id)
    } catch (err: any) {
      await supabaseAdmin
        .from('email_campaign_recipients')
        .update({ status: 'failed', error: err.message })
        .eq('id', recipient.id)
    }
  }
  // Count remaining pending
  const { count: remaining } = await supabaseAdmin
    .from('email_campaign_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .eq('user_id', user.id)
  if (remaining === 0) {
    await supabaseAdmin
      .from('email_campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId)
  }
  return NextResponse.json({ processed, remaining: remaining ?? 0 })
}