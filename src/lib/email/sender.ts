import nodemailer from 'nodemailer'
import { replaceTemplatePlaceholders, generateEmailSignature } from '@/lib/utils'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SenderData {
  name: string
  email: string
  phone: string
  position: string
  company: string
}

interface EmailOptions {
  to: string
  toName: string
  subject: string
  htmlBody: string
  recipientData: {
    name: string
    company: string
    email: string
    phone: string
  }
  senderData?: SenderData
}

function getEmailConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  }
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig()
    const transporter = nodemailer.createTransport(config)

    // Replace placeholders in subject and body
    const personalizedSubject = replaceTemplatePlaceholders(
      options.subject,
      options.recipientData,
      options.senderData
    )
    let personalizedBody = replaceTemplatePlaceholders(
      options.htmlBody,
      options.recipientData,
      options.senderData
    )

    // Append signature if sender data is provided
    if (options.senderData && options.senderData.name) {
      const signature = generateEmailSignature(options.senderData)
      personalizedBody += signature
    }

    // Use sender data for from name/email if available, otherwise use env vars
    const fromName = options.senderData?.name || process.env.MAIL_FROM_NAME || 'Email Blasting'
    const fromEmail = process.env.MAIL_FROM_EMAIL || 'noreply@example.com'

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
      subject: personalizedSubject,
      html: personalizedBody,
      replyTo: options.senderData?.email || undefined,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Email send error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function testSmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig()
    const transporter = nodemailer.createTransport(config)
    await transporter.verify()
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, error: errorMessage }
  }
}
