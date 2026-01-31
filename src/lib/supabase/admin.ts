import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from './server'

/**
 * Create admin Supabase client that bypasses RLS
 * Use this for server-side operations that need to access all data
 */
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

/**
 * Get admin client with user context
 * Always uses admin client to bypass RLS (avoid infinite recursion)
 * API routes must implement their own organization-based filtering
 */
export async function getClientForUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { client: supabase, user: null, profile: null, isSuperAdmin: false }
  }

  const adminClient = getAdminClient()

  // Get user profile using admin client (bypass RLS)
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  // Always return admin client to bypass RLS and avoid infinite recursion
  // API routes must filter by organization_id for non-super_admin users
  return {
    client: adminClient,
    user,
    profile,
    isSuperAdmin,
  }
}
