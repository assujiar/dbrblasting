'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LeadForm } from '@/components/leads/lead-form'
import { LeadTable } from '@/components/leads/lead-table'
import { Plus, Search, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { Lead } from '@/types/database'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LeadsPage() {
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

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingLead(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
          <p className="text-neutral-500 mt-1">
            Manage your contact database
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-neutral-500">
              {pagination.total} {pagination.total === 1 ? 'lead' : 'leads'} total
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Users}
              title={search ? 'No leads found' : 'No leads yet'}
              description={
                search
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first lead'
              }
              action={
                !search && (
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Your First Lead
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <LeadTable
            leads={leads}
            onEdit={handleEdit}
            onRefresh={fetchLeads}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} leads
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.page) <= 1
                        )
                        .map((page, index, array) => (
                          <span key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-neutral-400">...</span>
                            )}
                            <Button
                              variant={pagination.page === page ? 'default' : 'ghost'}
                              size="icon-sm"
                              onClick={() =>
                                setPagination((prev) => ({ ...prev, page }))
                              }
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
                      Next
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
    </div>
  )
}
