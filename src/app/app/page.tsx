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
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Contact Groups',
      value: stats?.groups || 0,
      description: 'Organized lead groups',
      icon: FolderKanban,
      href: '/app/groups',
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Email Templates',
      value: stats?.templates || 0,
      description: 'Ready-to-use templates',
      icon: FileText,
      href: '/app/templates',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      title: 'Campaigns Sent',
      value: stats?.campaigns || 0,
      description: 'Total email campaigns',
      icon: Send,
      href: '/app/campaigns',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Welcome back! Here&apos;s an overview of your email marketing.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-neutral-400 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ stroke: 'url(#gradient)' }} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="currentColor" />
                          <stop offset="100%" stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get started with email marketing in a few steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  1
                </span>
                <div>
                  <p className="font-medium text-neutral-800">Add your leads</p>
                  <p className="text-sm text-neutral-500">Import or manually add contact information</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  2
                </span>
                <div>
                  <p className="font-medium text-neutral-800">Create groups</p>
                  <p className="text-sm text-neutral-500">Organize leads into targeted segments</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  3
                </span>
                <div>
                  <p className="font-medium text-neutral-800">Design templates</p>
                  <p className="text-sm text-neutral-500">Create personalized email templates</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  4
                </span>
                <div>
                  <p className="font-medium text-neutral-800">Send campaigns</p>
                  <p className="text-sm text-neutral-500">Launch your email marketing campaigns</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-secondary-500" />
              Personalization Tags
            </CardTitle>
            <CardDescription>
              Use these placeholders in your email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { tag: '{{name}}', desc: "Recipient's full name" },
                { tag: '{{company}}', desc: "Recipient's company name" },
                { tag: '{{email}}', desc: "Recipient's email address" },
                { tag: '{{phone}}', desc: "Recipient's phone number" },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/80">
                  <code className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {item.tag}
                  </code>
                  <span className="text-sm text-neutral-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
