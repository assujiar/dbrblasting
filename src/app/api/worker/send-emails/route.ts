import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail, OrganizationSmtpConfig } from '@/lib/email/sender'
import { TIER_LIMITS, SubscriptionTier } from '@/app/api/organization/usage/route'

const BATCH_SIZE = 20
const CONCURRENCY = 3

// Create admin client that bypasses RLS
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

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

    // Get user profile with organization (use admin client to bypass RLS)
    const adminClient = getAdminClient()
    const { data: userProfile } = await adminClient
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

    // Get SMTP config from user's organization
    let smtpConfig: OrganizationSmtpConfig | undefined = undefined
    let organizationTier: SubscriptionTier = 'free'
    let maxRecipientsPerDay = TIER_LIMITS.free.maxRecipientsPerDay
    let addWatermark = TIER_LIMITS.free.hasWatermark

    if (userProfile?.organization_id) {
      const { data: organization } = await adminClient
        .from('organizations')
        .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from_name, smtp_from_email, smtp_reply_to, subscription_tier')
        .eq('id', userProfile.organization_id)
        .eq('is_active', true)
        .single()

      if (organization) {
        organizationTier = (organization.subscription_tier || 'free') as SubscriptionTier
        maxRecipientsPerDay = TIER_LIMITS[organizationTier].maxRecipientsPerDay
        addWatermark = TIER_LIMITS[organizationTier].hasWatermark

        if (organization.smtp_host) {
          smtpConfig = {
            smtp_host: organization.smtp_host,
            smtp_port: organization.smtp_port,
            smtp_user: organization.smtp_user,
            smtp_pass: organization.smtp_pass,
            smtp_secure: organization.smtp_secure || false,
            smtp_from_name: organization.smtp_from_name,
            smtp_from_email: organization.smtp_from_email,
            smtp_reply_to: organization.smtp_reply_to,
          }
        }
      }

      // Check daily email limit
      const today = new Date().toISOString().split('T')[0]
      const { data: usageData } = await adminClient
        .from('organization_daily_usage')
        .select('emails_sent')
        .eq('organization_id', userProfile.organization_id)
        .eq('usage_date', today)
        .single()

      const emailsSentToday = usageData?.emails_sent || 0
      const remainingQuota = maxRecipientsPerDay - emailsSentToday

      if (remainingQuota <= 0) {
        return NextResponse.json({
          error: `Daily email limit reached. Your ${organizationTier} plan allows maximum ${maxRecipientsPerDay} recipients per day.`,
          processed: 0,
          sent: 0,
          remaining: 0,
          quota: {
            used: emailsSentToday,
            max: maxRecipientsPerDay,
            remaining: 0,
          }
        }, { status: 429 })
      }
    }

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
          smtpConfig,
          addWatermark,
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

    // Track daily usage for organization
    if (userProfile?.organization_id && sent > 0) {
      const today = new Date().toISOString().split('T')[0]

      // Get current usage
      const { data: currentUsage } = await adminClient
        .from('organization_daily_usage')
        .select('emails_sent')
        .eq('organization_id', userProfile.organization_id)
        .eq('usage_date', today)
        .single()

      if (currentUsage) {
        // Update existing record
        await adminClient
          .from('organization_daily_usage')
          .update({
            emails_sent: (currentUsage.emails_sent || 0) + sent,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', userProfile.organization_id)
          .eq('usage_date', today)
      } else {
        // Insert new record
        await adminClient
          .from('organization_daily_usage')
          .insert({
            organization_id: userProfile.organization_id,
            usage_date: today,
            emails_sent: sent,
          })
      }
    }

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
