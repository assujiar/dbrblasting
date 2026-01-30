'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { cn, formatDate, formatDateShort, sanitizeHtml } from '@/lib/utils'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Send,
  Loader2,
  Calendar,
  Users,
  Eye,
  Code,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Mail,
  Building2,
  ChevronRight,
} from 'lucide-react'
import type { EmailTemplate, EmailCampaign, EmailCampaignRecipient } from '@/types/database'
import { SendDialog } from '@/components/templates/send-dialog'

interface CampaignHistory {
  id: string
  name: string
  status: string
  created_at: string
  recipients: EmailCampaignRecipient[]
  group_name?: string
}

interface TemplateDetailResponse {
  template: EmailTemplate
  campaigns: CampaignHistory[]
}

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignHistory[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignHistory | null>(null)
  const [sendTemplate, setSendTemplate] = useState<EmailTemplate | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchTemplate = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch template
      const response = await fetch(`/api/templates/${id}`)
      if (!response.ok) throw new Error('Template not found')
      const templateData = await response.json()

      // Fetch campaigns for this template
      const campaignsResponse = await fetch(`/api/campaigns?template_id=${id}`)
      const campaignsData = await campaignsResponse.json()

      setTemplate(templateData.data)
      setCampaigns(campaignsData.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template details',
        variant: 'error',
      })
      router.push('/app/templates')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchTemplate()
  }, [fetchTemplate])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete template')

      toast({
        title: 'Template deleted',
        description: 'The template has been successfully deleted',
        variant: 'success',
      })
      router.push('/app/templates')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete template',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  // Filter campaigns by date
  const filteredCampaigns = campaigns.filter((campaign) => {
    const campaignDate = new Date(campaign.created_at)
    if (dateFrom && new Date(dateFrom) > campaignDate) return false
    if (dateTo && new Date(dateTo) < campaignDate) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/app/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{template.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Created {formatDateShort(template.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/app/templates/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-error-600 hover:bg-error-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button onClick={() => setSendTemplate(template)}>
            <Send className="h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Template Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-100">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-500">Template Name</p>
                <p className="text-lg font-semibold text-neutral-900 truncate">{template.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent-100">
                <Mail className="h-6 w-6 text-accent-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-500">Email Subject</p>
                <p className="text-lg font-semibold text-neutral-900 truncate">{template.subject}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HTML & Preview */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card className="overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4 text-primary-500" />
              Raw HTML
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className={cn(
              'h-[400px] overflow-auto p-4 text-xs font-mono',
              'bg-neutral-900 text-neutral-300'
            )}>
              {template.html_body}
            </pre>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-primary-50 to-accent-50 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary-500" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-auto bg-neutral-100">
              <iframe
                srcDoc={sanitizeHtml(template.html_body)}
                className="w-full h-full border-0 bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sending History */}
      <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Sending History
              </CardTitle>
              <CardDescription>
                View all campaigns sent using this template
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-neutral-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto h-9"
                  placeholder="From"
                />
                <span className="text-neutral-400">-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto h-9"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No campaigns found</p>
              <p className="text-sm text-neutral-400 mt-1">
                Send your first email using this template
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => {
                const sentCount = campaign.recipients.filter(r => r.status === 'sent').length
                const failedCount = campaign.recipients.filter(r => r.status === 'failed').length
                const totalCount = campaign.recipients.length

                return (
                  <Card
                    key={campaign.id}
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-all duration-200',
                      'bg-gradient-to-br from-white to-neutral-50'
                    )}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {formatDateShort(campaign.created_at)}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {campaign.group_name || 'Individual Recipients'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            campaign.status === 'completed'
                              ? 'success'
                              : campaign.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                          className="shrink-0"
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-success-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {sentCount}
                          </span>
                          {failedCount > 0 && (
                            <span className="flex items-center gap-1 text-error-600">
                              <XCircle className="h-3.5 w-3.5" />
                              {failedCount}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-neutral-500">
                            <Users className="h-3.5 w-3.5" />
                            {totalCount}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Recipients Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Campaign Recipients</DialogTitle>
            <DialogDescription>
              Sent on {selectedCampaign && formatDate(selectedCampaign.created_at)}
              {' • '}Click on a recipient to view details
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCampaign?.recipients
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((recipient, index) => (
                    <TableRow
                      key={recipient.id}
                      className={cn(
                        'transition-colors duration-150',
                        recipient.lead_id && 'cursor-pointer hover:bg-primary-50/50'
                      )}
                      onClick={() => recipient.lead_id && router.push(`/app/leads/${recipient.lead_id}`)}
                    >
                      <TableCell className="text-neutral-500">{index + 1}</TableCell>
                      <TableCell className="font-medium">{recipient.to_name}</TableCell>
                      <TableCell className="text-neutral-500">{recipient.to_email}</TableCell>
                      <TableCell className="text-neutral-500">
                        {recipient.sent_at ? formatDate(recipient.sent_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            recipient.status === 'sent'
                              ? 'success'
                              : recipient.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                        >
                          {recipient.status === 'sent' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {recipient.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {recipient.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {recipient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {recipient.lead_id && (
                          <ChevronRight className="h-4 w-4 text-neutral-400" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => router.push(`/app/campaigns/${selectedCampaign?.id}`)}>
              View Campaign Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
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

      {/* Send Dialog */}
      <SendDialog template={sendTemplate} onClose={() => setSendTemplate(null)} />
    </div>
  )
}
