import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

interface RecipientData {
  name: string
  company: string
  email: string
  phone: string
}

interface SenderData {
  name: string
  email: string
  phone: string
  position: string
  company: string
}

export function replaceTemplatePlaceholders(
  template: string,
  recipient: RecipientData,
  sender?: SenderData
): string {
  // Replace recipient placeholders
  let result = template
    .replace(/\{\{name\}\}/gi, recipient.name || '')
    .replace(/\{\{company\}\}/gi, recipient.company || '')
    .replace(/\{\{email\}\}/gi, recipient.email || '')
    .replace(/\{\{phone\}\}/gi, recipient.phone || '')

  // Replace sender placeholders if provided
  if (sender) {
    result = result
      .replace(/\{\{sender_name\}\}/gi, sender.name || '')
      .replace(/\{\{sender_email\}\}/gi, sender.email || '')
      .replace(/\{\{sender_phone\}\}/gi, sender.phone || '')
      .replace(/\{\{sender_position\}\}/gi, sender.position || '')
      .replace(/\{\{sender_company\}\}/gi, sender.company || '')
  }

  return result
}

export function generateEmailSignature(sender: SenderData): string {
  if (!sender.name) return ''

  let signature = `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; font-weight: 600; color: #111827;">${sender.name}</p>`

  if (sender.position) {
    signature += `<p style="margin: 4px 0 0 0; color: #6b7280;">${sender.position}</p>`
  }

  if (sender.company) {
    signature += `<p style="margin: 4px 0 0 0; font-weight: 500; color: #374151;">${sender.company}</p>`
  }

  signature += `<div style="margin-top: 8px;">`

  if (sender.email) {
    signature += `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Email: ${sender.email}</p>`
  }

  if (sender.phone) {
    signature += `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Phone: ${sender.phone}</p>`
  }

  signature += `</div></div>`

  return signature
}

export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and on* attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
}

export function generateCampaignName(templateName: string): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
  return `${templateName} - ${dateStr} ${timeStr}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
