import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for storage (bypasses RLS to avoid infinite recursion)
    const adminClient = createAdminClient()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

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
        error: 'File too large. Maximum size is 5MB'
      }, { status: 400 })
    }

    // Generate unique filename with user folder
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${user.id}/${timestamp}-${randomStr}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await adminClient.storage
      .from('email-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('email-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
