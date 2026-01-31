import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile to check role and organization
    const adminClient = getAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Only org_admin and super_admin can upload logos
    if (!['org_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const organizationId = formData.get('organization_id') as string | null

    // Determine which organization to update
    let targetOrgId = organizationId || profile.organization_id

    // Non-super admins can only update their own organization
    if (profile.role !== 'super_admin' && targetOrgId !== profile.organization_id) {
      return NextResponse.json({ error: 'Can only update own organization logo' }, { status: 403 })
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 2MB'
      }, { status: 400 })
    }

    // Generate unique filename with organization folder
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${targetOrgId}/${timestamp}-${randomStr}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Delete old logo if exists
    const { data: org } = await adminClient
      .from('organizations')
      .select('logo_url')
      .eq('id', targetOrgId)
      .single()

    if (org?.logo_url) {
      // Extract path from URL
      const oldPath = org.logo_url.split('/organization-logos/')[1]
      if (oldPath) {
        await adminClient.storage.from('organization-logos').remove([oldPath])
      }
    }

    // Upload to Supabase Storage using admin client
    const { data, error } = await adminClient.storage
      .from('organization-logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('organization-logos')
      .getPublicUrl(data.path)

    // Update organization with new logo URL
    const { error: updateError } = await adminClient
      .from('organizations')
      .update({ logo_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', targetOrgId)

    if (updateError) {
      console.error('Update organization error:', updateError)
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        type: file.type,
      }
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['org_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id') || profile.organization_id

    if (profile.role !== 'super_admin' && organizationId !== profile.organization_id) {
      return NextResponse.json({ error: 'Can only delete own organization logo' }, { status: 403 })
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get current logo URL
    const { data: org } = await adminClient
      .from('organizations')
      .select('logo_url')
      .eq('id', organizationId)
      .single()

    if (org?.logo_url) {
      const oldPath = org.logo_url.split('/organization-logos/')[1]
      if (oldPath) {
        await adminClient.storage.from('organization-logos').remove([oldPath])
      }
    }

    // Clear logo URL in database
    await adminClient
      .from('organizations')
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq('id', organizationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
