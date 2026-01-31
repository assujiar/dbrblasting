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

// GET - Get a single organization (Super Admin only)
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
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get users in this organization
    const { data: users } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('organization_id', id)
      .order('created_at', { ascending: false })

    // Get stats
    const { count: leadsCount } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    const { count: templatesCount } = await adminClient
      .from('email_templates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    const { count: campaignsCount } = await adminClient
      .from('email_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    return NextResponse.json({
      data: {
        ...data,
        users: users || [],
        stats: {
          users: users?.length || 0,
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
    console.error('Organization GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an organization (Super Admin only)
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
      subscription_tier,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if slug is unique (excluding current org)
    if (slug) {
      const { data: existing } = await adminClient
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Organization slug already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {
      name,
      updated_at: new Date().toISOString(),
    }

    // Only update fields that are provided
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (logo_url !== undefined) updateData.logo_url = logo_url
    if (smtp_host !== undefined) updateData.smtp_host = smtp_host
    if (smtp_port !== undefined) updateData.smtp_port = smtp_port
    if (smtp_user !== undefined) updateData.smtp_user = smtp_user
    if (smtp_pass !== undefined) updateData.smtp_pass = smtp_pass
    if (smtp_secure !== undefined) updateData.smtp_secure = smtp_secure
    if (smtp_from_name !== undefined) updateData.smtp_from_name = smtp_from_name
    if (smtp_from_email !== undefined) updateData.smtp_from_email = smtp_from_email
    if (is_active !== undefined) updateData.is_active = is_active
    if (subscription_tier !== undefined) {
      // Validate tier value
      if (!['free', 'basic', 'regular', 'pro'].includes(subscription_tier)) {
        return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
      }
      updateData.subscription_tier = subscription_tier
    }

    const { data, error } = await adminClient
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Organization PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an organization (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params
    const adminClient = getAdminClient()

    // Check if organization has users
    const { count: userCount } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    if (userCount && userCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete organization with active users. Remove users first.' },
        { status: 400 }
      )
    }

    const { error } = await adminClient
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('Organization DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
