"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Users, FileText, Send, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const menu = [
  { name: 'Leads', href: '/app/leads', icon: Users },
  { name: 'Groups', href: '/app/groups', icon: User },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Send },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 p-4 space-y-6 border-r border-border backdrop-blur-lg bg-card">
        <h2 className="text-xl font-semibold px-2">Promo App</h2>
        <nav className="space-y-2">
          {menu.map(({ name, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-lg">
          <h1 className="text-lg font-medium capitalize">{menu.find((m) => pathname.startsWith(m.href))?.name ?? ''}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-gray-500">Account</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 overflow-y-auto space-y-4">{children}</main>
      </div>
    </div>
  )
}