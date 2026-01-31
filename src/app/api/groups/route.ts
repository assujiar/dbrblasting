import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = client
      .from('contact_groups')
      .select(`
        *,
        members:contact_group_members(
          id,
          lead:leads(id, name, email, company, phone)
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by organization
    const isSuperAdminWithoutOrg = profile?.role === 'super_admin' && !profile.organization_id
    if (!isSuperAdminWithoutOrg && profile?.organization_id) {
      query = query.eq('organization_id', profile.organization_id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Groups GET error:', error)
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
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await client
      .from('contact_groups')
      .insert({
        user_id: user.id,
        organization_id: profile?.organization_id || null,
        name: name.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Groups POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
