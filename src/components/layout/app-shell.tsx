'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  X,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Send,
  Mail,
  ChevronRight,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: FolderOpen },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
  { name: 'Profile', href: '/app/profile', icon: User },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-18 items-center px-6 border-b border-neutral-100">
        <Link
          href="/app"
          onClick={onNavigate}
          className="flex items-center gap-3 group"
        >
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-primary-500 to-primary-700',
            'shadow-lg shadow-primary-500/30',
            'transition-transform duration-200 group-hover:scale-105'
          )}>
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">BlastMail</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
                  'transition-all duration-200',
                  isActive
                    ? [
                        'bg-primary-50',
                        'text-primary-700',
                      ]
                    : [
                        'text-neutral-600',
                        'hover:bg-neutral-50 hover:text-neutral-900',
                      ]
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary-500 to-primary-600" />
                )}

                {/* Icon container */}
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary-100 shadow-sm'
                    : 'bg-neutral-100/80 group-hover:bg-neutral-200/80'
                )}>
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-neutral-500 group-hover:text-neutral-700'
                    )}
                  />
                </div>

                <span className="flex-1">{item.name}</span>

                {/* Hover arrow indicator */}
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    isActive
                      ? 'text-primary-400 opacity-100'
                      : 'text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Help card */}
      <div className="p-4 mt-auto">
        <div className={cn(
          'rounded-2xl p-5',
          'bg-gradient-to-br from-primary-50 via-primary-50/80 to-accent-50',
          'border border-primary-100/60'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm mb-3">
            <Mail className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-sm font-semibold text-neutral-900">Need help?</p>
          <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
            Check out our documentation for quick setup guides and tips.
          </p>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="app-background" />

      {/* Mobile drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              'fixed inset-y-0 left-0 z-[60] h-full w-72 max-w-[85vw] p-0',
              'rounded-r-3xl',
              'bg-white/98 backdrop-blur-xl',
              'border-r border-neutral-200/50',
              'shadow-2xl shadow-neutral-900/15',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
              'duration-300',
              'focus:outline-none'
            )}
          >
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
            </VisuallyHidden>
            <button
              onClick={() => setDrawerOpen(false)}
              className={cn(
                'absolute top-5 right-4 z-10',
                'rounded-xl p-2.5',
                'text-neutral-400 hover:text-neutral-700',
                'hover:bg-neutral-100',
                'transition-all duration-150',
                'active:scale-95'
              )}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Desktop sidebar - Fixed position */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30',
          'hidden md:flex md:w-72 md:flex-col',
          'bg-white/95 backdrop-blur-xl',
          'border-r border-neutral-200/50',
          'shadow-xl shadow-neutral-900/5'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content wrapper - Offset by sidebar width */}
      <div className="relative min-h-screen md:ml-72">
        {/* Top bar */}
        <header
          className={cn(
            'sticky top-0 z-20 h-16',
            'bg-white/80 backdrop-blur-xl',
            'border-b border-neutral-200/50'
          )}
        >
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  'md:hidden -ml-1',
                  'rounded-xl p-2.5',
                  'text-neutral-500 hover:text-neutral-700',
                  'hover:bg-neutral-100',
                  'transition-all duration-150',
                  'active:scale-95'
                )}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Mobile logo */}
              <Link href="/app" className="md:hidden flex items-center gap-2.5">
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  'bg-gradient-to-br from-primary-500 to-primary-700',
                  'shadow-md shadow-primary-500/25'
                )}>
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900">BlastMail</span>
              </Link>
            </div>

            {/* Right section - User menu */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2.5 px-2 sm:px-3 h-10">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                        'bg-gradient-to-br from-primary-500 to-primary-600',
                        'text-white font-semibold text-sm',
                        'shadow-md shadow-primary-500/25',
                        'ring-2 ring-white'
                      )}
                    >
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[150px] truncate">
                      {user?.email || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1 py-1">
                      <p className="text-sm font-semibold leading-none text-neutral-900">
                        Account
                      </p>
                      <p className="text-xs leading-none text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-error-600 focus:text-error-600 focus:bg-error-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content with proper padding */}
        <main className="p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
