'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  FolderOpen,
  Users,
  Mail,
  Building2,
  Phone,
  User,
  Search,
  Plus,
  ChevronRight,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react'
import type { ContactGroup, Lead } from '@/types/database'
import { GroupForm } from '@/components/groups/group-form'

interface GroupMember {
  id: string
  lead: Lead
}

interface GroupWithMembers extends ContactGroup {
  members: GroupMember[]
}

interface CampaignSummary {
  id: string
  name: string
  created_at: string
  status: string
  sent_count: number
  failed_count: number
  total_count: number
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [group, setGroup] = useState<GroupWithMembers | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchGroup = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch group with members
      const response = await fetch(`/api/groups/${id}`)
      if (!response.ok) throw new Error('Group not found')
      const groupData = await response.json()

      // Fetch campaigns sent to this group (simplified - in real app you'd have group_id on campaigns)
      // For now we'll just show recent campaigns
      const campaignsResponse = await fetch('/api/campaigns')
      const campaignsData = await campaignsResponse.json()

      setGroup(groupData.data)

      // Transform campaigns data
      const campaignsSummary = (campaignsData.data || []).slice(0, 5).map((c: {
        id: string
        name: string
        created_at: string
        status: string
        recipients?: Array<{ status: string }>
      }) => ({
        id: c.id,
        name: c.name,
        created_at: c.created_at,
        status: c.status,
        sent_count: c.recipients?.filter((r: { status: string }) => r.status === 'sent').length || 0,
        failed_count: c.recipients?.filter((r: { status: string }) => r.status === 'failed').length || 0,
        total_count: c.recipients?.length || 0,
      }))
      setCampaigns(campaignsSummary)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load group details',
        variant: 'error',
      })
      router.push('/app/groups')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchGroup()
  }, [fetchGroup])

  const handleDelete = async () => {
    if (!group) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/groups/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete group')

      toast({
        title: 'Group deleted',
        description: 'The group has been successfully deleted',
        variant: 'success',
      })
      router.push('/app/groups')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete group',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  // Filter members by search
  const filteredMembers = group?.members.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      member.lead.name.toLowerCase().includes(searchLower) ||
      member.lead.email.toLowerCase().includes(searchLower) ||
      (member.lead.company?.toLowerCase().includes(searchLower) ?? false)
    )
  }) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/app/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{group.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Created {formatDateShort(group.created_at)}
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <FolderOpen className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{group.name.length}</p>
                <p className="text-xs text-neutral-500">Group Name Length</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <Users className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-600">{group.members.length}</p>
                <p className="text-xs text-neutral-500">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <Mail className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">
                  {group.members.filter(m => m.lead.email).length}
                </p>
                <p className="text-xs text-neutral-500">With Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary-100">
                <Building2 className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-600">
                  {new Set(group.members.map(m => m.lead.company).filter(Boolean)).size}
                </p>
                <p className="text-xs text-neutral-500">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                Group Members
              </CardTitle>
              <CardDescription>
                {filteredMembers.length} of {group.members.length} members
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {group.members.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No members in this group</p>
              <p className="text-sm text-neutral-400 mt-1">
                Add members by editing the group
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setEditOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Members
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-500">No members match your search</p>
              <Button variant="ghost" className="mt-2" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {filteredMembers.map((member) => (
                  <Card
                    key={member.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all duration-200',
                      'hover:shadow-md hover:-translate-y-0.5 hover:bg-primary-50/50'
                    )}
                    onClick={() => router.push(`/app/leads/${member.lead.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900 truncate">{member.lead.name}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{member.lead.email}</span>
                          </div>
                          {member.lead.company && (
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate">{member.lead.company}</span>
                            </div>
                          )}
                          {member.lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                              <span>{member.lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-300 shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-primary-50/50"
                        onClick={() => router.push(`/app/leads/${member.lead.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary-50">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <span className="font-medium">{member.lead.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Mail className="h-3.5 w-3.5 text-neutral-400" />
                            {member.lead.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {member.lead.company || '-'}
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {member.lead.phone || '-'}
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {formatDateShort(member.lead.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4 text-neutral-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary-500" />
              Recent Campaigns
            </CardTitle>
            <CardDescription>
              Recent email campaigns in your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-all duration-200',
                    'bg-gradient-to-br from-white to-neutral-50'
                  )}
                  onClick={() => router.push(`/app/campaigns/${campaign.id}`)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateShort(campaign.created_at)}
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
                        className="shrink-0 text-xs"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-success-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {campaign.sent_count}
                        </span>
                        {campaign.failed_count > 0 && (
                          <span className="flex items-center gap-1 text-error-600">
                            <XCircle className="h-3.5 w-3.5" />
                            {campaign.failed_count}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.total_count}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <GroupForm
        open={editOpen}
        onOpenChange={setEditOpen}
        group={group}
        onSuccess={fetchGroup}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{group.name}</strong>? This will remove all member associations but won't delete the leads themselves.
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
