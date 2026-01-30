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
import { X, User, Menu, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const navigation = [
  { name: 'Dashboard', href: '/app' },
  { name: 'Leads', href: '/app/leads' },
  { name: 'Groups', href: '/app/groups' },
  { name: 'Templates', href: '/app/templates' },
  { name: 'Campaigns', href: '/app/campaigns' },
  { name: 'Profile', href: '/app/profile' },
]

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/app' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#F2EFFA] text-[#040404]'
                : 'text-[#4E4D5C] hover:bg-[#EEEAF7] hover:text-[#040404]'
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

function MobileMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9A96A5]">Menu</p>
        <h2 className="mt-2 text-xl font-semibold text-[#040404]">Meizon Workspace</h2>
        <p className="text-sm text-[#4E4D5C]">Akses cepat ke dashboard kamu.</p>
      </div>
      <NavigationLinks onNavigate={onNavigate} />
      <div className="mt-auto rounded-2xl border border-[#DDDCE1]/70 bg-[#F7F6FB] p-4">
        <p className="text-sm font-semibold text-[#040404]">Butuh bantuan?</p>
        <p className="mt-1 text-sm text-[#4E4D5C]">
          Lihat panduan singkat biar kamu tetap on track, kok.
        </p>
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
    <div className="min-h-screen bg-white">
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-[60] h-full w-[18rem] max-w-[85vw] p-0 rounded-r-3xl border-r border-[#DDDCE1]/70 bg-white shadow-2xl shadow-black/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 focus:outline-none"
          >
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
            </VisuallyHidden>
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 transition-colors hover:bg-[#F2EFFA]"
            >
              <X className="h-5 w-5 text-[#4E4D5C]" />
            </button>
            <MobileMenu onNavigate={() => setDrawerOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <header className="sticky top-0 z-30 border-b border-[#EEEAF7] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden -ml-2 rounded-lg p-2 transition-colors hover:bg-[#F2EFFA]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-[#4E4D5C]" />
            </button>
            <Link href="/app" className="text-lg font-semibold text-[#040404]">
              Meizon
            </Link>
          </div>

          <div className="hidden md:block">
            <NavigationLinks />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#040404] text-white font-medium text-sm shrink-0">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm text-[#4E4D5C] max-w-[150px] truncate">
                    {user?.email || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-[#9A96A5] truncate">
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

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  )
}
