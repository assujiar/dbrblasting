'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Filter,
  Building2,
  User,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserRole } from '@/types/database'

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

interface StatusDetail {
  count: number
  sent: number
  failed: number
  pending: number
  total: number
}

interface CampaignStats {
  total_campaigns: number
  completed_campaigns: number
  running_campaigns: number
  draft_campaigns: number
  failed_campaigns: number
  status_details?: {
    completed: StatusDetail
    running: StatusDetail
    draft: StatusDetail
    failed: StatusDetail
  }
  total_sent?: number
  total_failed?: number
  total_recipients?: number
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

interface Organization {
  id: string
  name: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  organization_id: string | null
}

// Chart tooltip state
interface ChartTooltip {
  visible: boolean
  x: number
  y: number
  date: string
  sent: number
  failed: number
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

  // User profile and filtering
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])

  // Filter state
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all')
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Chart interaction state
  const [chartTooltip, setChartTooltip] = useState<ChartTooltip>({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    sent: 0,
    failed: 0,
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const chartRef = useState<HTMLDivElement | null>(null)

  // Determine role capabilities
  const isSuperAdmin = userProfile?.role === 'super_admin'
  const isOrgAdmin = userProfile?.role === 'org_admin'
  const canFilterOrg = isSuperAdmin
  const canFilterUser = isSuperAdmin || isOrgAdmin

  // Build filter query string
  const getFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedOrgId !== 'all') params.set('organization_id', selectedOrgId)
    if (selectedUserId !== 'all') params.set('user_id', selectedUserId)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    return params.toString()
  }, [selectedOrgId, selectedUserId, dateFrom, dateTo])

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const filterParams = getFilterParams()
      const filterSuffix = filterParams ? `&${filterParams}` : ''

      const [
        overviewRes,
        campaignStatsRes,
        emailStatsRes,
        weeklyRes,
        recentRes,
        activityRes,
      ] = await Promise.all([
        fetch(`/api/analytics?type=overview${filterSuffix}`),
        fetch(`/api/analytics?type=campaign_stats${filterSuffix}`),
        fetch(`/api/analytics?type=email_stats${filterSuffix}`),
        fetch(`/api/analytics?type=weekly_comparison${filterSuffix}`),
        fetch(`/api/analytics?type=recent_campaigns&limit=5${filterSuffix}`),
        fetch(`/api/analytics?type=daily_activity&days=14${filterSuffix}`),
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
  }, [getFilterParams])

  // Fetch user profile and filter options on mount
  useEffect(() => {
    const fetchUserAndOptions = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch('/api/profile')
        const profileData = await profileRes.json()
        if (profileRes.ok && profileData.data) {
          setUserProfile(profileData.data)

          // If superadmin, fetch organizations
          if (profileData.data.role === 'super_admin') {
            const orgsRes = await fetch('/api/organizations')
            const orgsData = await orgsRes.json()
            if (orgsRes.ok && orgsData.data) {
              setOrganizations(orgsData.data)
            }
          }

          // If superadmin or org_admin, fetch users
          if (profileData.data.role === 'super_admin' || profileData.data.role === 'org_admin') {
            const usersRes = await fetch('/api/users')
            const usersData = await usersRes.json()
            if (usersRes.ok && usersData.data) {
              setUsers(usersData.data)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserAndOptions()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Refetch when filters change
  useEffect(() => {
    if (userProfile) {
      fetchAnalytics(true)
    }
  }, [selectedOrgId, selectedUserId, dateFrom, dateTo])

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

  // Check if any filter is active
  const hasActiveFilters = selectedOrgId !== 'all' || selectedUserId !== 'all' || dateFrom || dateTo

  // Clear all filters
  const clearFilters = () => {
    setSelectedOrgId('all')
    setSelectedUserId('all')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Email marketing analytics & performance overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
                  {[selectedOrgId !== 'all', selectedUserId !== 'all', dateFrom || dateTo].filter(Boolean).length}
                </span>
              )}
            </Button>
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
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="animate-slide-up border-primary-200 bg-primary-50/30">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-end gap-4">
                {/* Organization Filter (Super Admin only) */}
                {canFilterOrg && (
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Organization
                    </label>
                    <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="All Organizations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User Filter (Super Admin & Org Admin) */}
                {canFilterUser && (
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      User
                    </label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Range Filter (All roles) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9 px-3 rounded-md border border-neutral-200 bg-white text-sm"
                      placeholder="From"
                    />
                    <span className="text-neutral-400">to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9 px-3 rounded-md border border-neutral-200 bg-white text-sm"
                      placeholder="To"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 text-neutral-500 hover:text-neutral-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-primary-200 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-neutral-500">Active filters:</span>
                  {selectedOrgId !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Org: {organizations.find(o => o.id === selectedOrgId)?.name || selectedOrgId}
                    </Badge>
                  )}
                  {selectedUserId !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      User: {users.find(u => u.id === selectedUserId)?.full_name || users.find(u => u.id === selectedUserId)?.email || selectedUserId}
                    </Badge>
                  )}
                  {(dateFrom || dateTo) && (
                    <Badge variant="secondary" className="text-xs">
                      Date: {dateFrom || 'any'} - {dateTo || 'any'}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
            <CardDescription>Campaign distribution by status with email details</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {[
                {
                  label: 'Completed',
                  statusKey: 'completed' as const,
                  value: campaignStats?.completed_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'emerald',
                  icon: CheckCircle2,
                },
                {
                  label: 'Running',
                  statusKey: 'running' as const,
                  value: campaignStats?.running_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'blue',
                  icon: Activity,
                },
                {
                  label: 'Draft',
                  statusKey: 'draft' as const,
                  value: campaignStats?.draft_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'neutral',
                  icon: FileText,
                },
                {
                  label: 'Failed',
                  statusKey: 'failed' as const,
                  value: campaignStats?.failed_campaigns || 0,
                  total: campaignStats?.total_campaigns || 0,
                  color: 'red',
                  icon: XCircle,
                },
              ].map((item) => {
                const percent = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                const details = campaignStats?.status_details?.[item.statusKey]
                const sentPercent = details && details.total > 0 ? Math.round((details.sent / details.total) * 100) : 0
                const failedPercent = details && details.total > 0 ? Math.round((details.failed / details.total) * 100) : 0

                return (
                  <Link
                    key={item.label}
                    href={`/app/campaigns?status=${item.statusKey}`}
                    className="block p-3 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-2">
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
                        <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">{item.value}</span>
                        <span className="text-xs text-neutral-400">({percent}%)</span>
                      </div>
                    </div>

                    {/* Dual-color progress bar: green for sent, red for failed */}
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex">
                      {details && details.total > 0 ? (
                        <>
                          <div
                            className="bg-emerald-500 transition-all duration-500"
                            style={{ width: `${sentPercent}%` }}
                          />
                          <div
                            className="bg-red-500 transition-all duration-500"
                            style={{ width: `${failedPercent}%` }}
                          />
                        </>
                      ) : (
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            item.color === 'emerald' && 'bg-emerald-500',
                            item.color === 'blue' && 'bg-blue-500',
                            item.color === 'neutral' && 'bg-neutral-300',
                            item.color === 'red' && 'bg-red-500'
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      )}
                    </div>

                    {/* Detailed stats */}
                    {details && details.total > 0 && (
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600">
                            <span className="font-semibold">{details.sent}</span> sent ({sentPercent}%)
                          </span>
                          <span className="text-red-600">
                            <span className="font-semibold">{details.failed}</span> failed ({failedPercent}%)
                          </span>
                        </div>
                        <span className="text-neutral-400">{details.total} recipients</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Total Summary */}
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Total Campaigns</span>
                <span className="text-lg font-bold text-neutral-900">
                  {campaignStats?.total_campaigns || 0}
                </span>
              </div>
              {(campaignStats?.total_recipients || 0) > 0 && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 rounded-lg bg-neutral-50">
                    <p className="font-bold text-neutral-900">{campaignStats?.total_recipients || 0}</p>
                    <p className="text-neutral-500">Recipients</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50">
                    <p className="font-bold text-emerald-600">{campaignStats?.total_sent || 0}</p>
                    <p className="text-emerald-600">Sent</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50">
                    <p className="font-bold text-red-600">{campaignStats?.total_failed || 0}</p>
                    <p className="text-red-600">Failed</p>
                  </div>
                </div>
              )}
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

        {/* Daily Activity Chart - Line Chart with Points */}
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
                {/* Line Chart */}
                <div className="relative h-48">
                  {(() => {
                    const data = [...dailyActivity].reverse()
                    const maxValue = Math.max(
                      ...data.map(d => Math.max(d.emails_sent, d.emails_failed)),
                      1
                    )
                    const chartWidth = 100
                    const chartHeight = 100
                    const padding = 5

                    // Calculate points for sent line
                    const sentPoints = data.map((d, i) => {
                      const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2)
                      const y = chartHeight - padding - (d.emails_sent / maxValue) * (chartHeight - padding * 2)
                      return { x, y, data: d }
                    })

                    // Calculate points for failed line
                    const failedPoints = data.map((d, i) => {
                      const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2)
                      const y = chartHeight - padding - (d.emails_failed / maxValue) * (chartHeight - padding * 2)
                      return { x, y, data: d }
                    })

                    // Create line path
                    const createLinePath = (points: typeof sentPoints) => {
                      if (points.length === 0) return ''
                      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                    }

                    // Create area path (for gradient fill)
                    const createAreaPath = (points: typeof sentPoints) => {
                      if (points.length === 0) return ''
                      const linePath = createLinePath(points)
                      const firstX = points[0].x
                      const lastX = points[points.length - 1].x
                      return `${linePath} L ${lastX} ${chartHeight - padding} L ${firstX} ${chartHeight - padding} Z`
                    }

                    return (
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          {/* Gradient for sent area */}
                          <linearGradient id="sentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                          </linearGradient>
                          {/* Gradient for failed area */}
                          <linearGradient id="failedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>

                        {/* Sent Area Fill */}
                        <path
                          d={createAreaPath(sentPoints)}
                          fill="url(#sentGradient)"
                        />

                        {/* Failed Area Fill */}
                        <path
                          d={createAreaPath(failedPoints)}
                          fill="url(#failedGradient)"
                        />

                        {/* Sent Line */}
                        <path
                          d={createLinePath(sentPoints)}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Failed Line */}
                        <path
                          d={createLinePath(failedPoints)}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Sent Points */}
                        {sentPoints.map((point, i) => (
                          <circle
                            key={`sent-${i}`}
                            cx={point.x}
                            cy={point.y}
                            r="1"
                            fill="white"
                            stroke="#10b981"
                            strokeWidth="0.5"
                            className="cursor-pointer hover:r-[1.5] transition-all"
                            onClick={() => {
                              setChartTooltip({
                                visible: true,
                                x: point.x,
                                y: point.y,
                                date: point.data.activity_date,
                                sent: point.data.emails_sent,
                                failed: point.data.emails_failed,
                              })
                            }}
                            onDoubleClick={() => setSelectedDate(point.data.activity_date)}
                          />
                        ))}

                        {/* Failed Points */}
                        {failedPoints.map((point, i) => (
                          <circle
                            key={`failed-${i}`}
                            cx={point.x}
                            cy={point.y}
                            r="1"
                            fill="white"
                            stroke="#ef4444"
                            strokeWidth="0.5"
                            className="cursor-pointer hover:r-[1.5] transition-all"
                            onClick={() => {
                              setChartTooltip({
                                visible: true,
                                x: point.x,
                                y: point.y,
                                date: point.data.activity_date,
                                sent: point.data.emails_sent,
                                failed: point.data.emails_failed,
                              })
                            }}
                            onDoubleClick={() => setSelectedDate(point.data.activity_date)}
                          />
                        ))}
                      </svg>
                    )
                  })()}

                  {/* Tooltip */}
                  {chartTooltip.visible && (
                    <div
                      className="absolute z-10 bg-white rounded-lg shadow-lg border border-neutral-200 p-3 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                      style={{
                        left: `${chartTooltip.x}%`,
                        top: `${chartTooltip.y - 5}%`,
                      }}
                    >
                      <p className="text-xs font-semibold text-neutral-700 mb-1">
                        {new Date(chartTooltip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600">Sent: {chartTooltip.sent}</span>
                        <span className="text-red-600">Failed: {chartTooltip.failed}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between px-2 text-[10px] text-neutral-400">
                  {[...dailyActivity].reverse().filter((_, i, arr) => i === 0 || i === Math.floor(arr.length / 2) || i === arr.length - 1).map((day) => (
                    <span key={day.activity_date}>
                      {new Date(day.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-neutral-500">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-red-500 rounded-full" />
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

      {/* Detail Modal for selected date */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Email Activity - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </DialogTitle>
              <DialogDescription>
                Emails sent and failed on this date
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const dayData = dailyActivity.find(d => d.activity_date === selectedDate)
              if (!dayData) return null
              return (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Sent</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-900">{dayData.emails_sent}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{dayData.emails_failed}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link href={`/app/campaigns?date=${selectedDate}`}>
                      <Button variant="outline" className="gap-2">
                        View Campaigns
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}

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
                const failedRate = campaign.total_recipients > 0
                  ? Math.round((campaign.failed_count / campaign.total_recipients) * 100)
                  : 0

                return (
                  <Link
                    key={campaign.id}
                    href={`/app/campaigns/${campaign.id}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 group"
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
                                  ? 'error'
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
                    <div className="flex items-center gap-4 sm:gap-6 text-sm">
                      <div className="text-center min-w-[50px]">
                        <p className="font-semibold text-neutral-900">{campaign.total_recipients}</p>
                        <p className="text-[10px] text-neutral-400">Recipients</p>
                      </div>
                      <div className="text-center min-w-[40px]">
                        <p className="font-semibold text-emerald-600">{campaign.sent_count}</p>
                        <p className="text-[10px] text-neutral-400">Sent</p>
                      </div>
                      <div className="text-center min-w-[40px]">
                        <p className={cn('font-semibold', campaign.failed_count > 0 ? 'text-red-600' : 'text-neutral-300')}>{campaign.failed_count}</p>
                        <p className="text-[10px] text-neutral-400">Failed</p>
                      </div>
                      {/* Dual-color progress bar */}
                      <div className="w-20">
                        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 transition-all duration-500"
                            style={{ width: `${successRate}%` }}
                          />
                          <div
                            className="bg-red-500 transition-all duration-500"
                            style={{ width: `${failedRate}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className="text-emerald-600">{successRate}%</span>
                          {failedRate > 0 && <span className="text-red-600">{failedRate}%</span>}
                        </div>
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
