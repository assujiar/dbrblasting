'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn, sanitizeHtml } from '@/lib/utils'
import {
  DEFAULT_TEMPLATES,
  getCategories,
  type DefaultTemplate,
} from '@/lib/email/default-templates'
import {
  Search,
  Mail,
  Newspaper,
  Megaphone,
  Bell,
  MessageSquare,
  Calendar,
  Receipt,
  LayoutGrid,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react'

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: DefaultTemplate) => void
}

const CATEGORY_ICONS: Record<DefaultTemplate['category'], React.ElementType> = {
  welcome: Mail,
  newsletter: Newspaper,
  promotion: Megaphone,
  announcement: Bell,
  'follow-up': MessageSquare,
  event: Calendar,
  transactional: Receipt,
}

export function TemplateGallery({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DefaultTemplate['category'] | 'all'>('all')
  const [previewTemplate, setPreviewTemplate] = useState<DefaultTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<DefaultTemplate | null>(null)

  const categories = useMemo(() => getCategories(), [])

  const filteredTemplates = useMemo(() => {
    let templates = DEFAULT_TEMPLATES

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter((t) => t.category === selectedCategory)
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      )
    }

    return templates
  }, [selectedCategory, search])

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onOpenChange(false)
      setSelectedTemplate(null)
      setSearch('')
      setSelectedCategory('all')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              Choose a Template
            </DialogTitle>
            <DialogDescription>
              Select from our professionally designed templates to get started quickly.
              You can customize any template after selecting it.
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                All ({DEFAULT_TEMPLATES.length})
              </button>
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.id]
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {category.label} ({category.count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-auto py-2">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No templates found</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      'group cursor-pointer overflow-hidden transition-all hover:shadow-lg',
                      selectedTemplate?.id === template.id &&
                        'ring-2 ring-primary-500 shadow-lg'
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Thumbnail Preview */}
                    <div
                      className="h-36 relative overflow-hidden"
                      style={{ background: template.thumbnail }}
                    >
                      {/* Mini Preview */}
                      <div className="absolute inset-2 bg-white rounded-md shadow-lg overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
                        <iframe
                          srcDoc={sanitizeHtml(template.html_body)}
                          className="w-[300%] h-[300%] border-0 pointer-events-none"
                          style={{ transform: 'scale(0.33)', transformOrigin: 'top left' }}
                          title={template.name}
                        />
                      </div>

                      {/* Selection indicator */}
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      {/* Preview button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewTemplate(template)
                        }}
                        className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-md shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="h-4 w-4 text-neutral-700" />
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-neutral-900 text-sm">
                            {template.name}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {(() => {
                            const Icon = CATEGORY_ICONS[template.category]
                            return <Icon className="h-3 w-3" />
                          })()}
                          {template.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-neutral-500">
                {selectedTemplate
                  ? `Selected: ${selectedTemplate.name}`
                  : 'Click on a template to select it'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedTemplate}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-neutral-100">
            {previewTemplate && (
              <iframe
                srcDoc={sanitizeHtml(previewTemplate.html_body)}
                className="w-full h-[600px] border-0 bg-white"
                title={previewTemplate.name}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewTemplate) {
                  setSelectedTemplate(previewTemplate)
                  setPreviewTemplate(null)
                }
              }}
            >
              Select This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
