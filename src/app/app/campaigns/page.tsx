'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { CampaignDetail } from '@/components/campaigns/campaign-detail'
import { Send, Loader2, CheckCircle2, XCircle, Clock, Play } from 'lucide-react'
import { formatDate } from '@/lib/utils'
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
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case 'running':
        return (
          <Badge variant="default">
            <Play className="h-3 w-3 mr-1" />
            Running ({counts.sent}/{counts.total})
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Campaigns</h1>
          <p className="text-neutral-500 mt-1">
            View your email campaign history and status
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Send}
              title="No campaigns yet"
              description="Send your first email campaign from the Templates page"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const progress = campaign.recipientCounts.total > 0
              ? ((campaign.recipientCounts.sent + campaign.recipientCounts.failed) / campaign.recipientCounts.total) * 100
              : 0

            return (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedCampaignId(campaign.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{campaign.name}</h3>
                      <p className="text-sm text-neutral-500">
                        Template: {campaign.template?.name || 'Deleted'}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status, campaign.recipientCounts)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium">
                        {campaign.recipientCounts.sent} sent, {campaign.recipientCounts.failed} failed
                        {campaign.recipientCounts.pending > 0 && `, ${campaign.recipientCounts.pending} pending`}
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
                    <span>{campaign.recipientCounts.total} total recipients</span>
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
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    }>
      <CampaignsContent />
    </Suspense>
  )
}
