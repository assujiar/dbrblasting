'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Loader2, CheckCircle2, XCircle, Clock, Play, Filter, Calendar, X, Sparkles, ChevronRight, Users } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import type { EmailCampaign, EmailTemplate, EmailCampaignRecipient } from '@/types/database'

interface CampaignWithDetails extends EmailCampaign {
  template: Pick<EmailTemplate, 'id' | 'name' | 'subject'> | null
  recipients: Pick<EmailCampaignRecipient, 'id' | 'status'>[]
  recipientCounts: {
    total: number
    pending: number
    sent: number
    failed: number
  }
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingCampaignId, setProcessingCampaignId] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_sent' | 'has_failed' | 'completed' | 'running' | 'draft'>('all')

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)

      const response = await fetch(`/api/campaigns?${params}`)
      const result = await response.json()

      if (response.ok) {
        setCampaigns(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Auto-process running campaigns
  const processCampaign = useCallback(async (campaignId: string) => {
    setProcessingCampaignId(campaignId)
    try {
      const response = await fetch('/api/worker/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchCampaigns()

        // If there are remaining recipients, continue processing
        if (result.remaining > 0) {
          setTimeout(() => processCampaign(campaignId), 1000)
        } else {
          setProcessingCampaignId(null)
        }
      }
    } catch (error) {
      console.error('Worker error:', error)
      setProcessingCampaignId(null)
    }
  }, [fetchCampaigns])

  // Auto-start processing for running campaigns
  useEffect(() => {
    const runningCampaign = campaigns.find(
      (c) => c.status === 'running' && c.recipientCounts.pending > 0
    )
    if (runningCampaign && !processingCampaignId) {
      processCampaign(runningCampaign.id)
    }
  }, [campaigns, processingCampaignId, processCampaign])

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = dateFrom || dateTo

  const getStatusBadge = (status: string, counts: CampaignWithDetails['recipientCounts']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case 'running':
        return (
          <Badge variant="default" className="text-xs">
            <Play className="h-3 w-3 mr-1" />
            {counts.sent}/{counts.total}
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        )
    }
  }

  // Calculate summary stats
  const stats = campaigns.reduce(
    (acc, c) => ({
      total: acc.total + 1,
      sent: acc.sent + c.recipientCounts.sent,
      failed: acc.failed + c.recipientCounts.failed,
      recipients: acc.recipients + c.recipientCounts.total,
    }),
    { total: 0, sent: 0, failed: 0, recipients: 0 }
  )

  // Filter campaigns by status or email status
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'has_sent') return campaign.recipientCounts.sent > 0
    if (statusFilter === 'has_failed') return campaign.recipientCounts.failed > 0
    return campaign.status === statusFilter
  })

  // Get filter label for display
  const getFilterLabel = () => {
    switch (statusFilter) {
      case 'has_sent': return 'with sent emails'
      case 'has_failed': return 'with failed emails'
      default: return statusFilter
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">
            View your email campaign history and status
          </p>
        </div>
      </div>

      {/* Stats Cards - Clickable to filter */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-primary-50/50 to-white overflow-hidden',
            statusFilter === 'all' && 'ring-2 ring-primary-500 shadow-md'
          )}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary-100 shrink-0">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 truncate">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-success-50/50 to-white overflow-hidden',
            statusFilter === 'has_sent' && 'ring-2 ring-success-500 shadow-md'
          )}
          onClick={() => setStatusFilter('has_sent')}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-success-100 shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-success-600">{stats.sent}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 truncate">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-error-50/50 to-white overflow-hidden',
            statusFilter === 'has_failed' && 'ring-2 ring-error-500 shadow-md'
          )}
          onClick={() => setStatusFilter('has_failed')}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-error-100 shrink-0">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-error-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-error-600">{stats.failed}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 truncate">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-50/50 to-white overflow-hidden">
          <CardContent className="p-3 sm:pt-4 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-accent-100 shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-neutral-900">{stats.recipients}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 truncate">Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card className="animate-slide-up overflow-hidden" style={{ animationDelay: '100ms' }}>
        <CardContent className="py-3 sm:py-4">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <div className="p-1.5 sm:p-2 rounded-lg bg-neutral-100">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500" />
                </div>
                <span className="font-medium text-xs sm:text-sm">Filter by Date</span>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-500 h-7 sm:h-8 text-xs px-2">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline ml-1">Clear</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-xs text-neutral-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-xs text-neutral-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter indicator */}
      {(statusFilter !== 'all' || hasFilters) && (
        <Card className="animate-slide-up border-primary-200 bg-primary-50/30 overflow-hidden" style={{ animationDelay: '125ms' }}>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-sm text-primary-700">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                {statusFilter !== 'all' && ` (${getFilterLabel()})`}
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); clearFilters(); }} className="self-start sm:self-auto">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear All Filters</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up overflow-hidden" style={{ animationDelay: '150ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading campaigns...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="animate-slide-up overflow-hidden" style={{ animationDelay: '150ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={Send}
              title={hasFilters || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
              description={hasFilters || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Send your first email campaign from the Templates page'
              }
              action={(hasFilters || statusFilter !== 'all') && (
                <Button variant="outline" onClick={() => { setStatusFilter('all'); clearFilters(); }}>
                  Clear Filters
                </Button>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4 stagger-children">
          {filteredCampaigns.map((campaign) => {
            const progress = campaign.recipientCounts.total > 0
              ? ((campaign.recipientCounts.sent + campaign.recipientCounts.failed) / campaign.recipientCounts.total) * 100
              : 0

            return (
              <Card
                key={campaign.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 overflow-hidden',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  'bg-gradient-to-br from-white to-neutral-50/50'
                )}
                onClick={() => router.push(`/app/campaigns/${campaign.id}`)}
              >
                <CardContent className="p-3 sm:py-4 sm:px-6">
                  <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-900 truncate">{campaign.name}</h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {campaign.template?.name || 'Deleted template'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status, campaign.recipientCounts)}
                      <ChevronRight className="h-4 w-4 text-neutral-300 hidden sm:block" />
                    </div>
                  </div>

                  {/* Detailed Stats Grid */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-3">
                    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-neutral-50">
                      <p className="text-sm sm:text-lg font-bold text-neutral-900">{campaign.recipientCounts.total}</p>
                      <p className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-wide">Recipients</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-success-50">
                      <p className="text-sm sm:text-lg font-bold text-success-600">{campaign.recipientCounts.sent}</p>
                      <p className="text-[8px] sm:text-[10px] text-success-600 uppercase tracking-wide">Sent</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-error-50">
                      <p className="text-sm sm:text-lg font-bold text-error-600">{campaign.recipientCounts.failed}</p>
                      <p className="text-[8px] sm:text-[10px] text-error-600 uppercase tracking-wide">Failed</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-warning-50">
                      <p className="text-sm sm:text-lg font-bold text-warning-600">{campaign.recipientCounts.pending}</p>
                      <p className="text-[8px] sm:text-[10px] text-warning-600 uppercase tracking-wide">Pending</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium text-neutral-700">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      indicatorClassName={
                        campaign.recipientCounts.failed > 0 && campaign.recipientCounts.sent === 0
                          ? 'from-error-500 to-error-600'
                          : campaign.recipientCounts.failed > 0
                          ? 'from-warning-500 to-warning-600'
                          : 'from-success-500 to-success-600'
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                    <span>{formatDate(campaign.created_at)}</span>
                    <span className="font-medium">
                      {campaign.recipientCounts.sent > 0 && (
                        <span className="text-success-600">{Math.round((campaign.recipientCounts.sent / campaign.recipientCounts.total) * 100)}% success</span>
                      )}
                      {campaign.recipientCounts.failed > 0 && campaign.recipientCounts.sent > 0 && ' · '}
                      {campaign.recipientCounts.failed > 0 && (
                        <span className="text-error-600">{Math.round((campaign.recipientCounts.failed / campaign.recipientCounts.total) * 100)}% failed</span>
                      )}
                    </span>
                  </div>

                  {processingCampaignId === campaign.id && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing emails...
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            <p className="text-sm text-neutral-500">Loading campaigns...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <CampaignsContent />
    </Suspense>
  )
}
