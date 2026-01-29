"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { createLead, updateLead, deleteLead } from './actions'
import { Edit, Trash } from 'lucide-react'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
}

export default function LeadList({ leads }: { leads: Lead[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', company: '', email: '', phone: '' })
    setOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditing(lead)
    setForm({
      name: lead.name,
      company: lead.company ?? '',
      email: lead.email,
      phone: lead.phone ?? '',
    })
    setOpen(true)
  }

  async function handleDelete(id: string) {
    const deletePromise = deleteLead(id)
    toast.promise(deletePromise, {
      loading: 'Deleting...',
      success: 'Lead deleted',
      error: (err) => err.message,
    })
    await deletePromise
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Leads</h2>
        <Button onClick={openCreate}>New Lead</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Company</TableCell>
            <TableCell header>Email</TableCell>
            <TableCell header>Phone</TableCell>
            <TableCell header className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell className="text-right flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for create/edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lead' : 'New Lead'}</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              try {
                if (editing) {
                  await updateLead(editing.id, formData)
                  toast.success('Lead updated')
                } else {
                  await createLead(formData)
                  toast.success('Lead created')
                }
                setOpen(false)
              } catch (e: any) {
                toast.error(e.message)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Name</label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company">Company</label>
              <Input
                id="company"
                name="company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone</label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}