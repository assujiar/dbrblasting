import { NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

// Tier limits configuration
// - free: 1 campaign, 5 recipients/day (includes watermark)
// - basic: 3 campaigns, 50 recipients/day
// - regular: 5 campaigns, 100 recipients/day
// - pro: 10 campaigns, 500 recipients/day
export const TIER_LIMITS = {
  free: { maxCampaigns: 1, maxRecipientsPerDay: 5, hasWatermark: true },
  basic: { maxCampaigns: 3, maxRecipientsPerDay: 50, hasWatermark: false },
  regular: { maxCampaigns: 5, maxRecipientsPerDay: 100, hasWatermark: false },
  pro: { maxCampaigns: 10, maxRecipientsPerDay: 500, hasWatermark: false },
} as const

export type SubscriptionTier = keyof typeof TIER_LIMITS

// GET - Get current organization's usage and limits
export async function GET() {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!profile?.organization_id) {
      return NextResponse.json({
        error: 'No organization assigned',
        data: {
          tier: 'free',
          limits: TIER_LIMITS.basic,
          usage: {
            campaigns: 0,
            emailsToday: 0,
          },
          canCreateCampaign: true,
          canSendEmails: true,
          remainingEmails: TIER_LIMITS.basic.maxRecipientsPerDay,
        }
      })
    }

    // Get organization with subscription tier
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('id, name, subscription_tier')
      .eq('id', profile.organization_id)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const tier = (org.subscription_tier || 'free') as SubscriptionTier
    const limits = TIER_LIMITS[tier]

    // Get current campaign count
    const { count: campaignCount } = await client
      .from('email_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)

    // Get today's email usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await client
      .from('organization_daily_usage')
      .select('emails_sent')
      .eq('organization_id', profile.organization_id)
      .eq('usage_date', today)
      .single()

    const emailsToday = usageData?.emails_sent || 0
    const currentCampaigns = campaignCount || 0

    return NextResponse.json({
      data: {
        organizationId: profile.organization_id,
        organizationName: org.name,
        tier,
        limits,
        usage: {
          campaigns: currentCampaigns,
          emailsToday,
        },
        canCreateCampaign: currentCampaigns < limits.maxCampaigns,
        canSendEmails: emailsToday < limits.maxRecipientsPerDay,
        remainingEmails: Math.max(0, limits.maxRecipientsPerDay - emailsToday),
        remainingCampaigns: Math.max(0, limits.maxCampaigns - currentCampaigns),
      }
    })
  } catch (error) {
    console.error('Organization usage GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
