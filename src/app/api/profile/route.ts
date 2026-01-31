import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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

// GET - Get current user's profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS (avoids infinite recursion)
    const adminClient = getAdminClient()

    // Try to get existing profile with organization
    const { data: profile, error } = await adminClient
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(id, name, slug, logo_url, is_active)
      `)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay for new users
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no profile exists, return a default one based on auth data
    if (!profile) {
      return NextResponse.json({
        data: {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          position: '',
          company: '',
          role: 'user',
          organization: null,
        }
      })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update or create user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      email,
      phone,
      position,
      company,
    } = body

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result

    const profileData = {
      full_name,
      email,
      phone: phone || '',
      position: position || '',
      company: company || '',
    }

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select(`
          *,
          organization:organizations(id, name, slug, logo_url, is_active)
        `)
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
        })
        .select(`
          *,
          organization:organizations(id, name, slug, logo_url, is_active)
        `)
        .single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
