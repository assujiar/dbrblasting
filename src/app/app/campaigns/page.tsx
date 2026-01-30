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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your email campaign history and status
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
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
        <div className="space-y-3 sm:space-y-4">
          {campaigns.map((campaign) => {
            const progress = campaign.recipientCounts.total > 0
              ? ((campaign.recipientCounts.sent + campaign.recipientCounts.failed) / campaign.recipientCounts.total) * 100
              : 0

            return (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
                onClick={() => setSelectedCampaignId(campaign.id)}
              >
                <CardContent className="py-3 sm:py-4">
                  <div className="flex items-start sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{campaign.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {campaign.template?.name || 'Deleted'}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status, campaign.recipientCounts)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">
                        <span className="text-green-600">{campaign.recipientCounts.sent}</span>
                        {campaign.recipientCounts.failed > 0 && (
                          <span className="text-red-600"> / {campaign.recipientCounts.failed} failed</span>
                        )}
                        {campaign.recipientCounts.pending > 0 && (
                          <span className="text-gray-400"> / {campaign.recipientCounts.pending} pending</span>
                        )}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-1.5 sm:h-2"
                      indicatorClassName={
                        campaign.status === 'failed'
                          ? 'from-red-500 to-red-600'
                          : campaign.status === 'completed'
                          ? 'from-green-500 to-green-600'
                          : undefined
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                    <span>{formatDate(campaign.created_at)}</span>
                    <span>{campaign.recipientCounts.total} recipients</span>
                  </div>

                  {processingCampaignId === campaign.id && (
                    <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Processing...
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
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    }>
      <CampaignsContent />
    </Suspense>
  )
}
