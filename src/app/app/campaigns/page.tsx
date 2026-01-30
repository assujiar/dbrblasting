'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { CampaignDetail } from '@/components/campaigns/campaign-detail'
import { Send, Loader2, CheckCircle2, XCircle, Clock, Play } from 'lucide-react'
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
  const initialCampaignId = searchParams.get('id')

  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(initialCampaignId)
  const [processingCampaignId, setProcessingCampaignId] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns')
      const result = await response.json()

      if (response.ok) {
        setCampaigns(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">
            View your email campaign history and status
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading campaigns...</p>
            </div>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={Send}
              title="No campaigns yet"
              description="Send your first email campaign from the Templates page"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {campaigns.map((campaign) => {
            const progress = campaign.recipientCounts.total > 0
              ? ((campaign.recipientCounts.sent + campaign.recipientCounts.failed) / campaign.recipientCounts.total) * 100
              : 0

            return (
              <Card
                key={campaign.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedCampaignId(campaign.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-900 truncate">{campaign.name}</h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {campaign.template?.name || 'Deleted template'}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status, campaign.recipientCounts)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium">
                        <span className="text-success-600">{campaign.recipientCounts.sent}</span>
                        {campaign.recipientCounts.failed > 0 && (
                          <span className="text-error-600"> / {campaign.recipientCounts.failed} failed</span>
                        )}
                        {campaign.recipientCounts.pending > 0 && (
                          <span className="text-neutral-400"> / {campaign.recipientCounts.pending} pending</span>
                        )}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      indicatorClassName={
                        campaign.status === 'failed'
                          ? 'from-error-500 to-error-600'
                          : campaign.status === 'completed'
                          ? 'from-success-500 to-success-600'
                          : undefined
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                    <span>{formatDate(campaign.created_at)}</span>
                    <span>{campaign.recipientCounts.total} recipients</span>
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

      {/* Campaign Detail Dialog */}
      <CampaignDetail
        campaignId={selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
        onRefresh={fetchCampaigns}
      />
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
