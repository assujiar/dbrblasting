'use client'

import { useState, useRef, useCallback } from 'react'
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

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hello, {{name}}!</h1>
    </div>
    <div class="content">
      <p>We hope this email finds you well at <strong>{{company}}</strong>.</p>
      <p>Your email content goes here...</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>{{sender_name}}<br>{{sender_position}} at {{sender_company}}</p>
      <p style="font-size: 12px; color: #666;">{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`

export default function NewTemplatePage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState(DEFAULT_TEMPLATE)

  const insertPlaceholder = useCallback((placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = htmlBody.substring(0, start) + placeholder + htmlBody.substring(end)
    setHtmlBody(newValue)

    // Restore cursor position after the inserted placeholder
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

    setIsLoading(true)
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          html_body: htmlBody,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create template')
      }

      toast({
        title: 'Template created',
        description: 'Your email template has been saved successfully',
        variant: 'success',
      })

      router.push('/app/templates')
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Failed to create template',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/app/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Create Template</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Design your email with live preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/app/templates')}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isLoading}>
            <Save className="h-4 w-4" />
            Save Template
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
