import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all email campaign recipients for this lead
    const { data: recipients, error: recipientError } = await supabase
      .from('email_campaign_recipients')
      .select(`
        id,
        status,
        sent_at,
        created_at,
        campaign_id,
        email_campaigns (
          id,
          name,
          template_id,
          email_templates (
            id,
            name
          )
        )
      `)
      .eq('lead_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (recipientError) {
      return NextResponse.json({ error: recipientError.message }, { status: 500 })
    }

    // Transform data
    const history = (recipients || []).map((r: any) => ({
      id: r.id,
      template_name: r.email_campaigns?.email_templates?.name || r.email_campaigns?.name || 'Unknown',
      sent_at: r.sent_at,
      status: r.status,
      campaign_id: r.campaign_id,
    }))

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('Lead email history GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
