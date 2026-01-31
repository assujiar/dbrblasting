import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getAuthContext } from '@/lib/auth/rbac'

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

// GET - List users for filter dropdown
// Super Admin: all users
// Org Admin: users in their organization
// User: not accessible
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext()

    // Regular users or unauthenticated can't list users
    if (!context || context.isUser) {
      return NextResponse.json({ data: [] })
    }

    const adminClient = getAdminClient()
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')

    let query = adminClient
      .from('user_profiles')
      .select('id, email, full_name, role, organization_id')
      .order('full_name', { ascending: true })

    // Super admin can see all users, optionally filtered by org
    if (context.isSuperAdmin) {
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }
    }
    // Org admin can only see users in their organization
    else if (context.isOrgAdmin) {
      if (!context.organization?.id) {
        return NextResponse.json({ data: [] })
      }
      query = query.eq('organization_id', context.organization.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Users GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
