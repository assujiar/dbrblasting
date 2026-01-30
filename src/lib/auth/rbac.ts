import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { UserRole, UserProfile, Organization } from '@/types/database'

// Create admin client that bypasses RLS
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

export interface AuthContext {
  user: {
    id: string
    email: string
  }
  profile: UserProfile | null
  organization: Organization | null
  isSuperAdmin: boolean
  isOrgAdmin: boolean
  isUser: boolean
}

/**
 * Get the current user's authentication context including their role and organization
 * Uses admin client to bypass RLS and avoid infinite recursion
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Use admin client to bypass RLS (avoids infinite recursion)
  const adminClient = getAdminClient()

  // Get user profile with organization
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get organization if user has one
  let organization: Organization | null = null
  if (profile?.organization_id) {
    const { data: org } = await adminClient
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()
    organization = org
  }

  const role = profile?.role || 'user'

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    profile,
    organization,
    isSuperAdmin: role === 'super_admin',
    isOrgAdmin: role === 'org_admin',
    isUser: role === 'user',
  }
}

/**
 * Check if user has one of the required roles
 */
export function hasRole(context: AuthContext, roles: UserRole[]): boolean {
  if (!context.profile) return false
  return roles.includes(context.profile.role)
}

/**
 * Check if user can access a specific organization's data
 */
export function canAccessOrganization(context: AuthContext, organizationId: string | null): boolean {
  // Super admin can access all organizations
  if (context.isSuperAdmin) return true

  // If no organization filter, allow
  if (!organizationId) return true

  // User can only access their own organization's data
  return context.profile?.organization_id === organizationId
}

/**
 * Get organization filter for queries based on user's role
 * Super admin: no filter (returns null)
 * Others: filter by their organization
 */
export function getOrganizationFilter(context: AuthContext): string | null {
  if (context.isSuperAdmin) return null
  return context.profile?.organization_id || null
}

/**
 * Require super admin role, throw error if not
 */
export function requireSuperAdmin(context: AuthContext | null): asserts context is AuthContext {
  if (!context || !context.isSuperAdmin) {
    throw new Error('Super admin access required')
  }
}

/**
 * Require at least org admin role
 */
export function requireOrgAdmin(context: AuthContext | null): asserts context is AuthContext {
  if (!context || (!context.isSuperAdmin && !context.isOrgAdmin)) {
    throw new Error('Organization admin access required')
  }
}

/**
 * Require authenticated user
 */
export function requireAuth(context: AuthContext | null): asserts context is AuthContext {
  if (!context) {
    throw new Error('Authentication required')
  }
}
