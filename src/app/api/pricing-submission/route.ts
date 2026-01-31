import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Get Supabase admin client for database operations
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// Admin notification recipients
const ADMIN_EMAILS = [
  'info@saiki.id',
  'as.sujiar@gmail.com',
  'dimasbudi376@gmail.com',
]

// Email transporter configuration
function getTransporter() {
  // Use environment variables for SMTP config
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function formatRupiah(amount: number): string {
  if (amount === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Generate confirmation email HTML for user
function generateUserConfirmationEmail(data: {
  fullName: string
  planName: string
  planPrice: number
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terima Kasih atas Permintaan Anda - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #d946ef 0%, #f43f5e 100%); border-radius: 20px 20px 0 0; padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-align: center;">
                🎉 Terima Kasih, ${data.fullName}!
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); padding: 40px; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 20px; color: #fbcfe8; font-size: 16px; line-height: 1.6;">
                Permintaan Anda untuk paket <strong style="color: #e879f9;">${data.planName}</strong> telah kami terima dengan baik.
              </p>

              <!-- Plan Info Box -->
              <div style="background: linear-gradient(135deg, rgba(217,70,239,0.2) 0%, rgba(244,63,94,0.2) 100%); border: 1px solid rgba(217,70,239,0.3); border-radius: 12px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #f9a8d4; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Paket yang Dipilih
                </p>
                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                  ${data.planName}
                </p>
                <p style="margin: 10px 0 0; color: #e879f9; font-size: 18px; font-weight: 600;">
                  ${formatRupiah(data.planPrice)}/bulan
                </p>
              </div>

              <p style="margin: 0 0 20px; color: #fbcfe8; font-size: 16px; line-height: 1.6;">
                Tim <strong style="color: #ffffff;">BlastMail</strong> akan segera menghubungi Anda dalam waktu <strong style="color: #4ade80;">1x24 jam</strong> untuk membantu proses aktivasi akun Anda.
              </p>

              <!-- What's Next Section -->
              <div style="margin: 30px 0; padding: 20px; background-color: rgba(255,255,255,0.03); border-radius: 12px;">
                <p style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 600;">
                  📋 Langkah Selanjutnya:
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; color: #f9a8d4; font-size: 14px;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #d946ef, #f43f5e); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; margin-right: 12px;">1</span>
                      Tim kami akan menghubungi Anda via telepon/email
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #f9a8d4; font-size: 14px;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #d946ef, #f43f5e); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; margin-right: 12px;">2</span>
                      Konfirmasi pembayaran (jika paket berbayar)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #f9a8d4; font-size: 14px;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #d946ef, #f43f5e); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; margin-right: 12px;">3</span>
                      Akun Anda akan diaktifkan dan siap digunakan
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 20px 0 0; color: #f9a8d4; font-size: 14px; line-height: 1.6;">
                Ada pertanyaan? Balas email ini atau hubungi kami di <a href="mailto:info@saiki.id" style="color: #e879f9; text-decoration: none;">info@saiki.id</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.02); border-radius: 0 0 20px 20px; padding: 30px 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px; color: #ffffff; font-size: 18px; font-weight: 700;">
                      BlastMail
                    </p>
                    <p style="margin: 0; color: #f472b6; font-size: 12px;">
                      by SAIKI Group
                    </p>
                    <p style="margin: 15px 0 0; color: #f9a8d4; font-size: 12px;">
                      Email Marketing Platform #1 di Indonesia
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Generate admin notification email HTML
function generateAdminNotificationEmail(data: {
  fullName: string
  email: string
  phone: string
  companyName: string
  message: string
  planName: string
  planPrice: number
  submittedAt: string
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Pricing Submission - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d946ef 0%, #f43f5e 100%); border-radius: 16px 16px 0 0; padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                🔔 New Pricing Submission!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Someone just requested the <strong>${data.planName}</strong> plan
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px 40px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">

              <!-- Plan Badge -->
              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 1px solid #f9a8d4; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0; color: #db2777; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Paket yang Dipilih
                </p>
                <p style="margin: 10px 0 5px; color: #1e293b; font-size: 28px; font-weight: 700;">
                  ${data.planName}
                </p>
                <p style="margin: 0; color: #d946ef; font-size: 18px; font-weight: 600;">
                  ${formatRupiah(data.planPrice)}/bulan
                </p>
              </div>

              <!-- Contact Details -->
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                📋 Detail Kontak
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Nama Lengkap</span>
                    <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${data.fullName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Email</span>
                    <a href="mailto:${data.email}" style="color: #d946ef; font-size: 16px; font-weight: 600; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">No. Telepon</span>
                    <a href="tel:${data.phone}" style="color: #1e293b; font-size: 16px; font-weight: 600; text-decoration: none;">${data.phone}</a>
                  </td>
                </tr>
                ${data.companyName ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Perusahaan</span>
                    <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${data.companyName}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Waktu Submit</span>
                    <span style="color: #1e293b; font-size: 14px;">${data.submittedAt}</span>
                  </td>
                </tr>
              </table>

              ${data.message ? `
              <!-- Message -->
              <h2 style="margin: 0 0 15px; color: #1e293b; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                💬 Pesan
              </h2>
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>
              ` : ''}

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right: 10px; width: 50%;">
                    <a href="mailto:${data.email}" style="display: block; background: linear-gradient(135deg, #d946ef 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; text-align: center; font-weight: 600; font-size: 14px;">
                      📧 Reply Email
                    </a>
                  </td>
                  <td style="padding-left: 10px; width: 50%;">
                    <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; text-align: center; font-weight: 600; font-size: 14px;">
                      💬 WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e293b; border-radius: 0 0 16px 16px; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                BlastMail Admin Notification • ${new Date().getFullYear()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, companyName, message, planKey, planName, planPrice } = body

    // Validate required fields
    if (!fullName || !email || !phone || !planKey || !planName) {
      return NextResponse.json(
        { error: 'Nama, email, telepon, dan paket harus diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    const submittedAt = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium',
    })

    // Get request metadata for tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    // Store submission in database
    try {
      const supabase = getAdminClient()
      const { error: dbError } = await supabase
        .from('pricing_submissions')
        .insert({
          full_name: fullName,
          email: email,
          phone: phone,
          company_name: companyName || null,
          message: message || null,
          plan_key: planKey,  // Database tier key
          plan_name: planName,
          plan_price: planPrice || 0,
          status: 'pending',
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
        })

      if (dbError) {
        console.error('Failed to store submission in database:', dbError)
        // Continue even if database insert fails - we don't want to block the user
      }
    } catch (dbErr) {
      console.error('Database error:', dbErr)
      // Continue even if database fails
    }

    // Initialize transporter
    const transporter = getTransporter()

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: `"BlastMail" <${process.env.SMTP_USER || 'noreply@blastmail.id'}>`,
        to: email,
        subject: `Terima Kasih atas Permintaan Paket ${planName} - BlastMail`,
        html: generateUserConfirmationEmail({ fullName, planName, planPrice }),
      })
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError)
      // Continue even if user email fails
    }

    // Send notification email to admins
    try {
      await transporter.sendMail({
        from: `"BlastMail System" <${process.env.SMTP_USER || 'noreply@blastmail.id'}>`,
        to: ADMIN_EMAILS.join(', '),
        subject: `🔔 New Pricing Submission: ${planName} - ${fullName}`,
        html: generateAdminNotificationEmail({
          fullName,
          email,
          phone,
          companyName: companyName || '',
          message: message || '',
          planName,
          planPrice,
          submittedAt,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Continue even if admin email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan berhasil dikirim',
    })
  } catch (error) {
    console.error('Pricing submission error:', error)
    return NextResponse.json(
      { error: 'Gagal memproses permintaan' },
      { status: 500 }
    )
  }
}
