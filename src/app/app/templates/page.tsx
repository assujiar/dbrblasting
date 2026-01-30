'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SendDialog } from '@/components/templates/send-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Plus, FileText, MoreHorizontal, Pencil, Trash2, Send, Loader2, Eye, Sparkles } from 'lucide-react'
import { formatDateShort, truncate, cn } from '@/lib/utils'
import type { EmailTemplate } from '@/types/database'

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sendTemplate, setSendTemplate] = useState<EmailTemplate | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/templates')
      const result = await response.json()

      if (response.ok) {
        setTemplates(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/templates/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete template')
      }

      toast({
        title: 'Template deleted',
        description: 'The template has been successfully deleted.',
        variant: 'success',
      })
      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete template',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Email Templates</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create and manage your email templates
          </p>
        </div>
        <Link href="/app/templates/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading templates...</p>
            </div>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={FileText}
              title="No templates yet"
              description="Create email templates to start sending campaigns"
              action={
                <Link href="/app/templates/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Create Your First Template
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                'overflow-hidden cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-1',
                'bg-gradient-to-br from-white to-neutral-50/50'
              )}
              onClick={() => router.push(`/app/templates/${template.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{template.name}</CardTitle>
                      <CardDescription className="truncate mt-0.5 text-xs">
                        {template.subject}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/app/templates/${template.id}`)
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/app/templates/${template.id}/edit`)
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setSendTemplate(template)
                      }}>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(template.id)
                        }}
                        className="text-error-600 focus:text-error-600 focus:bg-error-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-neutral-500 line-clamp-2 mb-4">
                  {truncate(template.html_body.replace(/<[^>]*>/g, ''), 100)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">
                    {formatDateShort(template.created_at)}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSendTemplate(template)
                    }}
                    className="shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Dialog */}
      <SendDialog
        template={sendTemplate}
        onClose={() => setSendTemplate(null)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
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
    </div>
  )
}
