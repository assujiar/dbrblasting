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
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
      // For TLS issues
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
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
    let suggestion = ''

    if (error instanceof Error) {
      const msg = error.message.toLowerCase()

      if (msg.includes('econnrefused')) {
        errorMessage = 'Connection refused'
        suggestion = 'The server rejected the connection. Check host and port are correct.'
      } else if (msg.includes('enotfound') || msg.includes('getaddrinfo')) {
        errorMessage = 'Host not found'
        suggestion = 'DNS cannot resolve the hostname. Verify the SMTP host is correct.'
      } else if (msg.includes('etimedout') || msg.includes('timeout') || msg.includes('ebusy')) {
        errorMessage = 'Connection timeout'
        suggestion = 'Server not responding. This may be a firewall issue or the server is only accessible from internal network.'
      } else if (msg.includes('invalid login') || msg.includes('authentication') || msg.includes('auth')) {
        errorMessage = 'Authentication failed'
        suggestion = 'Invalid username or password. For Gmail, use App Password instead of regular password.'
      } else if (msg.includes('certificate') || msg.includes('ssl') || msg.includes('tls')) {
        errorMessage = 'SSL/TLS error'
        suggestion = 'Certificate verification failed. Try toggling the SSL/TLS option.'
      } else if (msg.includes('greeting')) {
        errorMessage = 'Server greeting timeout'
        suggestion = 'Server connected but did not respond. Check if the port is correct (465 for SSL, 587 for TLS).'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({
      error: errorMessage,
      suggestion: suggestion || 'Check your SMTP settings and try again.',
    }, { status: 500 })
  }
}
