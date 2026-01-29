'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Users, FolderKanban, Send, Loader2 } from 'lucide-react'
import type { EmailTemplate, Lead, ContactGroup } from '@/types/database'

interface GroupWithMembers extends ContactGroup {
  members: { id: string; lead: Lead }[]
}

interface SendDialogProps {
  template: EmailTemplate | null
  onClose: () => void
}

export function SendDialog({ template, onClose }: SendDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [leadsRes, groupsRes] = await Promise.all([
        fetch('/api/leads?limit=1000'),
        fetch('/api/groups'),
      ])

      const [leadsData, groupsData] = await Promise.all([
        leadsRes.json(),
        groupsRes.json(),
      ])

      if (leadsRes.ok) setLeads(leadsData.data)
      if (groupsRes.ok) setGroups(groupsData.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (template) {
      fetchData()
      setSelectedLeads([])
      setSelectedGroups([])
    }
  }, [template, fetchData])

  // Calculate unique recipients
  const getUniqueRecipients = () => {
    const recipientMap = new Map<string, { name: string; email: string }>()

    // Add selected leads
    selectedLeads.forEach((leadId) => {
      const lead = leads.find((l) => l.id === leadId)
      if (lead) {
        recipientMap.set(lead.email.toLowerCase(), { name: lead.name, email: lead.email })
      }
    })

    // Add leads from selected groups
    selectedGroups.forEach((groupId) => {
      const group = groups.find((g) => g.id === groupId)
      if (group?.members) {
        group.members.forEach((member) => {
          if (member.lead) {
            recipientMap.set(member.lead.email.toLowerCase(), {
              name: member.lead.name,
              email: member.lead.email,
            })
          }
        })
      }
    })

    return Array.from(recipientMap.values())
  }

  const uniqueRecipients = getUniqueRecipients()

  const handleSend = async () => {
    if (uniqueRecipients.length === 0) {
      toast({
        title: 'No recipients selected',
        description: 'Please select at least one lead or group.',
        variant: 'error',
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template?.id,
          leadIds: selectedLeads,
          groupIds: selectedGroups,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create campaign')
      }

      toast({
        title: 'Campaign started',
        description: `Sending emails to ${uniqueRecipients.length} recipients.`,
        variant: 'success',
      })

      onClose()
      router.push(`/app/campaigns?id=${result.data.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send emails',
        variant: 'error',
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!template) return null

  return (
    <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Email Campaign</DialogTitle>
          <DialogDescription>
            Select recipients for &quot;{template.name}&quot;
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="leads" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="leads">
                  <Users className="h-4 w-4 mr-2" />
                  Select Leads ({selectedLeads.length})
                </TabsTrigger>
                <TabsTrigger value="groups">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Select Groups ({selectedGroups.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="flex-1 overflow-auto mt-4">
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No leads available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50/50"
                      >
                        <Checkbox
                          id={`lead-${lead.id}`}
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads([...selectedLeads, lead.id])
                            } else {
                              setSelectedLeads(selectedLeads.filter((id) => id !== lead.id))
                            }
                          }}
                        />
                        <Label htmlFor={`lead-${lead.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-neutral-500">{lead.email}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="groups" className="flex-1 overflow-auto mt-4">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No groups available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50/50"
                      >
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGroups([...selectedGroups, group.id])
                            } else {
                              setSelectedGroups(selectedGroups.filter((id) => id !== group.id))
                            }
                          }}
                        />
                        <Label htmlFor={`group-${group.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-neutral-500">
                            {group.members?.length || 0} members
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-neutral-600">Recipients (deduplicated):</span>
                <Badge variant={uniqueRecipients.length > 0 ? 'default' : 'outline'}>
                  {uniqueRecipients.length} recipients
                </Badge>
              </div>

              {uniqueRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                  {uniqueRecipients.slice(0, 10).map((r) => (
                    <Badge key={r.email} variant="outline" className="text-xs">
                      {r.name}
                    </Badge>
                  ))}
                  {uniqueRecipients.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{uniqueRecipients.length - 10} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            loading={isSending}
            disabled={uniqueRecipients.length === 0 || isLoading}
          >
            <Send className="h-4 w-4" />
            Send to {uniqueRecipients.length} Recipients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
