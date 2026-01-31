'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, sanitizeHtml } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Type,
  Palette,
  Code,
  Eye,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Quote,
  ArrowLeftRight,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

type EditorMode = 'code' | 'visual' | 'split'

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'X-Large', value: '24px' },
  { label: 'XX-Large', value: '32px' },
]

const TEXT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Gray', value: '#4a5568' },
  { label: 'Gray', value: '#718096' },
  { label: 'Red', value: '#e53e3e' },
  { label: 'Orange', value: '#ed8936' },
  { label: 'Yellow', value: '#ecc94b' },
  { label: 'Green', value: '#48bb78' },
  { label: 'Teal', value: '#38b2ac' },
  { label: 'Blue', value: '#4299e1' },
  { label: 'Indigo', value: '#667eea' },
  { label: 'Purple', value: '#9f7aea' },
  { label: 'Pink', value: '#ed64a6' },
]

const BG_COLORS = [
  { label: 'None', value: 'transparent' },
  { label: 'White', value: '#ffffff' },
  { label: 'Light Gray', value: '#f7fafc' },
  { label: 'Yellow', value: '#fefcbf' },
  { label: 'Green', value: '#c6f6d5' },
  { label: 'Blue', value: '#bee3f8' },
  { label: 'Purple', value: '#e9d8fd' },
  { label: 'Pink', value: '#fed7e2' },
]

const MODE_ICONS = {
  code: Code,
  visual: Eye,
  split: ArrowLeftRight,
}

const MODE_LABELS = {
  code: 'HTML',
  visual: 'Visual',
  split: 'Split',
}

export function EmailEditor({
  value,
  onChange,
  placeholder = 'Start writing your email...',
  height = 500,
}: EmailEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const visualEditorRef = useRef<HTMLDivElement>(null)
  const [isVisualFocused, setIsVisualFocused] = useState(false)
  const isInternalChange = useRef(false)

  // Responsive height
  const mobileHeight = Math.min(height, 350)

  // Save and restore cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange()
    }
    return null
  }, [])

  const restoreCursorPosition = useCallback((range: Range | null) => {
    if (range) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [])

  // Sync visual editor content when value changes externally (not from visual editor)
  useEffect(() => {
    if (visualEditorRef.current && !isVisualFocused && !isInternalChange.current) {
      const currentContent = visualEditorRef.current.innerHTML
      if (currentContent !== value) {
        visualEditorRef.current.innerHTML = value || ''
      }
    }
    isInternalChange.current = false
  }, [value, isVisualFocused])

  // Initialize visual editor content on mount
  useEffect(() => {
    if (visualEditorRef.current && value) {
      visualEditorRef.current.innerHTML = value
    }
  }, [])

  // Execute command for visual editor
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Sync to HTML after command
    if (visualEditorRef.current) {
      onChange(visualEditorRef.current.innerHTML)
    }
  }, [onChange])

  // Handle visual editor input
  const handleVisualInput = useCallback(() => {
    if (visualEditorRef.current) {
      isInternalChange.current = true
      onChange(visualEditorRef.current.innerHTML)
    }
  }, [onChange])

  // Handle code editor change
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  // Insert link
  const handleInsertLink = useCallback(() => {
    if (linkUrl) {
      const text = linkText || linkUrl
      execCommand('insertHTML', `<a href="${linkUrl}" style="color: #4299e1; text-decoration: underline;">${text}</a>`)
    }
    setLinkDialogOpen(false)
    setLinkUrl('')
    setLinkText('')
  }, [linkUrl, linkText, execCommand])

  // Insert image
  const handleInsertImage = useCallback(() => {
    if (imageUrl) {
      execCommand('insertHTML', `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`)
    }
    setImageDialogOpen(false)
    setImageUrl('')
    setImageAlt('')
  }, [imageUrl, imageAlt, execCommand])

  // Insert heading
  const insertHeading = useCallback((level: number) => {
    execCommand('formatBlock', `h${level}`)
  }, [execCommand])

  // Insert horizontal rule
  const insertHR = useCallback(() => {
    execCommand('insertHTML', '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />')
  }, [execCommand])

  // Insert blockquote
  const insertQuote = useCallback(() => {
    execCommand('formatBlock', 'blockquote')
  }, [execCommand])

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    icon: Icon,
    tooltip,
    active = false,
    className = '',
  }: {
    onClick: () => void
    icon: React.ElementType
    tooltip: string
    active?: boolean
    className?: string
  }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'p-1.5 sm:p-2 rounded-md hover:bg-neutral-100 transition-colors flex-shrink-0',
              active && 'bg-neutral-100 text-primary-600',
              className
            )}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Divider component - hidden on mobile
  const Divider = () => (
    <div className="hidden sm:block w-px h-5 sm:h-6 bg-neutral-200 mx-0.5 sm:mx-1 flex-shrink-0" />
  )

  const ModeIcon = MODE_ICONS[mode]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mode Selector - Mobile Optimized */}
      <div className="flex items-center justify-between gap-2">
        {/* Desktop Mode Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('code')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'code'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Code className="h-4 w-4" />
            Raw HTML
          </button>
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'visual'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Eye className="h-4 w-4" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'split'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Split
          </button>
        </div>

        {/* Mobile Mode Dropdown */}
        <div className="sm:hidden flex-1">
          <Select value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <ModeIcon className="h-4 w-4" />
                  {MODE_LABELS[mode]} Mode
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Visual Editor
                </span>
              </SelectItem>
              <SelectItem value="code">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Raw HTML
                </span>
              </SelectItem>
              <SelectItem value="split">
                <span className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Split View
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visual Editor Toolbar - Mobile Optimized */}
      {(mode === 'visual' || mode === 'split') && (
        <div className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 bg-neutral-50 border border-neutral-200 rounded-lg overflow-x-auto">
          {/* Undo/Redo */}
          <ToolbarButton onClick={() => execCommand('undo')} icon={Undo2} tooltip="Undo" />
          <ToolbarButton onClick={() => execCommand('redo')} icon={Redo2} tooltip="Redo" />

          <Divider />

          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-md hover:bg-neutral-100 text-sm flex-shrink-0">
                <Type className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => insertHeading(1)}>
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(2)}>
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(3)}>
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => execCommand('formatBlock', 'p')}>
                <Type className="h-4 w-4 mr-2" /> Paragraph
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Basic Formatting */}
          <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} tooltip="Bold" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} tooltip="Italic" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} tooltip="Underline" />

          <Divider />

          {/* Text Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-md hover:bg-neutral-100 flex-shrink-0">
                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Text Color</DropdownMenuLabel>
              <div className="grid grid-cols-6 gap-1 p-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => execCommand('foreColor', color.value)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-neutral-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Background</DropdownMenuLabel>
              <div className="grid grid-cols-4 gap-1 p-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => execCommand('hiliteColor', color.value)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-neutral-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Alignment - Hidden on very small screens, in dropdown */}
          <div className="hidden xs:flex items-center">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} tooltip="Left" />
            <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} tooltip="Center" />
            <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} tooltip="Right" />
          </div>

          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} tooltip="Bullet List" />
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} tooltip="Number List" />

          <Divider />

          {/* Insert - Some hidden on mobile in dropdown */}
          <ToolbarButton onClick={() => setLinkDialogOpen(true)} icon={LinkIcon} tooltip="Insert Link" />
          <ToolbarButton onClick={() => setImageDialogOpen(true)} icon={Image} tooltip="Insert Image" className="hidden sm:flex" />

          {/* More options dropdown for mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex sm:hidden items-center p-1.5 rounded-md hover:bg-neutral-100 flex-shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => execCommand('justifyLeft')}>
                <AlignLeft className="h-4 w-4 mr-2" /> Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand('justifyCenter')}>
                <AlignCenter className="h-4 w-4 mr-2" /> Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand('justifyRight')}>
                <AlignRight className="h-4 w-4 mr-2" /> Align Right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                <Image className="h-4 w-4 mr-2" /> Insert Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={insertHR}>
                <Minus className="h-4 w-4 mr-2" /> Horizontal Line
              </DropdownMenuItem>
              <DropdownMenuItem onClick={insertQuote}>
                <Quote className="h-4 w-4 mr-2" /> Block Quote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop only insert buttons */}
          <div className="hidden sm:flex items-center">
            <ToolbarButton onClick={insertHR} icon={Minus} tooltip="Horizontal Line" />
            <ToolbarButton onClick={insertQuote} icon={Quote} tooltip="Block Quote" />
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className={cn(
        'grid gap-3 sm:gap-4',
        mode === 'split' && 'lg:grid-cols-2'
      )}>
        {/* Code Editor */}
        {(mode === 'code' || mode === 'split') && (
          <Card className="overflow-hidden">
            <CardHeader className="py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-neutral-800 to-neutral-900 border-b">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2 text-white">
                <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">HTML Source</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleCodeChange}
                className={cn(
                  'w-full p-3 sm:p-4 font-mono text-xs sm:text-sm',
                  'bg-neutral-900 text-neutral-100',
                  'border-0 focus:outline-none focus:ring-0',
                  'resize-none'
                )}
                style={{ height: `${mode === 'split' ? mobileHeight : height}px` }}
                placeholder={placeholder}
                spellCheck={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Visual Editor */}
        {(mode === 'visual' || mode === 'split') && (
          <Card className="overflow-hidden">
            <CardHeader className="py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-primary-50 to-accent-50 border-b">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500 flex-shrink-0" />
                <span className="truncate">Visual Editor</span>
                <span className="ml-auto text-[10px] sm:text-xs font-normal text-neutral-500 hidden sm:block">
                  Click to edit
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto bg-white" style={{ height: `${mode === 'split' ? mobileHeight : height}px` }}>
                <div
                  ref={visualEditorRef}
                  contentEditable
                  onInput={handleVisualInput}
                  onFocus={() => setIsVisualFocused(true)}
                  onBlur={() => setIsVisualFocused(false)}
                  className={cn(
                    'min-h-full p-3 sm:p-4 focus:outline-none',
                    'prose prose-sm max-w-none',
                    '[&_*]:outline-none'
                  )}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.6',
                    fontSize: '14px',
                  }}
                  suppressContentEditableWarning
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview (only in code mode) */}
      {mode === 'code' && (
        <Card className="overflow-hidden">
          <CardHeader className="py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-accent-50 to-success-50 border-b">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-500 flex-shrink-0" />
              <span className="truncate">Live Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto bg-neutral-100" style={{ height: `${mobileHeight}px` }}>
              <iframe
                srcDoc={sanitizeHtml(value)}
                className="w-full h-full border-0 bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Dialog - Mobile Optimized */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="link-url" className="text-sm">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="link-text" className="text-sm">Display Text (optional)</Label>
              <Input
                id="link-text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="w-full sm:w-auto" size="sm">
              Cancel
            </Button>
            <Button onClick={handleInsertLink} className="w-full sm:w-auto" size="sm">Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog - Mobile Optimized */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="image-url" className="text-sm">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="image-alt" className="text-sm">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                placeholder="Image description"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            {imageUrl && (
              <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg">
                <p className="text-xs text-neutral-500 mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt={imageAlt || 'Preview'}
                  className="max-w-full max-h-32 sm:max-h-40 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setImageDialogOpen(false)} className="w-full sm:w-auto" size="sm">
              Cancel
            </Button>
            <Button onClick={handleInsertImage} className="w-full sm:w-auto" size="sm">Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
