'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { GroupForm } from '@/components/groups/group-form'
import { Plus, FolderOpen, Users, Loader2, ChevronRight, Building2, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContactGroup, Lead } from '@/types/database'

interface GroupWithMembers extends ContactGroup {
  members: { id: string; lead: Lead }[]
}

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)

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

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingGroup(null)
  }

  // Calculate stats
  const stats = {
    totalGroups: groups.length,
    totalMembers: groups.reduce((acc, g) => acc + (g.members?.length || 0), 0),
    avgMembers: groups.length > 0 ? Math.round(groups.reduce((acc, g) => acc + (g.members?.length || 0), 0) / groups.length) : 0,
    companies: new Set(groups.flatMap(g => g.members?.map(m => m.lead?.company).filter(Boolean) || [])).size,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contact Groups</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Organize your leads into targeted groups
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* Stats Cards */}
      {groups.length > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '25ms' }}>
          <Card className="bg-gradient-to-br from-primary-50/50 to-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-100">
                  <FolderOpen className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalGroups}</p>
                  <p className="text-xs text-neutral-500">Total Groups</p>
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
                  <p className="text-2xl font-bold text-accent-600">{stats.totalMembers}</p>
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
                  <p className="text-2xl font-bold text-success-600">{stats.avgMembers}</p>
                  <p className="text-xs text-neutral-500">Avg Members/Group</p>
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
                  <p className="text-2xl font-bold text-secondary-600">{stats.companies}</p>
                  <p className="text-xs text-neutral-500">Unique Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading groups...</p>
            </div>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={FolderOpen}
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-1',
                'bg-gradient-to-br from-white to-neutral-50/50'
              )}
              onClick={() => router.push(`/app/groups/${group.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50">
                      <FolderOpen className="h-5 w-5 text-primary-600" />
                    </div>
                    <CardTitle className="text-base truncate">{group.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">
                      <Users className="h-3 w-3 mr-1" />
                      {group.members?.length || 0}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-neutral-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-neutral-500">
                  {group.members?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {group.members.slice(0, 3).map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.lead?.name || 'Unknown'}
                        </Badge>
                      ))}
                      {group.members.length > 3 && (
                        <Badge variant="neutral" className="text-xs">
                          +{group.members.length - 3} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs">No members yet</span>
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
    </div>
  )
}
