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
  FolderOpen,
  FileText,
  Send,
  Mail,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Shield,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { UserRole } from '@/types/database'
import { NotificationsPanel } from '@/components/notifications'

interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  is_active: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: FolderOpen },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
  { name: 'Profile', href: '/app/profile', icon: User },
]

function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  userRole,
  organization,
}: {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  userRole?: UserRole
  organization?: Organization | null
}) {
  const pathname = usePathname()
  const isSuperAdmin = userRole === 'super_admin'

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className={cn(
          'flex items-center border-b border-neutral-100 transition-all duration-300 shrink-0',
          collapsed ? 'h-[72px] justify-center px-2' : 'h-[72px] px-6'
        )}>
          <Link
            href="/app"
            onClick={onNavigate}
            className={cn(
              'flex items-center transition-all duration-300',
              collapsed ? 'gap-0' : 'gap-3'
            )}
          >
            {organization?.logo_url ? (
              <div className={cn(
                'flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg transition-all duration-300',
                collapsed ? 'w-10 h-10' : 'w-10 h-10'
              )}>
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={cn(
                'flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg shadow-primary-500/30 transition-all duration-300',
                collapsed ? 'w-10 h-10' : 'w-10 h-10'
              )}>
                <img
                  src="/logo-icon.svg"
                  alt="BlastMail"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
            <span className={cn(
              'text-lg font-bold text-neutral-900 transition-all duration-300 overflow-hidden whitespace-nowrap',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}>
              {organization?.name || 'BlastMail'}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          collapsed ? 'p-2' : 'p-6'
        )}>
          <div className="flex flex-col gap-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/app' && pathname.startsWith(item.href))
              const Icon = item.icon

              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-sm bg-gradient-to-b from-primary-500 to-primary-600" />
                  )}

                  {/* Icon container */}
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-lg transition-all duration-200',
                      collapsed ? 'w-9 h-9' : 'w-9 h-9',
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

                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-all duration-200',
                          isActive
                            ? 'text-primary-400 opacity-100'
                            : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                        )}
                      />
                    </>
                  )}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}

            {/* Admin Link for Super Admins */}
            {isSuperAdmin && (
              <>
                <div className={cn(
                  'my-2 border-t border-neutral-100',
                  collapsed ? 'mx-1' : 'mx-0'
                )} />
                {(() => {
                  const isActive = pathname.startsWith('/admin')
                  const linkContent = (
                    <Link
                      href="/admin"
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                        collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                        isActive
                          ? 'bg-error-50 text-error-700'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      )}
                    >
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-sm bg-gradient-to-b from-error-500 to-error-600" />
                      )}
                      <div
                        className={cn(
                          'flex items-center justify-center rounded-lg transition-all duration-200',
                          collapsed ? 'w-9 h-9' : 'w-9 h-9',
                          isActive
                            ? 'bg-error-100'
                            : 'bg-neutral-100 group-hover:bg-neutral-200'
                        )}
                      >
                        <Shield
                          className={cn(
                            'w-[18px] h-[18px] transition-colors duration-200',
                            isActive
                              ? 'text-error-600'
                              : 'text-neutral-500 group-hover:text-neutral-700'
                          )}
                        />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1">Admin Panel</span>
                          <ChevronRight
                            className={cn(
                              'w-4 h-4 transition-all duration-200',
                              isActive
                                ? 'text-error-400 opacity-100'
                                : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                            )}
                          />
                        </>
                      )}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          Admin Panel
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })()}
              </>
            )}
          </div>
        </nav>

        {/* Collapse Toggle Button (Desktop only) */}
        {onToggleCollapse && (
          <div className={cn(
            'shrink-0 border-t border-neutral-100 transition-all duration-300',
            collapsed ? 'p-2' : 'p-4'
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapse}
                  className={cn(
                    'flex items-center gap-2 w-full rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-200',
                    collapsed ? 'justify-center p-3' : 'px-4 py-3'
                  )}
                >
                  {collapsed ? (
                    <PanelLeft className="w-5 h-5" />
                  ) : (
                    <>
                      <PanelLeftClose className="w-5 h-5" />
                      <span>Collapse</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={10}>
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        {/* Powered by BlastMail - shown when org has custom logo */}
        {organization?.logo_url && (
          <div className={cn(
            'shrink-0 border-t border-neutral-100 transition-all duration-300',
            collapsed ? 'p-2' : 'px-4 py-3'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-neutral-400 transition-all duration-300',
              collapsed ? 'justify-center' : 'justify-start'
            )}>
              <div className={cn(
                'flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300',
                collapsed ? 'w-8 h-8' : 'w-6 h-6'
              )}>
                <img
                  src="/logo-icon.svg"
                  alt="BlastMail"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              {!collapsed && (
                <span className="text-xs">
                  Powered by <span className="font-semibold text-neutral-500">BlastMail</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Help card (only when expanded, mobile only) */}
        {!collapsed && !onToggleCollapse && (
          <div className="shrink-0 p-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100/50">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 shadow-sm mb-2">
                <img
                  src="/logo-icon.svg"
                  alt="BlastMail"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                Need help?
              </p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Check our docs for guides.
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined)
  const [organization, setOrganization] = useState<Organization | null>(null)

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed === 'true') {
      setCollapsed(true)
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newValue = !collapsed
    setCollapsed(newValue)
    localStorage.setItem('sidebar-collapsed', String(newValue))
  }

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Fetch user profile to get role and organization via API (server-side)
      if (user) {
        try {
          const response = await fetch('/api/profile')
          const result = await response.json()

          if (response.ok && result.data?.role) {
            setUserRole(result.data.role as UserRole)
          }
          if (response.ok && result.data?.organization) {
            setOrganization(result.data.organization as Organization)
          }
        } catch (err) {
          console.error('Profile fetch error:', err)
        }
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarWidth = collapsed ? 80 : 280

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
            <SidebarContent onNavigate={() => setDrawerOpen(false)} userRole={userRole} organization={organization} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Desktop sidebar - Fixed position with collapse */}
      <aside
        className={cn(
          'hidden md:flex fixed top-0 left-0 bottom-0 z-30 flex-col',
          'bg-white/95 backdrop-blur-xl border-r border-neutral-100 shadow-xl shadow-neutral-900/5',
          'transition-all duration-300 ease-in-out'
        )}
        style={{ width: sidebarWidth }}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} userRole={userRole} organization={organization} />
      </aside>

      {/* Main content wrapper - Offset by sidebar width on desktop */}
      <div
        className="relative min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: 0 }}
      >
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          collapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'
        )}>
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
                  {organization?.logo_url ? (
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden bg-white shadow-md">
                      <img
                        src={organization.logo_url}
                        alt={organization.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden bg-white shadow-md shadow-primary-500/25">
                      <img
                        src="/logo-icon.svg"
                        alt="BlastMail"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                  )}
                  <span className="font-bold text-neutral-900">{organization?.name || 'BlastMail'}</span>
                </Link>
              </div>

              {/* Right section - Notifications & User menu */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <NotificationsPanel />

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
            <div className={cn(
              'mx-auto transition-all duration-300 ease-in-out',
              collapsed ? 'max-w-[1400px]' : 'max-w-6xl'
            )}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
