import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireSuperAdmin } from '@/lib/auth/rbac'

// GET - List all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const organizationId = searchParams.get('organization_id')
    const role = searchParams.get('role')

    let query = supabase
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
