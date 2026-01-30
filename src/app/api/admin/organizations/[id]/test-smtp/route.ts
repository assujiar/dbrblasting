import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireSuperAdmin } from '@/lib/auth/rbac'
import nodemailer from 'nodemailer'

// POST - Test SMTP connection for an organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext()
    requireSuperAdmin(context)

    const { id } = await params
    const supabase = await createClient()

    // Get organization's SMTP settings
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
        { error: 'SMTP settings are incomplete' },
        { status: 400 }
      )
    }

    // Create transporter with organization's SMTP settings
    const transporter = nodemailer.createTransport({
      host: org.smtp_host,
      port: org.smtp_port || 587,
      secure: org.smtp_secure || false,
      auth: {
        user: org.smtp_user,
        pass: org.smtp_pass,
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
