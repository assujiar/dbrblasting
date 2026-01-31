'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle2, Loader2, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

// Tier keys must match database enum: free, basic, regular, pro
const pricingPlans: Record<string, {
  name: string
  description: string
  monthlyPrice: number
  features: string[]
}> = {
  // Note: 'free' tier is redirected to signup, but kept here for completeness
  free: {
    name: 'Free',
    description: 'Perfect untuk memulai',
    monthlyPrice: 0,
    features: ['1 campaign aktif', '5 email/hari', 'Template dasar', 'Import Excel', 'Email support', 'Watermark'],
  },
  basic: {
    name: 'Basic',
    description: 'Untuk pemula serius',
    monthlyPrice: 74900,
    features: ['3 campaign aktif', '50 email/hari', 'All templates', 'Basic analytics', 'Email support', 'Tanpa watermark'],
  },
  regular: {
    name: 'Regular',
    description: 'Untuk bisnis berkembang',
    monthlyPrice: 149000,
    features: ['5 campaign aktif', '100 email/hari', 'All templates', 'SMTP custom', 'Priority support', 'Analytics dashboard'],
  },
  pro: {
    name: 'Pro',
    description: 'Untuk bisnis besar',
    monthlyPrice: 499000,
    features: ['10 campaign aktif', '500 email/hari', 'White-label', 'API access', 'Dedicated support', 'Custom integrations'],
  },
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

export default function SubscribePage() {
  const params = useParams()
  const router = useRouter()
  const planKey = (params.plan as string)?.toLowerCase()
  const plan = pricingPlans[planKey]

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!plan) {
    return (
      <div className="min-h-screen lp-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold lp-heading mb-4">Paket tidak ditemukan</h1>
          <Link href="/#harga" className="lp-link">
            Kembali ke halaman harga
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/pricing-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planKey: planKey,  // Database tier key (free, basic, regular, pro)
          planName: plan.name,
          planPrice: plan.monthlyPrice,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim permintaan')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen lp-bg">
        {/* Background effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 lp-bg-gradient" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] lp-bg-pink-glow rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] lp-bg-purple-glow rounded-full blur-[128px]" />
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="lp-card-static p-8 sm:p-12 max-w-lg w-full text-center">
            <div className="lp-icon-box w-16 h-16 mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 lp-text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold lp-heading mb-4">
              Terima Kasih! 🎉
            </h1>

            <p className="lp-text mb-6 leading-relaxed">
              Permintaan Anda untuk paket <span className="font-semibold lp-text-magenta">{plan.name}</span> telah kami terima.
              Tim {APP_NAME} akan segera menghubungi Anda melalui email atau telepon dalam 1x24 jam.
            </p>

            <div className="lp-card p-4 mb-8">
              <p className="text-sm lp-text-muted">
                Email konfirmasi telah dikirim ke:
              </p>
              <p className="font-medium lp-heading mt-1">{formData.email}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="w-full sm:w-auto lp-btn-outline px-6 py-3 rounded-xl font-medium">
                  Kembali ke Beranda
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto lp-btn-primary px-6 py-3 rounded-xl font-medium">
                  Login ke Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lp-bg">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 lp-bg-gradient" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] lp-bg-pink-glow rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] lp-bg-purple-glow rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="border-b lp-border-subtle lp-bg backdrop-blur-xl bg-opacity-80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 lp-link">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Plan Summary */}
            <div className="lg:col-span-2">
              <div className="lp-card-static p-6 sticky top-24">
                <h2 className="text-lg font-semibold lp-heading mb-1">Paket {plan.name}</h2>
                <p className="text-sm lp-text-muted mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold lp-heading">
                    {formatRupiah(plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="lp-text-muted">/bulan</span>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold lp-text-muted uppercase tracking-wider">Fitur yang didapat:</p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 lp-text-success flex-shrink-0" />
                      <span className="lp-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="lp-card-static p-6 sm:p-8">
                <h1 className="text-2xl font-bold lp-heading mb-2">
                  Daftar Paket {plan.name}
                </h1>
                <p className="lp-text-muted mb-8">
                  Isi form di bawah ini dan tim kami akan menghubungi Anda untuk proses selanjutnya.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium lp-heading mb-2">
                      <User className="h-4 w-4 inline mr-2 lp-icon" />
                      Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="lp-input w-full px-4 py-3"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium lp-heading mb-2">
                      <Mail className="h-4 w-4 inline mr-2 lp-icon" />
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="lp-input w-full px-4 py-3"
                      placeholder="john@company.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium lp-heading mb-2">
                      <Phone className="h-4 w-4 inline mr-2 lp-icon" />
                      Nomor Telepon <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="lp-input w-full px-4 py-3"
                      placeholder="08123456789"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium lp-heading mb-2">
                      <Building2 className="h-4 w-4 inline mr-2 lp-icon" />
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="lp-input w-full px-4 py-3"
                      placeholder="PT Contoh Indonesia"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium lp-heading mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-2 lp-icon" />
                      Pesan (Opsional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="lp-input w-full px-4 py-3 min-h-[100px] resize-y"
                      placeholder="Tulis pertanyaan atau kebutuhan khusus Anda..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="lp-btn-primary w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Kirim Permintaan
                      </>
                    )}
                  </button>

                  <p className="text-xs lp-text-muted text-center">
                    Dengan mengirim form ini, Anda menyetujui{' '}
                    <a href="#" className="lp-link">Syarat & Ketentuan</a> dan{' '}
                    <a href="#" className="lp-link">Kebijakan Privasi</a> kami.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
