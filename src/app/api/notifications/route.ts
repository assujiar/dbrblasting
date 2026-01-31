import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    // Get user's profile for organization_id
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    // Get user's dismissed notification IDs
    const { data: dismissals } = await adminClient
      .from('notification_dismissals')
      .select('notification_id')
      .eq('user_id', user.id)

    const dismissedIds = dismissals?.map(d => d.notification_id) || []

    // Build query for notifications
    let query = adminClient
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${profile?.organization_id}),and(user_id.is.null,is_global.eq.true)`)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter out expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.now()')

    const { data: notifications, error } = await query

    if (error) {
      console.error('Fetch notifications error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out dismissed notifications and add is_dismissed flag
    const filteredNotifications = notifications
      ?.filter(n => {
        // For personal notifications, check is_dismissed field
        if (n.user_id === user.id) {
          return !n.is_dismissed
        }
        // For org/global notifications, check dismissals table
        return !dismissedIds.includes(n.id)
      })
      .map(n => ({
        ...n,
        is_dismissed: n.user_id === user.id ? n.is_dismissed : dismissedIds.includes(n.id)
      }))

    // Filter unread if requested
    const finalNotifications = unreadOnly
      ? filteredNotifications?.filter(n => !n.is_read)
      : filteredNotifications

    // Count unread
    const unreadCount = filteredNotifications?.filter(n => !n.is_read).length || 0

    return NextResponse.json({
      data: finalNotifications,
      unread_count: unreadCount
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create notification (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      user_id,
      organization_id,
      is_global,
      type = 'info',
      title,
      message,
      action_url,
      action_label,
      expires_at,
      metadata = {}
    } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Org admins can only create notifications for their org
    if (profile.role === 'org_admin') {
      if (is_global) {
        return NextResponse.json({ error: 'Only super admins can create global notifications' }, { status: 403 })
      }
      if (organization_id && organization_id !== profile.organization_id) {
        return NextResponse.json({ error: 'Can only create notifications for own organization' }, { status: 403 })
      }
    }

    const { data, error } = await adminClient
      .from('notifications')
      .insert({
        user_id: user_id || null,
        organization_id: organization_id || (profile.role === 'org_admin' ? profile.organization_id : null),
        is_global: is_global || false,
        type,
        title,
        message,
        action_url,
        action_label,
        expires_at,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Create notification error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
