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

// Organization SMTP config
export interface OrganizationSmtpConfig {
  smtp_host: string | null
  smtp_port: number | null
  smtp_user: string | null
  smtp_pass: string | null
  smtp_secure: boolean
  smtp_from_name: string | null
  smtp_from_email: string | null
  smtp_reply_to: string | null
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
  smtpConfig?: OrganizationSmtpConfig // Optional user SMTP config
  addWatermark?: boolean // Add watermark for free tier
}

// Watermark HTML for free tier
const FREE_TIER_WATERMARK = `
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
  <p style="font-size: 12px; color: #9ca3af; margin: 0;">
    Sent from <a href="https://blast-mail.saiki.id" style="color: #6366f1; text-decoration: none;">blast-mail.saiki.id</a>
  </p>
</div>
`

function getEmailConfig(userConfig?: OrganizationSmtpConfig): EmailConfig | null {
  // Use user's SMTP config if available
  if (userConfig?.smtp_host && userConfig?.smtp_user && userConfig?.smtp_pass) {
    return {
      host: userConfig.smtp_host,
      port: userConfig.smtp_port || 587,
      secure: userConfig.smtp_secure || false,
      auth: {
        user: userConfig.smtp_user,
        pass: userConfig.smtp_pass,
      },
    }
  }

  // Fallback to environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  }

  return null
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig(options.smtpConfig)

    if (!config) {
      return {
        success: false,
        error: 'SMTP not configured. Please configure SMTP settings in your profile or environment variables.'
      }
    }

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

    // Add watermark for free tier
    if (options.addWatermark) {
      personalizedBody += FREE_TIER_WATERMARK
    }

    // Determine from name and email
    // Priority: User SMTP config > Sender data > Environment vars
    const fromName = options.smtpConfig?.smtp_from_name
      || options.senderData?.name
      || process.env.MAIL_FROM_NAME
      || 'Email Blasting'

    const fromEmail = options.smtpConfig?.smtp_from_email
      || options.senderData?.email
      || process.env.MAIL_FROM_EMAIL
      || config.auth.user // Use SMTP username as fallback

    // Determine Reply-To address
    // Priority: Organization smtp_reply_to > Sender email > From email
    const replyTo = options.smtpConfig?.smtp_reply_to
      || options.senderData?.email
      || fromEmail

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
      subject: personalizedSubject,
      html: personalizedBody,
      replyTo: replyTo,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Email send error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function testSmtpConnection(userConfig?: OrganizationSmtpConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig(userConfig)

    if (!config) {
      return {
        success: false,
        error: 'SMTP not configured'
      }
    }

    const transporter = nodemailer.createTransport(config)
    await transporter.verify()
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, error: errorMessage }
  }
}
