'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FolderOpen,
  FileText,
  Send,
  Mail,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Types
interface OverviewData {
  total_leads: number
  total_groups: number
  total_templates: number
  total_campaigns: number
  total_emails_sent: number
  delivery_rate: number
  leads_this_month: number
  campaigns_this_month: number
}

interface CampaignStats {
  total_campaigns: number
  completed_campaigns: number
  running_campaigns: number
  draft_campaigns: number
  failed_campaigns: number
}

interface EmailStats {
  total_emails: number
  sent_emails: number
  pending_emails: number
  failed_emails: number
  delivery_rate: number
  failure_rate: number
}

interface WeeklyComparison {
  this_week_emails: number
  last_week_emails: number
  this_week_campaigns: number
  last_week_campaigns: number
  this_week_leads: number
  last_week_leads: number
  email_change_percent: number
  campaign_change_percent: number
  lead_change_percent: number
}

interface RecentCampaign {
  id: string
  name: string
  status: string
  created_at: string
  total_recipients: number
  sent_count: number
  failed_count: number
  pending_count: number
}

interface DailyActivity {
  activity_date: string
  emails_sent: number
  emails_failed: number
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null)
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([])
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const [
        overviewRes,
        campaignStatsRes,
        emailStatsRes,
        weeklyRes,
        recentRes,
        activityRes,
      ] = await Promise.all([
        fetch('/api/analytics?type=overview'),
        fetch('/api/analytics?type=campaign_stats'),
        fetch('/api/analytics?type=email_stats'),
        fetch('/api/analytics?type=weekly_comparison'),
        fetch('/api/analytics?type=recent_campaigns&limit=5'),
        fetch('/api/analytics?type=daily_activity&days=14'),
      ])

      const [overviewData, campaignData, emailData, weeklyData, recentData, activityData] = await Promise.all([
        overviewRes.json(),
        campaignStatsRes.json(),
        emailStatsRes.json(),
        weeklyRes.json(),
        recentRes.json(),
        activityRes.json(),
      ])

      setOverview(overviewData.data)
      setCampaignStats(campaignData.data)
      setEmailStats(emailData.data)
      setWeeklyComparison(weeklyData.data)
      setRecentCampaigns(recentData.data || [])
      setDailyActivity(activityData.data || [])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const statCards = [
    {
      title: 'Total Leads',
      value: overview?.total_leads || 0,
      change: weeklyComparison?.lead_change_percent || 0,
      thisWeek: weeklyComparison?.this_week_leads || 0,
      icon: Users,
      href: '/app/leads',
      gradient: 'from-pink-500 to-rose-500',
      bgLight: 'from-pink-50 to-rose-50',
    },
    {
      title: 'Contact Groups',
      value: overview?.total_groups || 0,
      icon: FolderOpen,
      href: '/app/groups',
      gradient: 'from-violet-500 to-purple-500',
      bgLight: 'from-violet-50 to-purple-50',
    },
    {
      title: 'Email Templates',
      value: overview?.total_templates || 0,
      icon: FileText,
      href: '/app/templates',
      gradient: 'from-blue-500 to-indigo-500',
      bgLight: 'from-blue-50 to-indigo-50',
    },
    {
      title: 'Total Campaigns',
      value: overview?.total_campaigns || 0,
      change: weeklyComparison?.campaign_change_percent || 0,
      thisWeek: weeklyComparison?.this_week_campaigns || 0,
      icon: Send,
      href: '/app/campaigns',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'from-emerald-50 to-teal-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Email marketing analytics & performance overview
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card hover className="h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center',
                      'bg-gradient-to-br',
                      stat.bgLight,
                      'group-hover:scale-110 transition-transform duration-200'
                    )}
                  >
                    <stat.icon
                      className="h-5 w-5"
                      style={{
                        color: stat.gradient.includes('pink')
                          ? '#ec4899'
                          : stat.gradient.includes('violet')
                            ? '#8b5cf6'
                            : stat.gradient.includes('blue')
                              ? '#3b82f6'
                              : '#10b981',
                      }}
                    />
                  </div>
                  {stat.change !== undefined && stat.change !== 0 && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                        stat.change > 0
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      )}
                    >
                      {stat.change > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-neutral-900 mt-4">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-neutral-500 mt-1">{stat.title}</p>
                {stat.thisWeek !== undefined && (
                  <p className="text-xs text-neutral-400 mt-1">
                    +{stat.thisWeek} this week
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Email Performance & Campaign Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Performance */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-pink-50">
                <Mail className="h-4 w-4 text-pink-600" />
              </div>
              Email Performance
            </CardTitle>
            <CardDescription>Overall email delivery statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Delivered</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {emailStats?.sent_emails?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {emailStats?.delivery_rate || 0}% success rate
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {emailStats?.failed_emails?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {emailStats?.failure_rate || 0}% failure rate
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total Emails</span>
                  <span className="font-medium text-neutral-900">
                    {emailStats?.total_emails?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${emailStats?.delivery_rate || 0}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{
                      width: `${emailStats?.total_emails
                        ? ((emailStats.pending_emails / emailStats.total_emails) * 100)
                        : 0
                        }%`,
                    }}
                  />
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                    style={{ width: `${emailStats?.failure_rate || 0}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-neutral-500">Sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-neutral-500">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-neutral-500">Failed</span>
                  </div>
                </div>
              </div>

              {/* Pending */}
              {(emailStats?.pending_emails || 0) > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {emailStats?.pending_emails?.toLocaleString()} emails pending
                    </p>
                    <p className="text-xs text-amber-600">Waiting to be processed</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Status */}
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-50">
                <BarChart3 className="h-4 w-4 text-violet-600" />
              </div>
              Campaign Status
            </CardTitle>
            <CardDescription>Campaign distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                {
                  label: 'Completed',
                  value: campaignStats?.completed_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'emerald',
                  icon: CheckCircle2,
                },
                {
                  label: 'Running',
                  value: campaignStats?.running_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'blue',
                  icon: Activity,
                },
                {
                  label: 'Draft',
                  value: campaignStats?.draft_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'neutral',
                  icon: FileText,
                },
                {
                  label: 'Failed',
                  value: campaignStats?.failed_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'red',
                  icon: XCircle,
                },
              ].map((item) => {
                const percent = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon
                          className={cn(
                            'h-4 w-4',
                            item.color === 'emerald' && 'text-emerald-500',
                            item.color === 'blue' && 'text-blue-500',
                            item.color === 'neutral' && 'text-neutral-400',
                            item.color === 'red' && 'text-red-500'
                          )}
                        />
                        <span className="text-sm text-neutral-600">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">{item.value}</span>
                        <span className="text-xs text-neutral-400">({percent}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          item.color === 'emerald' && 'bg-emerald-500',
                          item.color === 'blue' && 'bg-blue-500',
                          item.color === 'neutral' && 'bg-neutral-300',
                          item.color === 'red' && 'bg-red-500'
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Total Campaigns</span>
                <span className="text-lg font-bold text-neutral-900">
                  {campaignStats?.total_campaigns || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Comparison & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Comparison */}
        <Card className="animate-slide-up lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              Weekly Comparison
            </CardTitle>
            <CardDescription>This week vs last week</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {[
                {
                  label: 'Emails Sent',
                  thisWeek: weeklyComparison?.this_week_emails || 0,
                  lastWeek: weeklyComparison?.last_week_emails || 0,
                  change: weeklyComparison?.email_change_percent || 0,
                },
                {
                  label: 'Campaigns',
                  thisWeek: weeklyComparison?.this_week_campaigns || 0,
                  lastWeek: weeklyComparison?.last_week_campaigns || 0,
                  change: weeklyComparison?.campaign_change_percent || 0,
                },
                {
                  label: 'New Leads',
                  thisWeek: weeklyComparison?.this_week_leads || 0,
                  lastWeek: weeklyComparison?.last_week_leads || 0,
                  change: weeklyComparison?.lead_change_percent || 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                    {item.change !== 0 && (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          item.change > 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {item.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.change)}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-neutral-900">
                      {item.thisWeek.toLocaleString()}
                    </span>
                    <span className="text-sm text-neutral-400 mb-0.5">
                      vs {item.lastWeek.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Chart */}
        <Card className="animate-slide-up lg:col-span-2" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              Email Activity (Last 14 Days)
            </CardTitle>
            <CardDescription>Daily email sending trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {dailyActivity.length > 0 ? (
              <div className="space-y-4">
                {/* Simple Bar Chart */}
                <div className="flex items-end gap-1 h-32">
                  {[...dailyActivity].reverse().map((day, index) => {
                    const maxSent = Math.max(...dailyActivity.map(d => d.emails_sent), 1)
                    const sentHeight = (day.emails_sent / maxSent) * 100
                    const failedHeight = (day.emails_failed / maxSent) * 100

                    return (
                      <div
                        key={day.activity_date}
                        className="flex-1 flex flex-col items-center gap-0.5 group"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="w-full flex flex-col gap-0.5" style={{ height: '100px' }}>
                          <div className="flex-1 flex flex-col justify-end gap-0.5">
                            {day.emails_failed > 0 && (
                              <div
                                className="w-full bg-red-400 rounded-t transition-all duration-300 group-hover:bg-red-500"
                                style={{ height: `${failedHeight}%`, minHeight: failedHeight > 0 ? '2px' : 0 }}
                              />
                            )}
                            <div
                              className="w-full bg-emerald-400 rounded-t transition-all duration-300 group-hover:bg-emerald-500"
                              style={{ height: `${sentHeight}%`, minHeight: sentHeight > 0 ? '2px' : 0 }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-400 transform -rotate-45 origin-center mt-2">
                          {new Date(day.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <span className="text-xs text-neutral-500">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-400" />
                    <span className="text-xs text-neutral-500">Failed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <Activity className="h-8 w-8 mb-2" />
                <p className="text-sm">No activity data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-pink-50">
                <Target className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Latest campaign activity</CardDescription>
              </div>
            </div>
            <Link href="/app/campaigns">
              <Button variant="ghost" size="sm" className="gap-1.5">
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => {
                const successRate = campaign.total_recipients > 0
                  ? Math.round((campaign.sent_count / campaign.total_recipients) * 100)
                  : 0

                return (
                  <Link
                    key={campaign.id}
                    href={`/app/campaigns/${campaign.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-neutral-900 truncate group-hover:text-primary-700">
                          {campaign.name}
                        </p>
                        <Badge
                          variant={
                            campaign.status === 'completed'
                              ? 'success'
                              : campaign.status === 'running'
                                ? 'default'
                                : campaign.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {new Date(campaign.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-neutral-900">{campaign.total_recipients}</p>
                        <p className="text-[10px] text-neutral-400">Recipients</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-emerald-600">{campaign.sent_count}</p>
                        <p className="text-[10px] text-neutral-400">Sent</p>
                      </div>
                      {campaign.failed_count > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-red-600">{campaign.failed_count}</p>
                          <p className="text-[10px] text-neutral-400">Failed</p>
                        </div>
                      )}
                      <div className="w-16">
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400 text-center mt-1">{successRate}%</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
              <Send className="h-8 w-8 mb-2" />
              <p className="text-sm">No campaigns yet</p>
              <Link href="/app/campaigns">
                <Button variant="outline" size="sm" className="mt-3">
                  Create Campaign
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* This Month Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-slide-up bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Leads This Month</span>
            </div>
            <p className="text-4xl font-bold">{overview?.leads_this_month || 0}</p>
            <p className="text-sm text-white/60 mt-1">
              new contacts added
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up bg-gradient-to-br from-violet-500 to-purple-500 text-white border-0" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <Send className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Campaigns This Month</span>
            </div>
            <p className="text-4xl font-bold">{overview?.campaigns_this_month || 0}</p>
            <p className="text-sm text-white/60 mt-1">
              campaigns created
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
