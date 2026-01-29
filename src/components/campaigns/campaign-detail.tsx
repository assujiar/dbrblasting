'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Trash2, Loader2, CheckCircle2, XCircle, Clock, Play } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { EmailCampaign, EmailTemplate, EmailCampaignRecipient } from '@/types/database'

interface CampaignWithDetails extends EmailCampaign {
  template: EmailTemplate | null
  recipients: EmailCampaignRecipient[]
}

interface CampaignDetailProps {
  campaignId: string | null
  onClose: () => void
  onRefresh: () => void
}

export function CampaignDetail({ campaignId, onClose, onRefresh }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const result = await response.json()

      if (response.ok) {
        setCampaign(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    } else {
      setCampaign(null)
    }
  }, [campaignId, fetchCampaign])

  const handleContinueSending = async () => {
    if (!campaign) return
    setIsProcessing(true)

    try {
      const response = await fetch('/api/worker/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchCampaign()
        onRefresh()

        if (result.remaining > 0) {
          // Continue processing
          setTimeout(handleContinueSending, 1000)
        } else {
          setIsProcessing(false)
          toast({
            title: 'Campaign completed',
            description: 'All emails have been processed.',
            variant: 'success',
          })
        }
      }
    } catch (error) {
      console.error('Worker error:', error)
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!campaign) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete campaign')
      }

      toast({
        title: 'Campaign deleted',
        description: 'The campaign has been successfully deleted.',
        variant: 'success',
      })
      onRefresh()
      onClose()
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete campaign',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  if (!campaign) return null

  const counts = {
    total: campaign.recipients.length,
    sent: campaign.recipients.filter((r) => r.status === 'sent').length,
    failed: campaign.recipients.filter((r) => r.status === 'failed').length,
    pending: campaign.recipients.filter((r) => r.status === 'pending').length,
  }

  const progress = counts.total > 0 ? ((counts.sent + counts.failed) / counts.total) * 100 : 0

  return (
    <Dialog open={!!campaignId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{campaign.name}</DialogTitle>
              <DialogDescription>
                Template: {campaign.template?.name || 'Deleted'} | Subject: {campaign.template?.subject || 'N/A'}
              </DialogDescription>
            </DialogHeader>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 my-4">
              <div className="text-center p-3 rounded-xl bg-neutral-50/80">
                <div className="text-2xl font-bold text-neutral-900">{counts.total}</div>
                <div className="text-xs text-neutral-500">Total</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-success-50/80">
                <div className="text-2xl font-bold text-success-700">{counts.sent}</div>
                <div className="text-xs text-success-600">Sent</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-error-50/80">
                <div className="text-2xl font-bold text-error-700">{counts.failed}</div>
                <div className="text-xs text-error-600">Failed</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-warning-50/80">
                <div className="text-2xl font-bold text-warning-700">{counts.pending}</div>
                <div className="text-xs text-warning-600">Pending</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Recipients Table */}
            <div className="flex-1 overflow-auto border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.to_name}</TableCell>
                      <TableCell>{recipient.to_email}</TableCell>
                      <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {recipient.sent_at ? formatDate(recipient.sent_at) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-error-600 max-w-[200px] truncate">
                        {recipient.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="mt-4">
              {counts.pending > 0 && (
                <Button onClick={handleContinueSending} loading={isProcessing}>
                  <Play className="h-4 w-4" />
                  Continue Sending ({counts.pending} remaining)
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
                <Trash2 className="h-4 w-4" />
                Delete Campaign
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
