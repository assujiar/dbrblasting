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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Filter,
} from 'lucide-react'

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: DefaultTemplate) => void
}

const CATEGORY_ICONS: Record<DefaultTemplate['category'] | 'all', React.ElementType> = {
  all: LayoutGrid,
  welcome: Mail,
  newsletter: Newspaper,
  promotion: Megaphone,
  announcement: Bell,
  'follow-up': MessageSquare,
  event: Calendar,
  transactional: Receipt,
}

const CATEGORY_LABELS: Record<DefaultTemplate['category'] | 'all', string> = {
  all: 'All Templates',
  welcome: 'Welcome',
  newsletter: 'Newsletter',
  promotion: 'Promotion',
  announcement: 'Announcement',
  'follow-up': 'Follow-up',
  event: 'Event',
  transactional: 'Transactional',
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

  const SelectedIcon = CATEGORY_ICONS[selectedCategory]

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary-500 flex-shrink-0" />
              <span className="truncate">Choose a Template</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Select a template to get started. You can customize it after selecting.
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filters - Mobile Optimized */}
          <div className="flex flex-col gap-3 py-3">
            {/* Search and Category Filter Row */}
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Category Dropdown - Always visible */}
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as DefaultTemplate['category'] | 'all')}
              >
                <SelectTrigger className="w-auto min-w-[140px] sm:min-w-[180px] h-9">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                    <SelectValue>
                      <span className="flex items-center gap-1.5">
                        <SelectedIcon className="h-3.5 w-3.5" />
                        <span className="truncate">{CATEGORY_LABELS[selectedCategory]}</span>
                      </span>
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      All Templates ({DEFAULT_TEMPLATES.length})
                    </span>
                  </SelectItem>
                  {categories.map((category) => {
                    const Icon = CATEGORY_ICONS[category.id]
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label} ({category.count})
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-xs text-neutral-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-auto py-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-neutral-300 mb-3" />
                <h3 className="text-base font-medium text-neutral-700">No templates found</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                      className="h-28 sm:h-36 relative overflow-hidden"
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
                        <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}

                      {/* Preview button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewTemplate(template)
                        }}
                        className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-md shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-700" />
                      </button>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900 text-sm truncate">
                          {template.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {(() => {
                            const Icon = CATEGORY_ICONS[template.category]
                            return <Icon className="h-3 w-3 flex-shrink-0" />
                          })()}
                          <span className="truncate">{template.category}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Mobile Optimized */}
          <DialogFooter className="border-t pt-3 sm:pt-4 flex-col-reverse sm:flex-row gap-2">
            <p className="text-xs text-neutral-500 text-center sm:text-left sm:flex-1 truncate">
              {selectedTemplate
                ? `Selected: ${selectedTemplate.name}`
                : 'Tap a template to select'}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-initial"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedTemplate}
                className="flex-1 sm:flex-initial"
                size="sm"
              >
                Use Template
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Preview Dialog - Mobile Optimized */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg truncate">{previewTemplate?.name}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm line-clamp-2">{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-neutral-100 min-h-[300px]">
            {previewTemplate && (
              <iframe
                srcDoc={sanitizeHtml(previewTemplate.html_body)}
                className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border-0 bg-white"
                title={previewTemplate.name}
              />
            )}
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewTemplate(null)}
              className="w-full sm:w-auto"
              size="sm"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewTemplate) {
                  setSelectedTemplate(previewTemplate)
                  setPreviewTemplate(null)
                }
              }}
              className="w-full sm:w-auto"
              size="sm"
            >
              Select Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
