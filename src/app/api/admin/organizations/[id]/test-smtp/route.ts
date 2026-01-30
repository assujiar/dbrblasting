import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireSuperAdmin } from '@/lib/auth/rbac'
import nodemailer from 'nodemailer'

interface SmtpSettings {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  smtp_secure: boolean
}

// POST - Test SMTP connection for an organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params

    // Try to get SMTP settings from request body first (for testing before save)
    let smtpSettings: SmtpSettings | null = null

    try {
      const body = await request.json()
      if (body.smtp_host && body.smtp_user && body.smtp_pass) {
        smtpSettings = {
          smtp_host: body.smtp_host,
          smtp_port: body.smtp_port || 587,
          smtp_user: body.smtp_user,
          smtp_pass: body.smtp_pass,
          smtp_secure: body.smtp_secure || false,
        }
      }
    } catch {
      // No body or invalid JSON, will fetch from database
    }

    // If no settings in request body, fetch from database
    if (!smtpSettings) {
      const supabase = await createClient()
      const { data: org, error } = await supabase
        .from('organizations')
        .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure')
        .eq('id', id)
        .single()

      if (error || !org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }

      if (!org.smtp_host || !org.smtp_user || !org.smtp_pass) {
        return NextResponse.json(
          { error: 'SMTP settings are incomplete. Please fill in host, username, and password.' },
          { status: 400 }
        )
      }

      smtpSettings = {
        smtp_host: org.smtp_host,
        smtp_port: org.smtp_port || 587,
        smtp_user: org.smtp_user,
        smtp_pass: org.smtp_pass,
        smtp_secure: org.smtp_secure || false,
      }
    }

    // Create transporter with SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtp_host,
      port: smtpSettings.smtp_port,
      secure: smtpSettings.smtp_secure,
      auth: {
        user: smtpSettings.smtp_user,
        pass: smtpSettings.smtp_pass,
      },
      connectionTimeout: 10000,
    })

    // Verify connection
    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful',
    })
  } catch (error) {
    console.error('SMTP test error:', error)

    let errorMessage = 'Failed to connect to SMTP server'
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Check host and port.'
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found. Check the hostname.'
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timed out. Check firewall settings.'
      } else if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid username or password.'
      } else if (error.message.includes('authentication')) {
        errorMessage = 'Authentication failed. Check credentials.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
