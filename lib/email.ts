import nodemailer from 'nodemailer'

/**
 * Create a Nodemailer transporter from environment variables. Credentials are
 * loaded at runtime; storing them in `.env` keeps sensitive data out of the
 * source code【549306875252446†L326-L364】.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration')
  }
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

/**
 * Sends an HTML email. Returns true on success, otherwise throws an error.
 * `to` may be a single email or an array. The subject and html are required.
 */
export async function sendEmail(to: string | string[], subject: string, html: string) {
  const transporter = createTransporter()
  const fromName = process.env.MAIL_FROM_NAME || 'No Reply'
  const fromEmail = process.env.MAIL_FROM_EMAIL || 'no-reply@example.com'
  const from = `${fromName} <${fromEmail}>`
  await transporter.sendMail({ from, to, subject, html })
  return true
}