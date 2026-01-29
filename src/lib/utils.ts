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

interface TemplateData {
  name: string
  company: string
  email: string
  phone: string
}

export function replaceTemplatePlaceholders(template: string, data: TemplateData): string {
  return template
    .replace(/\{\{name\}\}/gi, data.name || '')
    .replace(/\{\{company\}\}/gi, data.company || '')
    .replace(/\{\{email\}\}/gi, data.email || '')
    .replace(/\{\{phone\}\}/gi, data.phone || '')
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
