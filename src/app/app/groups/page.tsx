'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { GroupForm } from '@/components/groups/group-form'
import { GroupDetail } from '@/components/groups/group-detail'
import { Plus, FolderKanban, Users, Loader2 } from 'lucide-react'
import type { ContactGroup, Lead } from '@/types/database'

interface GroupWithMembers extends ContactGroup {
  members: { id: string; lead: Lead }[]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null)

  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/groups')
      const result = await response.json()

      if (response.ok) {
        setGroups(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleEdit = (group: ContactGroup) => {
    setEditingGroup(group)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingGroup(null)
  }

  const handleGroupClick = (group: GroupWithMembers) => {
    setSelectedGroup(group)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contact Groups</h1>
          <p className="text-neutral-500 mt-1">
            Organize your leads into targeted groups
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          New Group
        </Button>
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
      ) : groups.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FolderKanban}
              title="No groups yet"
              description="Create groups to organize your leads for targeted campaigns"
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Your First Group
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => handleGroupClick(group)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge variant="neutral">
                    <Users className="h-3 w-3 mr-1" />
                    {group.members?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-neutral-500">
                  {group.members?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {group.members.slice(0, 3).map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.lead?.name || 'Unknown'}
                        </Badge>
                      ))}
                      {group.members.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.members.length - 3} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-400">No members yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Group Form Dialog */}
      <GroupForm
        open={formOpen}
        onOpenChange={handleFormClose}
        group={editingGroup}
        onSuccess={fetchGroups}
      />

      {/* Group Detail Dialog */}
      <GroupDetail
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onEdit={handleEdit}
        onRefresh={fetchGroups}
      />
    </div>
  )
}
