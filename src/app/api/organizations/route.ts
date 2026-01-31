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

// GET - List organizations for filter dropdown
// Super Admin: all organizations
// Other roles: not accessible
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext()

    // Only super admin can list all organizations
    if (!context || !context.isSuperAdmin) {
      return NextResponse.json({ data: [] })
    }

    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('organizations')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Organizations GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Organizations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
