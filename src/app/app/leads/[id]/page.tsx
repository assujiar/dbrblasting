'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Pencil,
  Trash2,
  Loader2,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  FolderOpen,
  Send,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react'
import type { Lead, ContactGroup, EmailCampaignRecipient } from '@/types/database'
import { LeadForm } from '@/components/leads/lead-form'

interface LeadWithGroups extends Lead {
  groups: ContactGroup[]
}

interface EmailHistory {
  id: string
  template_name: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed'
  campaign_id: string
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [lead, setLead] = useState<LeadWithGroups | null>(null)
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchLead = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch lead details
      const response = await fetch(`/api/leads/${id}`)
      if (!response.ok) throw new Error('Lead not found')
      const leadData = await response.json()

      // Fetch groups this lead belongs to
      const groupsResponse = await fetch(`/api/leads/${id}/groups`)
      const groupsData = await groupsResponse.json()

      // Fetch email history for this lead
      const historyResponse = await fetch(`/api/leads/${id}/email-history`)
      const historyData = await historyResponse.json()

      setLead({ ...leadData.data, groups: groupsData.data || [] })
      setEmailHistory(historyData.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load lead details',
        variant: 'error',
      })
      router.push('/app/leads')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete lead')

      toast({
        title: 'Lead deleted',
        description: 'The lead has been successfully deleted',
        variant: 'success',
      })
      router.push('/app/leads')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete lead',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  // Filter email history by date
  const filteredHistory = emailHistory.filter((item) => {
    if (!item.sent_at) return true
    const itemDate = new Date(item.sent_at)
    if (dateFrom && new Date(dateFrom) > itemDate) return false
    if (dateTo && new Date(dateTo) < itemDate) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/app/leads" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 break-words line-clamp-2">{lead.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Added {formatDateShort(lead.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="text-error-600 hover:bg-error-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Lead Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Name</p>
                <p className="text-sm font-semibold text-neutral-900 truncate mt-0.5">{lead.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <Building2 className="h-5 w-5 text-accent-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Company</p>
                <p className="text-sm font-semibold text-neutral-900 truncate mt-0.5">
                  {lead.company || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <Mail className="h-5 w-5 text-success-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-neutral-900 truncate mt-0.5">{lead.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-warning-100">
                <Phone className="h-5 w-5 text-warning-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-semibold text-neutral-900 truncate mt-0.5">
                  {lead.phone || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-5 w-5 text-primary-500" />
            Member of Groups
          </CardTitle>
          <CardDescription>
            Contact groups this lead belongs to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lead.groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <FolderOpen className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">Not a member of any group</p>
              <p className="text-sm text-neutral-400 mt-1">
                Add this lead to a group to organize contacts
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lead.groups.map((group) => (
                <Link key={group.id} href={`/app/groups/${group.id}`}>
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 hover:scale-105"
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
                    {group.name}
                    <ChevronRight className="h-3.5 w-3.5 ml-1 text-neutral-400" />
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email History */}
      <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-5 w-5 text-primary-500" />
                Email Sending History
              </CardTitle>
              <CardDescription>
                All emails sent to this contact
              </CardDescription>
            </div>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Filter:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1 xs:flex-initial">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-neutral-400">From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-8 text-xs xs:w-32"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-neutral-400">To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-8 text-xs xs:w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No emails sent yet</p>
              <p className="text-sm text-neutral-400 mt-1">
                Send a campaign to this contact to see history
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory
                    .sort((a, b) => {
                      const dateA = a.sent_at ? new Date(a.sent_at).getTime() : 0
                      const dateB = b.sent_at ? new Date(b.sent_at).getTime() : 0
                      return dateB - dateA
                    })
                    .map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer transition-colors duration-150 hover:bg-primary-50/50"
                        onClick={() => router.push(`/app/campaigns/${item.campaign_id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary-50">
                              <FileText className="h-4 w-4 text-primary-600" />
                            </div>
                            <span className="font-medium">{item.template_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {item.sent_at ? formatDate(item.sent_at) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 'sent'
                                ? 'success'
                                : item.status === 'failed'
                                ? 'error'
                                : 'default'
                            }
                          >
                            {item.status === 'sent' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {item.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {item.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-neutral-400" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <LeadForm
        open={editOpen}
        onOpenChange={setEditOpen}
        lead={lead}
        onSuccess={fetchLead}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
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
