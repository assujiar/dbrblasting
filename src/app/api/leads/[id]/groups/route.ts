import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { client, user } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all groups this lead belongs to
    const { data: memberships, error: memberError } = await client
      .from('contact_group_members')
      .select('group_id')
      .eq('lead_id', id)
      .eq('user_id', user.id)

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const groupIds = memberships.map(m => m.group_id)

    const { data: groups, error: groupsError } = await client
      .from('contact_groups')
      .select('*')
      .in('id', groupIds)
      .order('name')

    if (groupsError) {
      return NextResponse.json({ error: groupsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: groups })
  } catch (error) {
    console.error('Lead groups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
