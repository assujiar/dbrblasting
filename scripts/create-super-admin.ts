/**
 * Script to create a super admin user
 *
 * Usage:
 *   npx tsx scripts/create-super-admin.ts admin@example.com
 *
 * Prerequisites:
 * - User must already be registered through normal auth flow
 * - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing environment variables')
  console.error('Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/create-super-admin.ts <email>')
  console.error('Example: npx tsx scripts/create-super-admin.ts admin@example.com')
  process.exit(1)
}

async function createSuperAdmin() {
  // Use service role key for admin operations
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`\nLooking for user with email: ${email}`)

  // Find the user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    console.error('\nError: User not found')
    console.error('Make sure the user has:')
    console.error('  1. Registered through the normal auth flow')
    console.error('  2. Completed their profile setup')
    console.error('\nTry registering first at: /login')
    process.exit(1)
  }

  if (profile.role === 'super_admin') {
    console.log('\nUser is already a super admin!')
    console.log(`  Name: ${profile.full_name}`)
    console.log(`  Email: ${profile.email}`)
    console.log(`  Role: ${profile.role}`)
    process.exit(0)
  }

  // Update to super admin
  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update({ role: 'super_admin' })
    .eq('id', profile.id)
    .select()
    .single()

  if (updateError) {
    console.error('\nError updating user role:', updateError.message)
    process.exit(1)
  }

  console.log('\n✓ Super admin created successfully!')
  console.log(`  Name: ${updated.full_name}`)
  console.log(`  Email: ${updated.email}`)
  console.log(`  Role: ${updated.role}`)
  console.log('\nThe user can now access the admin panel at /admin')
}

createSuperAdmin().catch(console.error)
