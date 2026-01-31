'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME } from '@/lib/constants'
import {
  Users,
  FolderKanban,
  FileText,
  Send,
  LayoutDashboard,
  X,
  User,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: FolderKanban },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
  { name: 'Profile', href: '/app/profile', icon: User },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-100">
        <Link href="/app" className="flex items-center">
          <img
            src={APP_LOGO_URL}
            alt={APP_NAME}
            className="h-10 w-auto object-contain"
          />
        </Link>
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <span>Powered by</span>
          <img
            src={APP_LOGO_URL}
            alt={APP_NAME}
            className="h-5 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - always visible */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - slide in drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
