'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { cn, formatDate, formatDateShort } from '@/lib/utils'
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Send,
  FileText,
  Mail,
  Building2,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Users,
  ChevronRight,
  Eye,
} from 'lucide-react'
import type { EmailCampaign, EmailTemplate, EmailCampaignRecipient } from '@/types/database'

interface CampaignWithDetails extends EmailCampaign {
  template: EmailTemplate | null
  recipients: (EmailCampaignRecipient & { lead_id?: string })[]
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all')

  const fetchCampaign = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${id}`)
      if (!response.ok) throw new Error('Campaign not found')
      const data = await response.json()
      setCampaign(data.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load campaign details',
        variant: 'error',
      })
      router.push('/app/campaigns')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

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

        if (result.remaining > 0) {
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
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete campaign')

      toast({
        title: 'Campaign deleted',
        description: 'The campaign has been successfully deleted',
        variant: 'success',
      })
      router.push('/app/campaigns')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete campaign',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) return null

  const counts = {
    total: campaign.recipients.length,
    sent: campaign.recipients.filter((r) => r.status === 'sent').length,
    failed: campaign.recipients.filter((r) => r.status === 'failed').length,
    pending: campaign.recipients.filter((r) => r.status === 'pending').length,
  }

  const progress = counts.total > 0 ? ((counts.sent + counts.failed) / counts.total) * 100 : 0

  // Filter recipients by status
  const filteredRecipients = campaign.recipients.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  })

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

  const getCampaignStatusBadge = () => {
    switch (campaign.status) {
      case 'completed':
        return (
          <Badge variant="success" className="text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error" className="text-sm">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Failed
          </Badge>
        )
      case 'running':
        return (
          <Badge variant="default" className="text-sm">
            <Play className="h-3.5 w-3.5 mr-1" />
            Running
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral" className="text-sm">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/app/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{campaign.name}</h1>
              {getCampaignStatusBadge()}
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Created {formatDateShort(campaign.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {counts.pending > 0 && (
            <Button onClick={handleContinueSending} loading={isProcessing}>
              <Play className="h-4 w-4" />
              Continue Sending ({counts.pending} left)
            </Button>
          )}
          <Button variant="outline" className="text-error-600 hover:bg-error-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Template Info */}
      {campaign.template && (
        <Card
          className="animate-slide-up cursor-pointer hover:shadow-md transition-all"
          style={{ animationDelay: '50ms' }}
          onClick={() => router.push(`/app/templates/${campaign.template?.id}`)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 rounded-xl bg-primary-100">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Template Used</p>
                  <p className="text-lg font-semibold text-neutral-900 truncate">{campaign.template.name}</p>
                  <p className="text-sm text-neutral-500 truncate mt-0.5">{campaign.template.subject}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Clickable to filter */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            statusFilter === 'all' && 'ring-2 ring-primary-500 shadow-md'
          )}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{counts.total}</p>
                <p className="text-xs text-neutral-500">Total Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-success-50/50 to-white',
            statusFilter === 'sent' && 'ring-2 ring-success-500 shadow-md'
          )}
          onClick={() => setStatusFilter('sent')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{counts.sent}</p>
                <p className="text-xs text-neutral-500">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-error-50/50 to-white',
            statusFilter === 'failed' && 'ring-2 ring-error-500 shadow-md'
          )}
          onClick={() => setStatusFilter('failed')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-error-100">
                <XCircle className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-error-600">{counts.failed}</p>
                <p className="text-xs text-neutral-500">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-warning-50/50 to-white',
            statusFilter === 'pending' && 'ring-2 ring-warning-500 shadow-md'
          )}
          onClick={() => setStatusFilter('pending')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning-100">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-600">{counts.pending}</p>
                <p className="text-xs text-neutral-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardContent className="py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Overall Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
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
        </CardContent>
      </Card>

      {/* Recipients Table */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-500" />
                Recipients
              </CardTitle>
              <CardDescription>
                {statusFilter === 'all'
                  ? `Showing all ${counts.total} recipients`
                  : `Showing ${filteredRecipients.length} ${statusFilter} recipients`}
              </CardDescription>
            </div>
            {statusFilter !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredRecipients.map((recipient) => (
              <Card
                key={recipient.id}
                className={cn(
                  'p-4 cursor-pointer transition-all duration-200',
                  'hover:shadow-md hover:-translate-y-0.5',
                  recipient.lead_id && 'hover:bg-primary-50/50'
                )}
                onClick={() => recipient.lead_id && router.push(`/app/leads/${recipient.lead_id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400 shrink-0" />
                      <p className="font-semibold text-neutral-900 truncate">{recipient.to_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                      <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{recipient.to_email}</span>
                    </div>
                    {recipient.sent_at && (
                      <p className="text-xs text-neutral-400 mt-2">
                        Sent: {formatDate(recipient.sent_at)}
                      </p>
                    )}
                    {recipient.error && (
                      <p className="text-xs text-error-600 mt-1 line-clamp-2">
                        Error: {recipient.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(recipient.status)}
                    {recipient.lead_id && (
                      <ChevronRight className="h-4 w-4 text-neutral-300" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient) => (
                  <TableRow
                    key={recipient.id}
                    className={cn(
                      recipient.lead_id && 'cursor-pointer hover:bg-primary-50/50'
                    )}
                    onClick={() => recipient.lead_id && router.push(`/app/leads/${recipient.lead_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100">
                          <User className="h-4 w-4 text-neutral-600" />
                        </div>
                        <span className="font-medium">{recipient.to_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-500">{recipient.to_email}</TableCell>
                    <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                    <TableCell className="text-neutral-500">
                      {recipient.sent_at ? formatDate(recipient.sent_at) : '-'}
                    </TableCell>
                    <TableCell className="text-error-600 max-w-[200px] truncate" title={recipient.error || undefined}>
                      {recipient.error || '-'}
                    </TableCell>
                    <TableCell>
                      {recipient.lead_id && (
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4 text-neutral-400" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecipients.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No {statusFilter} recipients found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing indicator */}
      {isProcessing && (
        <Card className="animate-slide-up border-primary-200 bg-primary-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
              <span className="text-primary-700 font-medium">Processing emails...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
