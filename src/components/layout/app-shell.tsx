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
      <div className="flex h-16 items-center px-5">
        <Link
          href="/app"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-md shadow-primary-500/25">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">BlastMail</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200',
                isActive
                  ? [
                      'bg-gradient-to-r from-primary-500/10 to-primary-500/5',
                      'text-primary-700',
                      'shadow-sm',
                    ]
                  : [
                      'text-neutral-600',
                      'hover:bg-neutral-100/80 hover:text-neutral-900',
                    ]
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-400 group-hover:text-neutral-600'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Help card */}
      <div className="p-3">
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100/50 p-4">
          <p className="text-sm font-semibold text-neutral-900">Need help?</p>
          <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
            Check out our documentation for quick setup guides.
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
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="app-background" />

      {/* Mobile drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              'fixed inset-y-0 left-0 z-[60] h-full w-[17rem] max-w-[85vw] p-0',
              // Glass styling
              'rounded-r-2xl',
              'bg-white/95 backdrop-blur-xl',
              'border-r border-white/60',
              'shadow-2xl shadow-neutral-900/10',
              // Animation
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
                'absolute top-4 right-4 z-10',
                'rounded-lg p-2',
                'text-neutral-400 hover:text-neutral-600',
                'hover:bg-neutral-100/80',
                'transition-colors duration-150'
              )}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden md:flex md:w-64 md:flex-col',
          // Glass styling
          'bg-white/80 backdrop-blur-xl',
          'border-r border-white/60',
          'shadow-lg shadow-neutral-900/5'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header
          className={cn(
            'sticky top-0 z-20 h-16',
            // Glass styling
            'bg-white/70 backdrop-blur-xl',
            'border-b border-white/40'
          )}
        >
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            {/* Left section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  'md:hidden -ml-2',
                  'rounded-lg p-2',
                  'text-neutral-500 hover:text-neutral-700',
                  'hover:bg-neutral-100/80',
                  'transition-colors duration-150'
                )}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Mobile logo */}
              <Link href="/app" className="md:hidden flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-sm">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900">BlastMail</span>
              </Link>
            </div>

            {/* Right section - User menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                        'bg-gradient-to-br from-primary-500 to-primary-600',
                        'text-white font-semibold text-sm',
                        'shadow-md shadow-primary-500/25'
                      )}
                    >
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm text-neutral-600 max-w-[150px] truncate">
                      {user?.email || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
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

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
