import { NextRequest, NextResponse } from 'next/server'
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

// GET - Get a single user (Super Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's activity stats
    const userId = data.user_id

    const { count: leadsCount } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: templatesCount } = await adminClient
      .from('email_templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: campaignsCount } = await adminClient
      .from('email_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      data: {
        ...data,
        stats: {
          leads: leadsCount || 0,
          templates: templatesCount || 0,
          campaigns: campaignsCount || 0,
        },
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('User GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a user's role and organization (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params
    const adminClient = getAdminClient()
    const body = await request.json()

    const {
      full_name,
      email,
      phone,
      position,
      company,
      role,
      organization_id,
    } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Update fields if provided
    if (full_name !== undefined) updateData.full_name = full_name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (position !== undefined) updateData.position = position
    if (company !== undefined) updateData.company = company
    if (role !== undefined) updateData.role = role
    if (organization_id !== undefined) updateData.organization_id = organization_id

    const { data, error } = await adminClient
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('User PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a user's profile and auth user (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params
    const adminClient = getAdminClient()

    // Get user profile to check role and get user_id
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role, user_id')
      .eq('id', id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow deleting super admin
    if (profile.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin user' },
        { status: 400 }
      )
    }

    // Delete user profile first
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Also delete auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(profile.user_id)

    if (authError) {
      console.error('Failed to delete auth user:', authError)
      // Profile already deleted, log the error but return success
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('User DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
