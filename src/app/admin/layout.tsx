'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  X,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  ChevronRight,
  Shield,
  Mail,
  ArrowLeft,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { UserProfile } from '@/types/database'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
]

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center border-b border-neutral-100 h-[72px] px-6">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-error-500 to-error-700 shadow-lg shadow-error-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-neutral-900">Admin</span>
              <p className="text-xs text-neutral-500">Super Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Back to App */}
        <div className="px-4 pt-4">
          <Link href="/app">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Admin Menu
          </p>
          <div className="flex flex-col gap-2">
            {adminNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-error-50 text-error-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-sm bg-gradient-to-b from-error-500 to-error-600" />
                  )}
                  <div
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-error-100'
                        : 'bg-neutral-100 group-hover:bg-neutral-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] transition-colors duration-200',
                        isActive
                          ? 'text-error-600'
                          : 'text-neutral-500 group-hover:text-neutral-700'
                      )}
                    />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 transition-all duration-200',
                      isActive
                        ? 'text-error-400 opacity-100'
                        : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                    )}
                  />
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Info card */}
        <div className="p-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-error-50 to-warning-50 border border-error-100/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 shadow-sm mb-3">
              <Shield className="w-5 h-5 text-error-600" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              Super Admin Access
            </p>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              You have full access to manage all organizations, users, and settings.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profile)

        // Redirect if not super admin
        if (profile?.role !== 'super_admin') {
          router.push('/app')
          return
        }
      } else {
        router.push('/login')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-error-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-error-600 animate-pulse" />
          </div>
          <p className="text-sm text-neutral-500">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!profile || profile.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen relative bg-neutral-50">
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
              <DialogTitle>Admin Navigation Menu</DialogTitle>
            </VisuallyHidden>
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-4 z-10 p-2.5 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebarContent onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex fixed top-0 left-0 bottom-0 z-30 flex-col w-[280px]',
          'bg-white/95 backdrop-blur-xl border-r border-neutral-100 shadow-xl shadow-neutral-900/5'
        )}
      >
        <AdminSidebarContent />
      </aside>

      {/* Main content wrapper */}
      <div className="md:ml-[280px]">
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
                href="/admin"
                className="flex items-center gap-2.5 md:hidden"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-error-500 to-error-700 shadow-md shadow-error-500/25">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900">Admin</span>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2.5 pl-2 pr-3 h-10"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-error-500 to-error-600 text-white font-semibold text-sm shadow-md shadow-error-500/25 ring-2 ring-white">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[150px] truncate">
                      {profile?.full_name || user?.email || 'Admin'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1 py-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        Super Admin
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app" className="cursor-pointer">
                      <Mail className="mr-2 w-4 h-4" />
                      <span>Go to App</span>
                    </Link>
                  </DropdownMenuItem>
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

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
