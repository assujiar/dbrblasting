'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LeadForm } from '@/components/leads/lead-form'
import { ImportDialog } from '@/components/leads/import-dialog'
import { LeadTable } from '@/components/leads/lead-table'
import { Plus, Search, Users, ChevronLeft, ChevronRight, Loader2, Upload, FileSpreadsheet, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/database'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.set('search', search)

      const response = await fetch(`/api/leads?${params}`)
      const result = await response.json()

      if (response.ok) {
        setLeads(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, search])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormOpen(true)
  }

  const handleViewDetail = (lead: Lead) => {
    router.push(`/app/leads/${lead.id}`)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingLead(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your contact database
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50">
                <Users className="h-4 w-4 text-primary-600" />
                <span className="font-semibold text-primary-700">{pagination.total}</span>
              </div>
              <span>{pagination.total === 1 ? 'lead' : 'leads'} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Import Tip */}
      {leads.length === 0 && !isLoading && !search && (
        <Card className="animate-slide-up bg-gradient-to-br from-accent-50/50 to-primary-50/50 border-accent-200/50" style={{ animationDelay: '75ms' }}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                <FileSpreadsheet className="h-6 w-6 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-500" />
                  Quick Import Available
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Import leads from Excel file. Download template, fill in data, and upload.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading leads...</p>
            </div>
          </CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={Users}
              title={search ? 'No leads found' : 'No leads yet'}
              description={
                search
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first lead or importing from Excel'
              }
              action={
                !search && (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button variant="outline" onClick={() => setImportOpen(true)}>
                      <Upload className="h-4 w-4" />
                      Import from Excel
                    </Button>
                    <Button onClick={() => setFormOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add Manually
                    </Button>
                  </div>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <LeadTable
              leads={leads}
              onEdit={handleEdit}
              onViewDetail={handleViewDetail}
              onRefresh={fetchLeads}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-neutral-500 text-center sm:text-left">
                    Showing{' '}
                    <span className="font-medium text-neutral-700">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-neutral-700">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-neutral-700">{pagination.total}</span>
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.page) <= 1
                        )
                        .slice(0, 5)
                        .map((page, index, array) => (
                          <span key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-1 sm:px-2 text-neutral-400">...</span>
                            )}
                            <Button
                              variant={pagination.page === page ? 'default' : 'ghost'}
                              size="icon-sm"
                              onClick={() =>
                                setPagination((prev) => ({ ...prev, page }))
                              }
                              className={cn(
                                pagination.page === page && 'shadow-sm'
                              )}
                            >
                              {page}
                            </Button>
                          </span>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Lead Form Dialog */}
      <LeadForm
        open={formOpen}
        onOpenChange={handleFormClose}
        lead={editingLead}
        onSuccess={fetchLeads}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={fetchLeads}
      />
    </div>
  )
}
