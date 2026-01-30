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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { EmailEditor } from '@/components/templates/email-editor'
import { TemplateGallery } from '@/components/templates/template-gallery'
import type { DefaultTemplate } from '@/lib/email/default-templates'
import {
  ArrowLeft,
  Save,
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
  Loader2,
  LayoutTemplate,
} from 'lucide-react'

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
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)

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

  const insertPlaceholderToSubject = useCallback((placeholder: string) => {
    const input = subjectInputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const newValue = subject.substring(0, start) + placeholder + subject.substring(end)
    setSubject(newValue)

    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 0)
  }, [subject])

  const handleSelectTemplate = useCallback((template: DefaultTemplate) => {
    // Only replace HTML body, keep the name as is
    setHtmlBody(template.html_body)
    toast({
      title: 'Template content loaded',
      description: `Content from "${template.name}" has been loaded. You can now customize it.`,
      variant: 'success',
    })
  }, [])

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 animate-slide-up">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={`/app/templates/${id}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Edit Template</h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">
              Update your email template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <Button variant="outline" size="sm" onClick={() => setGalleryOpen(true)} className="flex-1 sm:flex-initial">
            <LayoutTemplate className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Replace</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/app/templates/${id}`)} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} loading={isSaving} className="flex-1 sm:flex-initial">
            <Save className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Save</span>
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
                ref={subjectInputRef}
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
            <span className="text-xs font-normal text-neutral-500 ml-2">
              (Insert into subject or email body)
            </span>
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
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-neutral-500">
                  Insert into Subject
                </DropdownMenuLabel>
                {RECIPIENT_PLACEHOLDERS.map((p) => (
                  <DropdownMenuItem
                    key={`subject-${p.value}`}
                    onClick={() => insertPlaceholderToSubject(p.value)}
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
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-neutral-500">
                  Insert into Subject
                </DropdownMenuLabel>
                {SENDER_PLACEHOLDERS.map((p) => (
                  <DropdownMenuItem
                    key={`subject-${p.value}`}
                    onClick={() => insertPlaceholderToSubject(p.value)}
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

            <div className="flex-1" />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGalleryOpen(true)}
              className="gap-2"
            >
              <LayoutTemplate className="h-4 w-4" />
              Browse Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Editor */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <EmailEditor
          value={htmlBody}
          onChange={setHtmlBody}
          placeholder="Enter your HTML email template here..."
          height={500}
        />
      </div>

      {/* Template Gallery */}
      <TemplateGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}
