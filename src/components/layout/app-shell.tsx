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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-[72px] px-6 border-b border-neutral-100">
        <Link
          href="/app"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">
            BlastMail
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="flex flex-col gap-2">
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
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-sm bg-gradient-to-b from-primary-500 to-primary-600" />
                )}

                {/* Icon container */}
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-100'
                      : 'bg-neutral-100 group-hover:bg-neutral-200'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] transition-colors duration-200',
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
                    'w-4 h-4 transition-all duration-200',
                    isActive
                      ? 'text-primary-400 opacity-100'
                      : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Help card */}
      <div className="p-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 shadow-sm mb-3">
            <Mail className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-sm font-semibold text-neutral-900">
            Need help?
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
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
              'fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] p-0 z-[60]',
              'rounded-r-3xl bg-white/98 backdrop-blur-xl',
              'border-r border-neutral-100 shadow-2xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
              'duration-300 focus:outline-none'
            )}
          >
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
            </VisuallyHidden>
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-4 z-10 p-2.5 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Desktop sidebar - Fixed position */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[280px] z-30 flex-col bg-white/95 backdrop-blur-xl border-r border-neutral-100 shadow-xl shadow-neutral-900/5">
        <SidebarContent />
      </aside>

      {/* Main content wrapper - Offset by sidebar width on desktop */}
      <div className="relative min-h-screen md:ml-[280px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Left section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2.5 -ml-1 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Mobile logo */}
              <Link
                href="/app"
                className="flex items-center gap-2.5 md:hidden"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/25">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900">BlastMail</span>
              </Link>
            </div>

            {/* Right section - User menu */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2.5 pl-2 pr-3 h-10"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-md shadow-primary-500/25 ring-2 ring-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[150px] truncate">
                      {user?.email || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1 py-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        Account
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile" className="cursor-pointer">
                      <User className="mr-2 w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-error-600 focus:text-error-600 focus:bg-error-50"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content with proper padding */}
        <main className="p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
