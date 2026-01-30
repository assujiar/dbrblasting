'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { cn, sanitizeHtml } from '@/lib/utils'
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Plus,
  User,
  Building2,
  Mail,
  Phone,
  UserCircle,
  Briefcase,
  AtSign,
  Smartphone,
  Sparkles,
  FileText,
  Palette,
  Loader2,
} from 'lucide-react'
import type { EmailTemplate } from '@/types/database'

const RECIPIENT_PLACEHOLDERS = [
  { label: 'Recipient Name', value: '{{name}}', icon: User, color: 'text-primary-600', bg: 'bg-primary-50' },
  { label: 'Company', value: '{{company}}', icon: Building2, color: 'text-accent-600', bg: 'bg-accent-50' },
  { label: 'Email', value: '{{email}}', icon: Mail, color: 'text-success-600', bg: 'bg-success-50' },
  { label: 'Phone', value: '{{phone}}', icon: Phone, color: 'text-warning-600', bg: 'bg-warning-50' },
]

const SENDER_PLACEHOLDERS = [
  { label: 'Sender Name', value: '{{sender_name}}', icon: UserCircle, color: 'text-secondary-600', bg: 'bg-secondary-50' },
  { label: 'Sender Position', value: '{{sender_position}}', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
  { label: 'Sender Company', value: '{{sender_company}}', icon: Building2, color: 'text-accent-600', bg: 'bg-accent-50' },
  { label: 'Sender Email', value: '{{sender_email}}', icon: AtSign, color: 'text-success-600', bg: 'bg-success-50' },
  { label: 'Sender Phone', value: '{{sender_phone}}', icon: Smartphone, color: 'text-warning-600', bg: 'bg-warning-50' },
]

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${id}`)
        if (!response.ok) throw new Error('Template not found')
        const { data } = await response.json()

        setName(data.name)
        setSubject(data.subject)
        setHtmlBody(data.html_body)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load template',
          variant: 'error',
        })
        router.push('/app/templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [id, router])

  const insertPlaceholder = useCallback((placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = htmlBody.substring(0, start) + placeholder + htmlBody.substring(end)
    setHtmlBody(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 0)
  }, [htmlBody])

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a template name', variant: 'error' })
      return
    }
    if (!subject.trim()) {
      toast({ title: 'Subject required', description: 'Please enter an email subject', variant: 'error' })
      return
    }
    if (!htmlBody.trim()) {
      toast({ title: 'Content required', description: 'Please enter email content', variant: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          html_body: htmlBody,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update template')
      }

      toast({
        title: 'Template updated',
        description: 'Your changes have been saved successfully',
        variant: 'success',
      })

      router.push(`/app/templates/${id}`)
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Failed to update template',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href={`/app/templates/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Edit Template</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Update your email template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/app/templates/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 md:grid-cols-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-500" />
                Template Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Email, Newsletter..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent-500" />
                Email Subject
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Welcome to {{company}}!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Insert Buttons */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            Quick Insert Placeholders
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4 text-primary-500" />
                  Recipient Info
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs text-neutral-500">
                  Insert recipient placeholder
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {RECIPIENT_PLACEHOLDERS.map((p) => (
                  <DropdownMenuItem
                    key={p.value}
                    onClick={() => insertPlaceholder(p.value)}
                    className="gap-2"
                  >
                    <div className={cn('p-1 rounded', p.bg)}>
                      <p.icon className={cn('h-3.5 w-3.5', p.color)} />
                    </div>
                    <span>{p.label}</span>
                    <span className="ml-auto text-xs text-neutral-400 font-mono">{p.value}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserCircle className="h-4 w-4 text-secondary-500" />
                  Sender Info
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs text-neutral-500">
                  Insert sender placeholder
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SENDER_PLACEHOLDERS.map((p) => (
                  <DropdownMenuItem
                    key={p.value}
                    onClick={() => insertPlaceholder(p.value)}
                    className="gap-2"
                  >
                    <div className={cn('p-1 rounded', p.bg)}>
                      <p.icon className={cn('h-3.5 w-3.5', p.color)} />
                    </div>
                    <span>{p.label}</span>
                    <span className="ml-auto text-xs text-neutral-400 font-mono">{p.value}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Editor & Preview */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
        {/* Editor */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4 text-primary-500" />
              HTML Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              ref={textareaRef}
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className={cn(
                'w-full h-[500px] p-4 font-mono text-sm',
                'bg-neutral-900 text-neutral-100',
                'border-0 focus:outline-none focus:ring-0',
                'resize-none'
              )}
              placeholder="Enter your HTML email template here..."
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-primary-50 to-accent-50 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary-500" />
              Live Preview
              <span className="ml-auto text-xs font-normal text-neutral-500 flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" />
                Updates in real-time
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-auto bg-neutral-100">
              <iframe
                srcDoc={sanitizeHtml(htmlBody)}
                className="w-full h-full border-0 bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
