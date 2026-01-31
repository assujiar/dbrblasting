# Supabase Email Templates

Template email untuk konfirmasi pendaftaran dan reset password BlastMail.

## Cara Setting di Supabase Dashboard

1. Buka **Supabase Dashboard** → pilih project Anda
2. Pergi ke **Authentication** → **Email Templates**
3. Pilih template yang ingin diubah:
   - **Confirm signup** - untuk konfirmasi pendaftaran
   - **Reset password** - untuk reset password
4. Paste HTML template di bawah ini
5. Klik **Save**

---

## 1. Confirm Signup Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Email - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(236, 72, 153, 0.15);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/assujiar/dbrblasting/main/public/blastmail_saiki_mainlogo-01.svg" alt="BlastMail" width="160" style="display: block; margin-bottom: 20px;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Selamat Datang! 🎉
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hai {{ .Email }},
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                      Terima kasih telah mendaftar di <strong style="color: #ec4899;">BlastMail</strong>! Untuk memulai perjalanan email marketing Anda, silakan konfirmasi email dengan klik tombol di bawah ini.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 16px 0 32px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);">
                      Konfirmasi Email
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
                  </td>
                </tr>

                <!-- Alt link -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Atau salin link berikut ke browser Anda:<br>
                      <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
                    </p>
                  </td>
                </tr>

                <!-- Note -->
                <tr>
                  <td style="background-color: #fdf2f8; border-radius: 12px; padding: 16px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      <strong>💡 Tips:</strong> Link konfirmasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-radius: 0 0 24px 24px; padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                      © 2026 BlastMail. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #d1d5db; font-size: 11px;">
                      Email marketing made simple ✨
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
```

**Subject:** Konfirmasi Email Anda - BlastMail 🎉

---

## 2. Reset Password Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(236, 72, 153, 0.15);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/assujiar/dbrblasting/main/public/blastmail_saiki_mainlogo-01.svg" alt="BlastMail" width="160" style="display: block; margin-bottom: 20px;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; line-height: 64px; text-align: center;">
                      <span style="font-size: 32px;">🔐</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                      Reset Password
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hai {{ .Email }},
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                      Kami menerima permintaan untuk mereset password akun <strong style="color: #a855f7;">BlastMail</strong> Anda. Klik tombol di bawah untuk membuat password baru.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 16px 0 32px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
                  </td>
                </tr>

                <!-- Alt link -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Atau salin link berikut ke browser Anda:<br>
                      <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
                    </p>
                  </td>
                </tr>

                <!-- Security Note -->
                <tr>
                  <td style="background-color: #fef3c7; border-radius: 12px; padding: 16px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      <strong>⚠️ Keamanan:</strong> Jika Anda tidak meminta reset password, abaikan email ini. Password Anda akan tetap aman.
                    </p>
                  </td>
                </tr>

                <!-- Expiry Note -->
                <tr>
                  <td style="padding-top: 20px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6; text-align: center;">
                      Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-radius: 0 0 24px 24px; padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                      © 2026 BlastMail. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #d1d5db; font-size: 11px;">
                      Email marketing made simple ✨
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
```

**Subject:** Reset Password Anda - BlastMail 🔐

---

## 3. Magic Link Email (Opsional)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Link - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(236, 72, 153, 0.15);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/assujiar/dbrblasting/main/public/blastmail_saiki_mainlogo-01.svg" alt="BlastMail" width="160" style="display: block; margin-bottom: 20px;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; line-height: 64px; text-align: center;">
                      <span style="font-size: 32px;">✨</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                      Login Tanpa Password
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hai {{ .Email }},
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                      Klik tombol di bawah untuk login ke akun <strong style="color: #10b981;">BlastMail</strong> Anda secara instan tanpa password.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 16px 0 32px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Login Sekarang
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px;">
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #ecfdf5; border-radius: 12px; padding: 16px;">
                    <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.6;">
                      <strong>🔒 Aman:</strong> Link ini hanya bisa digunakan sekali dan akan kedaluwarsa dalam 1 jam.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-radius: 0 0 24px 24px; padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                      © 2026 BlastMail. All rights reserved.
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
```

**Subject:** Login ke BlastMail ✨

---

## 4. Password Changed Notification (Security)

Template ini untuk notifikasi keamanan ketika password berhasil diubah. Supabase menyediakan fitur bawaan untuk template ini di section **Security**.

### Cara Setting
1. Buka **Authentication** → **Email Templates**
2. Scroll ke section **Security**
3. Pastikan **Password changed** toggle aktif (ON)
4. Klik pada template untuk mengedit
5. Paste HTML di bawah ini

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Berhasil Diubah - BlastMail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(236, 72, 153, 0.15);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/assujiar/dbrblasting/main/public/blastmail_saiki_mainlogo-01.svg" alt="BlastMail" width="160" style="display: block; margin-bottom: 20px;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; line-height: 64px; text-align: center;">
                      <span style="font-size: 32px;">🔑</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                      Password Diubah
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hai,
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                      Password akun <strong style="color: #f97316;">BlastMail</strong> Anda telah berhasil diubah.
                    </p>
                  </td>
                </tr>

                <!-- Change Details -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                            <strong style="color: #374151;">Waktu:</strong> {{ .Timestamp }}
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            <strong style="color: #374151;">Email:</strong> {{ .Email }}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
                  </td>
                </tr>

                <!-- Success Message -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border-radius: 12px; border-left: 4px solid #10b981;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.6;">
                            <strong>✅ Berhasil:</strong> Jika Anda yang melakukan perubahan ini, tidak ada tindakan lebih lanjut yang diperlukan.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Security Warning -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 12px; color: #991b1b; font-size: 13px; line-height: 1.6;">
                            <strong>⚠️ Bukan Anda?</strong> Jika Anda tidak melakukan perubahan ini, akun Anda mungkin telah disusupi. Segera lakukan langkah berikut:
                          </p>
                          <ol style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 13px; line-height: 1.8;">
                            <li>Reset password Anda segera</li>
                            <li>Periksa aktivitas akun Anda</li>
                            <li>Hubungi tim support kami</li>
                          </ol>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-radius: 0 0 24px 24px; padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                      © 2026 BlastMail. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #d1d5db; font-size: 11px;">
                      Email ini dikirim untuk keamanan akun Anda 🔒
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
```

**Subject:** Password Akun Anda Telah Diubah - BlastMail 🔑

> **Note:** Email ini akan dikirim otomatis oleh Supabase setiap kali user berhasil mengubah password mereka.

---

## Konfigurasi Tambahan

### 1. Redirect URL
Di **Authentication** → **URL Configuration**:
- **Site URL:** `https://blastmail.saiki.id` (URL production Anda)
- **Redirect URLs:** Tambahkan URL yang diizinkan untuk redirect setelah konfirmasi

### 2. SMTP Settings (Opsional untuk Custom Domain)
Jika ingin mengirim dari domain sendiri:
1. Pergi ke **Project Settings** → **Auth**
2. Scroll ke **SMTP Settings**
3. Enable **Custom SMTP**
4. Masukkan kredensial SMTP Anda

### 3. Rate Limiting
Supabase secara default membatasi pengiriman email. Untuk production:
- Free tier: 4 emails/jam
- Pro: Lebih tinggi, bisa dikonfigurasi

---

## Preview Template

Template di atas menggunakan:
- **Gradient header** dengan warna brand BlastMail (pink/purple)
- **Rounded corners** untuk modern look
- **Clear CTA button** dengan shadow
- **Mobile responsive** design
- **Security notes** untuk user awareness
- **Brand consistency** dengan logo dan warna
