import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/sender'

const BATCH_SIZE = 20
const CONCURRENCY = 3

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get campaign with template
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        template:email_templates(id, subject, html_body)
      `)
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get user profile for email signature
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const senderData = userProfile ? {
      name: userProfile.full_name || '',
      email: userProfile.email || user.email || '',
      phone: userProfile.phone || '',
      position: userProfile.position || '',
      company: userProfile.company || '',
    } : undefined

    // Get pending recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('email_campaign_recipients')
      .select(`
        *,
        lead:leads(name, company, email, phone)
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .limit(BATCH_SIZE)

    if (recipientsError) {
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    if (!recipients || recipients.length === 0) {
      // No more pending recipients, update campaign status
      await supabase
        .from('email_campaigns')
        .update({ status: 'completed' })
        .eq('id', campaignId)

      return NextResponse.json({ 
        message: 'No pending recipients',
        processed: 0,
        remaining: 0,
      })
    }

    // Process in batches with concurrency
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const recipientData = {
          name: recipient.lead?.name || recipient.to_name || '',
          company: recipient.lead?.company || '',
          email: recipient.to_email,
          phone: recipient.lead?.phone || '',
        }

        const result = await sendEmail({
          to: recipient.to_email,
          toName: recipient.to_name,
          subject: campaign.template.subject,
          htmlBody: campaign.template.html_body,
          recipientData,
          senderData,
        })

        // Update recipient status
        await supabase
          .from('email_campaign_recipients')
          .update({
            status: result.success ? 'sent' : 'failed',
            error: result.error || null,
            sent_at: result.success ? new Date().toISOString() : null,
          })
          .eq('id', recipient.id)

        return { recipientId: recipient.id, ...result }
      })
    )

    // Count results
    const sent = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length
    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length

    // Check if there are more pending
    const { count: remainingCount } = await supabase
      .from('email_campaign_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')

    // Update campaign status if done
    if (!remainingCount || remainingCount === 0) {
      const { count: failedCount } = await supabase
        .from('email_campaign_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'failed')

      const { count: sentCount } = await supabase
        .from('email_campaign_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'sent')

      let finalStatus = 'completed'
      if (failedCount && failedCount > 0 && (!sentCount || sentCount === 0)) {
        finalStatus = 'failed'
      }

      await supabase
        .from('email_campaigns')
        .update({ status: finalStatus })
        .eq('id', campaignId)
    }

    return NextResponse.json({
      processed: recipients.length,
      sent,
      failed,
      remaining: remainingCount || 0,
    })
  } catch (error) {
    console.error('Worker error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
