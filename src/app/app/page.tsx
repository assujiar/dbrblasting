import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderOpen, FileText, Send, Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
      icon: Users,
      href: '/app/leads',
      gradient: 'from-primary-500 to-primary-600',
      bgLight: 'from-primary-50 to-primary-100/50',
    },
    {
      title: 'Contact Groups',
      value: stats?.groups || 0,
      icon: FolderOpen,
      href: '/app/groups',
      gradient: 'from-accent-500 to-accent-600',
      bgLight: 'from-accent-50 to-accent-100/50',
    },
    {
      title: 'Email Templates',
      value: stats?.templates || 0,
      icon: FileText,
      href: '/app/templates',
      gradient: 'from-secondary-500 to-secondary-600',
      bgLight: 'from-secondary-50 to-secondary-100/50',
    },
    {
      title: 'Campaigns Sent',
      value: stats?.campaigns || 0,
      icon: Send,
      href: '/app/campaigns',
      gradient: 'from-success-500 to-success-600',
      bgLight: 'from-success-50 to-success-100/50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of your email marketing performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card hover className="h-full group">
              <CardContent className="p-5">
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center mb-4',
                    'bg-gradient-to-br',
                    stat.bgLight,
                    'group-hover:scale-110 transition-transform duration-200'
                  )}
                >
                  <stat.icon
                    className={cn(
                      'h-5 w-5 bg-gradient-to-br bg-clip-text',
                      stat.gradient.replace('from-', 'text-').split(' ')[0]
                    )}
                    style={{
                      color: `var(--color-${stat.gradient.includes('primary') ? 'primary' : stat.gradient.includes('accent') ? 'accent' : stat.gradient.includes('secondary') ? 'secondary' : 'success'}-600)`,
                    }}
                  />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-500 mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Start & Tags */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50">
                <Sparkles className="h-4 w-4 text-primary-600" />
              </div>
              Quick Start Guide
            </CardTitle>
            <CardDescription>Get started with your first campaign in 4 easy steps</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Add your leads', desc: 'Import or manually add your contacts', href: '/app/leads' },
                { step: '2', title: 'Create groups', desc: 'Organize leads into targeted segments', href: '/app/groups' },
                { step: '3', title: 'Design templates', desc: 'Create beautiful email templates', href: '/app/templates' },
                { step: '4', title: 'Send campaigns', desc: 'Launch and track your campaigns', href: '/app/campaigns' },
              ].map((item) => (
                <li key={item.step}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-start gap-4 p-3 -mx-3 rounded-xl',
                      'transition-all duration-200',
                      'hover:bg-primary-50/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full shrink-0',
                        'bg-gradient-to-br from-primary-500 to-primary-600',
                        'text-xs font-bold text-white',
                        'shadow-sm shadow-primary-500/25'
                      )}
                    >
                      {item.step}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="font-semibold text-neutral-900 text-sm">{item.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-100 to-accent-50">
                <Mail className="h-4 w-4 text-accent-600" />
              </div>
              Template Variables
            </CardTitle>
            <CardDescription>Use these placeholders in your templates for personalization</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                { tag: '{{name}}', desc: 'Recipient name' },
                { tag: '{{company}}', desc: 'Company name' },
                { tag: '{{email}}', desc: 'Email address' },
                { tag: '{{phone}}', desc: 'Phone number' },
              ].map((item) => (
                <div
                  key={item.tag}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl',
                    'bg-gradient-to-r from-neutral-50 to-neutral-100/50',
                    'border border-neutral-100'
                  )}
                >
                  <code
                    className={cn(
                      'text-sm font-mono font-semibold',
                      'bg-gradient-to-r from-primary-600 to-accent-600',
                      'bg-clip-text text-transparent'
                    )}
                  >
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
