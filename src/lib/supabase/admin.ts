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
 * Get the appropriate Supabase client based on user role
 * - Super admin: returns admin client (bypasses RLS)
 * - Others: returns regular client (respects RLS)
 */
export async function getClientForUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { client: supabase, user: null, profile: null, isSuperAdmin: false }
  }

  const adminClient = getAdminClient()

  // Check user role using admin client (bypass RLS)
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  // Return admin client for super_admin, regular client for others
  return {
    client: isSuperAdmin ? adminClient : supabase,
    user,
    profile,
    isSuperAdmin,
  }
}
