import { NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

// GET - Get user's AI email generation history (last 7 days, not saved)
export async function GET() {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!profile?.organization_id) {
      return NextResponse.json({ data: [] })
    }

    // Get generations from last 7 days that haven't been saved
    const { data: generations, error } = await client
      .from('ai_email_generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', profile.organization_id)
      .in('status', ['generated', 'generating'])
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch generation history:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    return NextResponse.json({ data: generations || [] })
  } catch (error) {
    console.error('AI email history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
