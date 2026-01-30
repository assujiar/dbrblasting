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
    { title: 'Leads', value: stats?.leads || 0, icon: Users, href: '/app/leads', color: 'blue' },
    { title: 'Groups', value: stats?.groups || 0, icon: FolderKanban, href: '/app/groups', color: 'indigo' },
    { title: 'Templates', value: stats?.templates || 0, icon: FileText, href: '/app/templates', color: 'purple' },
    { title: 'Campaigns', value: stats?.campaigns || 0, icon: Send, href: '/app/campaigns', color: 'green' },
  ]

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your email marketing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => {
          const colors = colorMap[stat.color]
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Start & Tags */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started in a few steps</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-3">
              {[
                { step: '1', title: 'Add leads', desc: 'Import your contacts' },
                { step: '2', title: 'Create groups', desc: 'Organize into segments' },
                { step: '3', title: 'Design templates', desc: 'Create email templates' },
                { step: '4', title: 'Send campaigns', desc: 'Launch your campaign' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 shrink-0">
                    {item.step}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-indigo-600" />
              Template Tags
            </CardTitle>
            <CardDescription>Use in your templates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[
                { tag: '{{name}}', desc: 'Name' },
                { tag: '{{company}}', desc: 'Company' },
                { tag: '{{email}}', desc: 'Email' },
                { tag: '{{phone}}', desc: 'Phone' },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <code className="text-sm font-mono text-blue-600">{item.tag}</code>
                  <span className="text-sm text-gray-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
