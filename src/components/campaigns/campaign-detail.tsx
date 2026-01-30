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
import { Trash2, Loader2, CheckCircle2, XCircle, Clock, Play, Mail } from 'lucide-react'
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
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg truncate pr-8">{campaign.name}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                <span className="block truncate">Template: {campaign.template?.name || 'Deleted'}</span>
                <span className="block truncate">Subject: {campaign.template?.subject || 'N/A'}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Stats - responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 my-4">
              <div className="text-center p-2 sm:p-3 rounded-xl bg-gray-50">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{counts.total}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-xl bg-green-50">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{counts.sent}</div>
                <div className="text-[10px] sm:text-xs text-green-600">Sent</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-xl bg-red-50">
                <div className="text-lg sm:text-2xl font-bold text-red-700">{counts.failed}</div>
                <div className="text-[10px] sm:text-xs text-red-600">Failed</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-xl bg-yellow-50">
                <div className="text-lg sm:text-2xl font-bold text-yellow-700">{counts.pending}</div>
                <div className="text-[10px] sm:text-xs text-yellow-600">Pending</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 sm:h-2" />
            </div>

            {/* Recipients - Mobile Cards */}
            <div className="flex-1 overflow-auto sm:hidden space-y-2">
              {campaign.recipients.map((recipient) => (
                <div key={recipient.id} className="p-3 rounded-lg bg-gray-50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{recipient.to_name}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        {recipient.to_email}
                      </p>
                    </div>
                    {getStatusBadge(recipient.status)}
                  </div>
                  {recipient.sent_at && (
                    <p className="text-[10px] text-gray-400">
                      Sent: {formatDate(recipient.sent_at)}
                    </p>
                  )}
                  {recipient.error && (
                    <p className="text-[10px] text-red-600 line-clamp-2">
                      Error: {recipient.error}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Recipients Table - Desktop */}
            <div className="flex-1 overflow-auto border rounded-xl hidden sm:block">
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
                      <TableCell className="max-w-[150px] truncate">{recipient.to_email}</TableCell>
                      <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {recipient.sent_at ? formatDate(recipient.sent_at) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-red-600 max-w-[200px] truncate" title={recipient.error || undefined}>
                        {recipient.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              {counts.pending > 0 && (
                <Button onClick={handleContinueSending} loading={isProcessing} className="w-full sm:w-auto">
                  <Play className="h-4 w-4" />
                  <span className="truncate">Continue ({counts.pending} left)</span>
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete} loading={isDeleting} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
