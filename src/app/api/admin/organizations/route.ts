import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireSuperAdmin } from '@/lib/auth/rbac'

// GET - List all organizations (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('organizations')
      .select(`
        *,
        users:user_profiles(count)
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user counts for each organization
    const orgsWithCounts = await Promise.all(
      (data || []).map(async (org) => {
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)

        return {
          ...org,
          user_count: count || 0,
        }
      })
    )

    return NextResponse.json({ data: orgsWithCounts })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Organizations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new organization (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      slug,
      description,
      logo_url,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_secure,
      smtp_from_name,
      smtp_from_email,
      is_active,
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        description: description || null,
        logo_url: logo_url || null,
        smtp_host: smtp_host || null,
        smtp_port: smtp_port || 587,
        smtp_user: smtp_user || null,
        smtp_pass: smtp_pass || null,
        smtp_secure: smtp_secure || false,
        smtp_from_name: smtp_from_name || null,
        smtp_from_email: smtp_from_email || null,
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Organizations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
