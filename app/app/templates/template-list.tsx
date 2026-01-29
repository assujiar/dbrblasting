"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Tabs, StyledTabsList, StyledTabsTrigger, StyledTabsContent } from '@/components/ui/tabs'
import { createTemplate, updateTemplate, deleteTemplate } from './actions'
import { Edit, Trash, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Template {
  id: string
  name: string
  subject: string
  html_body: string
}
interface Lead {
  id: string
  name: string
  email: string
}
interface Group {
  id: string
  name: string
}
interface Membership {
  id: string
  group_id: string
  lead_id: string
  leads: Lead
}

export default function TemplateList({ templates, leads, groups, memberships }: { templates: Template[]; leads: Lead[]; groups: Group[]; memberships: Membership[] }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form, setForm] = useState({ name: '', subject: '', html_body: '' })
  const [openSend, setOpenSend] = useState(false)
  const [sendTemplate, setSendTemplate] = useState<Template | null>(null)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  const groupMembers = (groupId: string) => memberships.filter((m) => m.group_id === groupId)

  function openCreate() {
    setEditing(null)
    setForm({ name: '', subject: '', html_body: '' })
    setOpenEdit(true)
  }
  function openEditTemplate(template: Template) {
    setEditing(template)
    setForm({ name: template.name, subject: template.subject, html_body: template.html_body })
    setOpenEdit(true)
  }
  async function handleDelete(id: string) {
    const promise = deleteTemplate(id)
    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Template deleted',
      error: (err) => err.message,
    })
    await promise
  }
  async function handleSend() {
    if (!sendTemplate) return
    // collect unique lead ids from selected leads and group members
    const leadIdsFromGroups = selectedGroupIds
      .flatMap((gid) => groupMembers(gid).map((m) => m.lead_id))
    const dedupLeadIds = Array.from(new Set([...selectedLeadIds, ...leadIdsFromGroups]))
    if (dedupLeadIds.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }
    const res = await fetch('/api/campaign/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: sendTemplate.id, leadIds: dedupLeadIds }),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Failed to start campaign')
      return
    }
    toast.success('Campaign started')
    // reset
    setOpenSend(false)
    setSelectedLeadIds([])
    setSelectedGroupIds([])
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Templates</h2>
        <Button onClick={openCreate}>New Template</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Subject</TableCell>
            <TableCell header className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>{template.subject}</TableCell>
              <TableCell className="text-right flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEditTemplate(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setSendTemplate(template); setOpenSend(true) }}>
                  <Send className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Create/Edit modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              try {
                if (editing) {
                  await updateTemplate(editing.id, formData)
                  toast.success('Template updated')
                } else {
                  await createTemplate(formData)
                  toast.success('Template created')
                }
                setOpenEdit(false)
              } catch (e: any) {
                toast.error(e.message)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" name="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input id="subject" name="subject" required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label htmlFor="html_body" className="text-sm font-medium">HTML Body</label>
              <textarea
                id="html_body"
                name="html_body"
                required
                value={form.html_body}
                onChange={(e) => setForm((f) => ({ ...f, html_body: e.target.value }))}
                className="w-full h-40 rounded-md border border-border bg-white/50 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-gray-500">Use placeholders like {{name}}, {{company}}, {{email}} and {{phone}}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpenEdit(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Send modal */}
      <Dialog open={openSend} onOpenChange={setOpenSend}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Template – {sendTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="leads">
              <StyledTabsList>
                <StyledTabsTrigger value="leads">Leads</StyledTabsTrigger>
                <StyledTabsTrigger value="groups">Groups</StyledTabsTrigger>
              </StyledTabsList>
              <StyledTabsContent value="leads">
                <ul className="max-h-64 overflow-y-auto space-y-2">
                  {leads.map((lead) => (
                    <li key={lead.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-accent"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds((ids) => [...ids, lead.id])
                          } else {
                            setSelectedLeadIds((ids) => ids.filter((id) => id !== lead.id))
                          }
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </StyledTabsContent>
              <StyledTabsContent value="groups">
                <ul className="max-h-64 overflow-y-auto space-y-2">
                  {groups.map((group) => (
                    <li key={group.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-gray-500">{groupMembers(group.id).length} members</p>
                      </div>
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-accent"
                        checked={selectedGroupIds.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroupIds((ids) => [...ids, group.id])
                          } else {
                            setSelectedGroupIds((ids) => ids.filter((id) => id !== group.id))
                          }
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </StyledTabsContent>
            </Tabs>
            <div>
              <p className="text-sm">
                Total selected recipients: {Array.from(new Set([...selectedLeadIds, ...selectedGroupIds.flatMap((gid) => groupMembers(gid).map((m) => m.lead_id))])).length}
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenSend(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend}>Send Email</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}