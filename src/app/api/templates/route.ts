import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = client
      .from('email_templates')
      .select('*')
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
    console.error('Templates GET error:', error)
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
    const { name, subject, html_body } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    if (!html_body?.trim()) {
      return NextResponse.json({ error: 'HTML body is required' }, { status: 400 })
    }

    const { data, error } = await client
      .from('email_templates')
      .insert({
        user_id: user.id,
        name: name.trim(),
        subject: subject.trim(),
        html_body: html_body.trim(),
        organization_id: profile?.organization_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Templates POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
