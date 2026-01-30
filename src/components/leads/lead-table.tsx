'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Building2, Eye, ChevronRight } from 'lucide-react'
import { formatDateShort, cn } from '@/lib/utils'
import type { Lead } from '@/types/database'

interface LeadTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onViewDetail?: (lead: Lead) => void
  onRefresh: () => void
}

export function LeadTable({ leads, onEdit, onViewDetail, onRefresh }: LeadTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/leads/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete lead')
      }

      toast({
        title: 'Lead deleted',
        description: 'The lead has been successfully deleted.',
        variant: 'success',
      })
      onRefresh()
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete lead',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              'bg-gradient-to-br from-white to-neutral-50/50'
            )}
            onClick={() => onViewDetail?.(lead)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-neutral-900 truncate">{lead.name}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.company && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{lead.company}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-2">{formatDateShort(lead.created_at)}</p>
              </div>
              <div className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-neutral-300" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onViewDetail?.(lead)
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onEdit(lead)
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(lead.id)
                      }}
                      className="text-error-600 focus:text-error-600 focus:bg-error-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => onViewDetail?.(lead)}
                >
                  <TableCell className="font-medium text-neutral-900">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                      {lead.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.company ? (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                        {lead.company}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.phone ? (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                        {lead.phone}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {formatDateShort(lead.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onViewDetail?.(lead)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onEdit(lead)
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(lead.id)
                          }}
                          className="text-error-600 focus:text-error-600 focus:bg-error-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
