'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone, Mail, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'campaign_complete' | 'campaign_failed' | 'system'
  title: string
  message: string
  action_url?: string
  action_label?: string
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
  onRead?: (id: string) => void
  onAction?: (url: string) => void
}

const SWIPE_THRESHOLD = 100 // pixels to trigger dismiss
const SWIPE_VELOCITY_THRESHOLD = 0.5 // pixels per millisecond

export function NotificationItem({
  notification,
  onDismiss,
  onRead,
  onAction
}: NotificationItemProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const startX = useRef(0)
  const startTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto mark as read when shown
  useEffect(() => {
    if (!notification.is_read && onRead) {
      const timer = setTimeout(() => {
        onRead(notification.id)
      }, 2000) // Mark as read after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.is_read, onRead])

  const getIcon = () => {
    const iconClass = 'h-5 w-5'
    switch (notification.type) {
      case 'success':
      case 'campaign_complete':
        return <CheckCircle className={cn(iconClass, 'text-success-500')} />
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-warning-500')} />
      case 'error':
      case 'campaign_failed':
        return <AlertCircle className={cn(iconClass, 'text-error-500')} />
      case 'announcement':
        return <Megaphone className={cn(iconClass, 'text-primary-500')} />
      case 'system':
        return <Settings className={cn(iconClass, 'text-neutral-500')} />
      default:
        return <Info className={cn(iconClass, 'text-primary-500')} />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
      case 'campaign_complete':
        return 'bg-success-50 border-success-200'
      case 'warning':
        return 'bg-warning-50 border-warning-200'
      case 'error':
      case 'campaign_failed':
        return 'bg-error-50 border-error-200'
      case 'announcement':
        return 'bg-primary-50 border-primary-200'
      default:
        return 'bg-white border-neutral-200'
    }
  }

  // Touch event handlers for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startTime.current = Date.now()
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    // Only allow swiping right (to dismiss)
    if (diff > 0) {
      setTranslateX(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    const endTime = Date.now()
    const velocity = translateX / (endTime - startTime.current)

    // Dismiss if threshold exceeded or velocity is high enough
    if (translateX > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      handleDismiss()
    } else {
      // Snap back
      setTranslateX(0)
    }
  }

  // Mouse event handlers for desktop drag (optional)
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX
    startTime.current = Date.now()
    setIsDragging(true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - startX.current
    if (diff > 0) {
      setTranslateX(diff)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    const endTime = Date.now()
    const velocity = translateX / (endTime - startTime.current)

    if (translateX > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      handleDismiss()
    } else {
      setTranslateX(0)
    }
  }

  const handleDismiss = () => {
    setIsExiting(true)
    setTranslateX(window.innerWidth)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-sm',
        getBgColor(),
        isExiting && 'opacity-0',
        'transition-[transform,opacity] duration-300 ease-out'
      )}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 300ms ease-out, opacity 300ms ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe hint background */}
      {translateX > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-error-500 flex items-center justify-start pl-4"
          style={{ width: translateX }}
        >
          <X className="h-5 w-5 text-white" />
        </div>
      )}

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                'font-semibold text-sm text-neutral-900',
                !notification.is_read && 'font-bold'
              )}>
                {notification.title}
              </h4>

              {/* X button for desktop */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors hidden sm:flex"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
              {notification.message}
            </p>

            <div className="flex items-center justify-between mt-2 gap-2">
              <span className="text-xs text-neutral-400">
                {formatTime(notification.created_at)}
              </span>

              {notification.action_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => onAction?.(notification.action_url!)}
                >
                  {notification.action_label || 'Lihat'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="absolute top-3 right-3 sm:hidden">
            <span className="w-2 h-2 bg-primary-500 rounded-full block" />
          </div>
        )}
      </div>

      {/* Mobile swipe hint */}
      <div className="sm:hidden text-xs text-neutral-400 text-center pb-2 px-4">
        <span className="opacity-50">Geser ke kanan untuk menghapus</span>
      </div>
    </div>
  )
}
