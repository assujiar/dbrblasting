import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, FileText, Send, TrendingUp, Mail } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [leads, groups, templates, campaigns] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('contact_groups').select('id', { count: 'exact', head: true }),
    supabase.from('email_templates').select('id', { count: 'exact', head: true }),
    supabase.from('email_campaigns').select('id', { count: 'exact', head: true }),
  ])

  return {
    leads: leads.count || 0,
    groups: groups.count || 0,
    templates: templates.count || 0,
    campaigns: campaigns.count || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.leads || 0,
      description: 'Contacts in your database',
      icon: Users,
      href: '/app/leads',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Contact Groups',
      value: stats?.groups || 0,
      description: 'Organized lead groups',
      icon: FolderKanban,
      href: '/app/groups',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Email Templates',
      value: stats?.templates || 0,
      description: 'Ready-to-use templates',
      icon: FileText,
      href: '/app/templates',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Campaigns Sent',
      value: stats?.campaigns || 0,
      description: 'Total email campaigns',
      icon: Send,
      href: '/app/campaigns',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Welcome Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your email marketing.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] cursor-pointer h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="order-2 sm:order-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">{stat.description}</p>
                  </div>
                  <div className={`order-1 sm:order-2 p-2.5 sm:p-3 rounded-xl ${stat.bgColor} self-start`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Quick Start Guide
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Get started with email marketing in a few steps
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] sm:text-xs font-semibold text-blue-700 shrink-0">
                  1
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm">Add your leads</p>
                  <p className="text-xs sm:text-sm text-gray-500">Import or manually add contacts</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] sm:text-xs font-semibold text-blue-700 shrink-0">
                  2
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm">Create groups</p>
                  <p className="text-xs sm:text-sm text-gray-500">Organize into targeted segments</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] sm:text-xs font-semibold text-blue-700 shrink-0">
                  3
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm">Design templates</p>
                  <p className="text-xs sm:text-sm text-gray-500">Create personalized templates</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] sm:text-xs font-semibold text-blue-700 shrink-0">
                  4
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm">Send campaigns</p>
                  <p className="text-xs sm:text-sm text-gray-500">Launch email campaigns</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Personalization Tags
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Use these placeholders in your templates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[
                { tag: '{{name}}', desc: "Recipient's name" },
                { tag: '{{company}}', desc: "Company name" },
                { tag: '{{email}}', desc: "Email address" },
                { tag: '{{phone}}', desc: "Phone number" },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
                  <code className="text-xs sm:text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    {item.tag}
                  </code>
                  <span className="text-xs sm:text-sm text-gray-500 text-right">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
