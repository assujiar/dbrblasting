"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Users, FileText, Send, LogOut, Menu, X, Mail, Settings, LayoutDashboard } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const menu = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: User },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
]

const bottomNav = [
  { name: 'Home', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: User },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
]

const allRoutes = [
  ...menu,
  { name: 'Profile', href: '/app/profile', icon: Settings },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app'
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    if (pathname === '/app') return 'Dashboard'
    const route = allRoutes.find((m) => pathname.startsWith(m.href) && m.href !== '/app')
    return route?.name ?? 'Dashboard'
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 p-4 space-y-6 border-r border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">BlastMail</h2>
            <p className="text-[10px] text-gray-500 font-medium">Email Marketing</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5">
          {menu.map(({ name, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out group ${
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-200 pt-4 space-y-1.5">
          <Link
            href="/app/profile"
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all duration-300 ${
              pathname === '/app/profile'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-white shadow-2xl transform transition-all duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">BlastMail</h2>
              <p className="text-[10px] text-gray-500 font-medium">Email Marketing</p>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 active:scale-95"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map(({ name, href, icon: Icon }, index) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] ${
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
                style={{
                  transitionDelay: mounted && mobileMenuOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            href="/app/profile"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl transition-all duration-300 active:scale-[0.98] ${
              pathname === '/app/profile'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            onClick={() => {
              closeMobileMenu()
              signOut()
            }}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-all duration-300 active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* Help section */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50">
          <p className="text-sm font-semibold text-gray-800">Need help?</p>
          <p className="text-xs text-gray-500 mt-0.5">Check our documentation for guides and tips.</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95 md:hidden"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200/80">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg transition-colors duration-200">
                <Link href="/app/profile" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 rounded-lg transition-colors duration-200">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main content area */}
        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 overflow-y-auto pb-24 md:pb-6">
          <div className="animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200/80 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          {bottomNav.map(({ name, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-300 min-w-[56px] active:scale-95 ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`relative transition-all duration-300 ${active ? 'scale-110' : ''}`}>
                  <Icon className="h-5 w-5" />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-all duration-300 ${active ? 'text-blue-600' : ''}`}>
                  {name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
