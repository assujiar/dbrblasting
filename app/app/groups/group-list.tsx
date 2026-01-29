"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Plus, Trash, Users, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createGroup, deleteGroup, addLeadToGroup, removeLeadFromGroup } from './actions'

interface Group {
  id: string
  name: string
}
interface Lead {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
}
interface Membership {
  id: string
  group_id: string
  lead_id: string
  leads: Lead
}

export default function GroupList({ groups, leads, memberships }: { groups: Group[]; leads: Lead[]; memberships: Membership[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [groupName, setGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const groupMembers = (groupId: string) => memberships.filter((m) => m.group_id === groupId)

  function openCreate() {
    setEditing(null)
    setGroupName('')
    setOpen(true)
  }

  async function handleDelete(id: string) {
    const promise = deleteGroup(id)
    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Group deleted',
      error: (err) => err.message,
    })
    await promise
  }

  async function handleAddLead(groupId: string, leadId: string) {
    const promise = addLeadToGroup(groupId, leadId)
    toast.promise(promise, {
      loading: 'Adding...',
      success: 'Lead added',
      error: (err) => err.message,
    })
    await promise
  }

  async function handleRemoveMember(memberId: string) {
    const promise = removeLeadFromGroup(memberId)
    toast.promise(promise, {
      loading: 'Removing...',
      success: 'Removed',
      error: (err) => err.message,
    })
    await promise
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Groups</h2>
        <Button onClick={openCreate}>New Group</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Members</TableCell>
            <TableCell header className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell>{group.name}</TableCell>
              <TableCell>{groupMembers(group.id).length}</TableCell>
              <TableCell className="text-right flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(group)}>
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create group modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Group</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              try {
                await createGroup(formData)
                toast.success('Group created')
                setOpen(false)
              } catch (e: any) {
                toast.error(e.message)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Group Name
              </label>
              <Input id="name" name="name" required value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage group members modal */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        {selectedGroup && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Members – {selectedGroup.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current members */}
              <div>
                <h3 className="font-medium mb-2">Current Members</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {groupMembers(selectedGroup.id).map((m) => (
                    <li key={m.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                      <div>
                        <p className="font-medium">{m.leads.name}</p>
                        <p className="text-sm text-gray-500">{m.leads.email}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.id)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  {groupMembers(selectedGroup.id).length === 0 && <p className="text-sm text-gray-500">No members</p>}
                </ul>
              </div>
              {/* Available leads to add */}
              <div>
                <h3 className="font-medium mb-2">Add Lead</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {leads
                    .filter((lead) => !groupMembers(selectedGroup.id).find((m) => m.lead_id === lead.id))
                    .map((lead) => (
                      <li key={lead.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleAddLead(selectedGroup.id, lead.id)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  {leads.filter((lead) => !groupMembers(selectedGroup.id).find((m) => m.lead_id === lead.id)).length === 0 && <p className="text-sm text-gray-500">No available leads</p>}
                </ul>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="secondary" onClick={() => setSelectedGroup(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}