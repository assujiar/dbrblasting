'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationItem, Notification } from './notification-item'
import { useRouter } from 'next/navigation'

interface NotificationsPanelProps {
  className?: string
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=20')
      if (response.ok) {
        const { data, unread_count } = await response.json()
        setNotifications(data || [])
        setUnreadCount(unread_count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_dismissed: true })
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === id)
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev
      })
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleAction = (url: string) => {
    setIsOpen(false)
    router.push(url)
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read)
    await Promise.all(
      unreadNotifications.map(n =>
        fetch(`/api/notifications/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true })
        })
      )
    )
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleClearAll = async () => {
    await Promise.all(
      notifications.map(n =>
        fetch(`/api/notifications/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_dismissed: true })
        })
      )
    )
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-xl transition-all',
          'hover:bg-neutral-100 active:scale-95',
          isOpen && 'bg-neutral-100'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-primary-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Content */}
          <div className={cn(
            'fixed sm:absolute z-50',
            // Mobile: full width bottom sheet
            'inset-x-0 bottom-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-2',
            'w-full sm:w-96 max-h-[70vh] sm:max-h-[500px]',
            'bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200',
            'flex flex-col overflow-hidden',
            'animate-slide-up sm:animate-fade-in'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-500" />
                <h3 className="font-semibold text-neutral-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-100 bg-neutral-50">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai dibaca
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-error-600 hover:text-error-700 hover:bg-error-50"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus semua
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismiss}
                      onRead={handleMarkAsRead}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile drag handle */}
            <div className="sm:hidden h-5 flex items-center justify-center border-t border-neutral-100">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
