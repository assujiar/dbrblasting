import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/utils'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, fullName, email, organizationName } = body

    if (!userId || !fullName || !email || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()

    // Generate a unique slug for the organization
    const baseSlug = generateSlug(organizationName)
    let slug = baseSlug
    let counter = 1

    // Check for existing slug and make it unique
    while (true) {
      const { data: existing } = await adminClient
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 1. Create the organization with free tier
    const { data: organization, error: orgError } = await adminClient
      .from('organizations')
      .insert({
        name: organizationName,
        slug,
        description: `Organization created for ${fullName}`,
        subscription_tier: 'free',
        is_active: true,
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    // 2. Create the user profile with org_admin role
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        organization_id: organization.id,
        role: 'org_admin', // Make them admin of their own organization
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Rollback organization creation
      await adminClient.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        message: 'Account created successfully',
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
