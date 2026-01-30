import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'
import { isValidEmail } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    let query = client
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // For super_admin with org, filter by org; otherwise admin client shows all
    if (profile?.role === 'super_admin' && profile.organization_id) {
      query = query.eq('organization_id', profile.organization_id)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Leads GET error:', error)
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
    const { name, email, company, phone } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const { data, error } = await client
      .from('leads')
      .insert({
        user_id: user.id,
        organization_id: profile?.organization_id || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || '',
        phone: phone?.trim() || '',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A lead with this email already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Leads POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
