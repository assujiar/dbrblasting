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
  Users,
  FolderKanban,
  FileText,
  Send,
  LayoutDashboard,
  Mail,
  X,
  User,
  Menu,
  LogOut,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: FolderKanban },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
  { name: 'Profile', href: '/app/profile', icon: User },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Logo */}
      <div className="flex min-h-16 items-center gap-4 px-6 py-4 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shrink-0">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
            BlastMail
          </h1>
          <p className="text-xs text-gray-500">Email Marketing</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-5 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-200',
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
              <span className="truncate leading-6">{item.name}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
          <p className="text-xs font-medium text-gray-700">Need help?</p>
          <p className="text-xs text-gray-500 mt-1">
            Check our documentation for guides and tips.
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

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" />

      {/* Mobile Drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-[60] h-full w-[18rem] max-w-[85vw] p-0 rounded-r-2xl glass-strong data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 focus:outline-none"
          >
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
            </VisuallyHidden>
            {/* Close button */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden md:flex sticky top-0 z-30 h-screen flex-col glass border-r border-white/20">
          <SidebarContent />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 h-16 glass border-b border-white/20">
            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Left: Hamburger on mobile */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden -ml-2 rounded-xl p-2 transition-colors hover:bg-gray-100"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Right: User menu */}
              <div className="flex items-center gap-2 sm:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-medium text-sm shrink-0">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm text-gray-700 max-w-[160px] truncate">
                        {user?.email || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-gray-500 truncate">
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
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
