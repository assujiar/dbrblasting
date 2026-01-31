import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

// PATCH - Update notification (mark as read/dismissed)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const body = await request.json()
    const { is_read, is_dismissed } = body

    // Get the notification
    const { data: notification, error: fetchError } = await adminClient
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Get user's profile
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    // Check if user can access this notification
    const canAccess =
      notification.user_id === user.id ||
      (notification.user_id === null && notification.organization_id === profile?.organization_id) ||
      notification.is_global

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For personal notifications, update directly
    if (notification.user_id === user.id) {
      const updateData: Record<string, unknown> = {}
      if (typeof is_read === 'boolean') updateData.is_read = is_read
      if (typeof is_dismissed === 'boolean') updateData.is_dismissed = is_dismissed

      const { data, error } = await adminClient
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    // For org/global notifications, use dismissals table
    if (is_dismissed) {
      const { error } = await adminClient
        .from('notification_dismissals')
        .upsert({
          notification_id: id,
          user_id: user.id,
          dismissed_at: new Date().toISOString()
        }, {
          onConflict: 'notification_id,user_id'
        })

      if (error) {
        console.error('Dismiss error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      data: { ...notification, is_dismissed: is_dismissed || false }
    })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete notification (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can delete notifications' }, { status: 403 })
    }

    const { error } = await adminClient
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
