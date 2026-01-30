import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getAuthContext, requireSuperAdmin } from '@/lib/auth/rbac'

// Helper to create admin client that bypasses RLS
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// GET - List all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    // Use admin client to bypass RLS
    const adminClient = getAdminClient()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const organizationId = searchParams.get('organization_id')
    const role = searchParams.get('role')

    let query = adminClient
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const body = await request.json()
    const {
      email,
      password,
      full_name,
      phone,
      position,
      company,
      role,
      organization_id,
    } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['super_admin', 'org_admin', 'user']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be super_admin, org_admin, or user' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()

    // Check if email already exists
    const { data: existingUsers } = await adminClient
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
      },
    })

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name,
        phone: phone || '',
        position: position || '',
        company: company || '',
        role: role || 'user',
        organization_id: organization_id || null,
      })
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .single()

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: profileError.message || 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: profile }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
