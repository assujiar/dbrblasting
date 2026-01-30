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
    { title: 'Leads', value: stats?.leads || 0, icon: Users, href: '/app/leads', color: 'lavender' },
    { title: 'Groups', value: stats?.groups || 0, icon: FolderKanban, href: '/app/groups', color: 'softBlue' },
    { title: 'Templates', value: stats?.templates || 0, icon: FileText, href: '/app/templates', color: 'purple' },
    { title: 'Campaigns', value: stats?.campaigns || 0, icon: Send, href: '/app/campaigns', color: 'ink' },
  ]

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    lavender: { bg: 'bg-[#F7F4FE]', text: 'text-[#5B46FB]', iconBg: 'bg-[#E9E2FA]' },
    softBlue: { bg: 'bg-[#F2F6FD]', text: 'text-[#4E4D5C]', iconBg: 'bg-[#E2ECF8]' },
    purple: { bg: 'bg-[#F3EFFD]', text: 'text-[#977EF2]', iconBg: 'bg-[#E3D8F6]' },
    ink: { bg: 'bg-[#F5F5F7]', text: 'text-[#040404]', iconBg: 'bg-[#E8E8EE]' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#040404]">Dashboard</h1>
        <p className="text-sm text-[#4E4D5C] mt-1">Ringkasan performa tim dan campaign kamu.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => {
          const colors = colorMap[stat.color]
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="h-full transition-shadow hover:shadow-md hover:shadow-black/5">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <p className="text-2xl font-bold text-[#040404]">{stat.value}</p>
                  <p className="text-sm text-[#4E4D5C]">{stat.title}</p>
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
              <TrendingUp className="h-5 w-5 text-[#977EF2]" />
              Quick Start
            </CardTitle>
            <CardDescription>Mulai cepat tanpa ribet.</CardDescription>
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEEAF7] text-xs font-semibold text-[#5B46FB] shrink-0">
                    {item.step}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[#040404] text-sm">{item.title}</p>
                    <p className="text-xs text-[#4E4D5C]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-[#5B46FB]" />
              Template Tags
            </CardTitle>
            <CardDescription>Gunakan di template biar otomatis.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[
                { tag: '{{name}}', desc: 'Name' },
                { tag: '{{company}}', desc: 'Company' },
                { tag: '{{email}}', desc: 'Email' },
                { tag: '{{phone}}', desc: 'Phone' },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F6FB]">
                  <code className="text-sm font-mono text-[#5B46FB]">{item.tag}</code>
                  <span className="text-sm text-[#4E4D5C]">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
