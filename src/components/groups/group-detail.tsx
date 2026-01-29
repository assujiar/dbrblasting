'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { Pencil, Trash2, UserPlus, X, Loader2 } from 'lucide-react'
import type { ContactGroup, Lead } from '@/types/database'

interface GroupWithMembers extends ContactGroup {
  members: { id: string; lead: Lead }[]
}

interface GroupDetailProps {
  group: GroupWithMembers | null
  onClose: () => void
  onEdit: (group: ContactGroup) => void
  onRefresh: () => void
}

export function GroupDetail({ group, onClose, onEdit, onRefresh }: GroupDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(false)
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  const fetchAvailableLeads = useCallback(async () => {
    if (!group) return
    setIsLoadingLeads(true)
    try {
      const response = await fetch('/api/leads?limit=1000')
      const result = await response.json()
      
      if (response.ok) {
        const memberLeadIds = group.members.map((m) => m.lead?.id)
        const available = result.data.filter(
          (lead: Lead) => !memberLeadIds.includes(lead.id)
        )
        setAvailableLeads(available)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoadingLeads(false)
    }
  }, [group])

  useEffect(() => {
    if (showAddMembers) {
      fetchAvailableLeads()
    }
  }, [showAddMembers, fetchAvailableLeads])

  const handleDelete = async () => {
    if (!group) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete group')
      }

      toast({
        title: 'Group deleted',
        description: 'The group has been successfully deleted.',
        variant: 'success',
      })
      onRefresh()
      onClose()
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete group',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddMembers = async () => {
    if (!group || selectedLeads.length === 0) return
    setIsAddingMembers(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to add members')
      }

      toast({
        title: 'Members added',
        description: `${selectedLeads.length} member(s) have been added to the group.`,
        variant: 'success',
      })
      setSelectedLeads([])
      setShowAddMembers(false)
      onRefresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add members',
        variant: 'error',
      })
    } finally {
      setIsAddingMembers(false)
    }
  }

  const handleRemoveMember = async (leadId: string) => {
    if (!group) return
    setRemovingMemberId(leadId)
    try {
      const response = await fetch(`/api/groups/${group.id}/members?leadId=${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to remove member')
      }

      toast({
        title: 'Member removed',
        description: 'The member has been removed from the group.',
        variant: 'success',
      })
      onRefresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'error',
      })
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (!group) return null

  return (
    <>
      <Dialog open={!!group} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{group.name}</DialogTitle>
              <Badge variant="neutral">{group.members?.length || 0} members</Badge>
            </div>
            <DialogDescription>
              Manage the leads in this contact group
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {group.members?.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.lead?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{member.lead?.email || '-'}</TableCell>
                        <TableCell>{member.lead?.company || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveMember(member.lead?.id)}
                            disabled={removingMemberId === member.lead?.id}
                          >
                            {removingMemberId === member.lead?.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 text-neutral-400 hover:text-error-500" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No members in this group yet
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => onEdit(group)}>
              <Pencil className="h-4 w-4" />
              Edit Name
            </Button>
            <Button variant="outline" onClick={() => setShowAddMembers(true)}>
              <UserPlus className="h-4 w-4" />
              Add Members
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              <Trash2 className="h-4 w-4" />
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={showAddMembers} onOpenChange={setShowAddMembers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
            <DialogDescription>
              Select leads to add to this group
            </DialogDescription>
          </DialogHeader>

          {isLoadingLeads ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : availableLeads.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No available leads to add
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {availableLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50/50"
                >
                  <Checkbox
                    id={lead.id}
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLeads([...selectedLeads, lead.id])
                      } else {
                        setSelectedLeads(selectedLeads.filter((id) => id !== lead.id))
                      }
                    }}
                  />
                  <Label htmlFor={lead.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-neutral-500">{lead.email}</div>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMembers(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              loading={isAddingMembers}
              disabled={selectedLeads.length === 0}
            >
              Add {selectedLeads.length} Member{selectedLeads.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
