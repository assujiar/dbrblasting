'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Mail, Send, Users, FileText, Zap, Shield, BarChart3, CheckCircle2, ArrowRight, Sparkles, Check, X, Crown, Star, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME } from '@/lib/constants'

const features = [
  {
    icon: Users,
    title: 'Manage Leads',
    description: 'Import dari Excel, kelola kontak, dan organisasi dalam grup untuk targeting yang lebih efektif.',
  },
  {
    icon: FileText,
    title: 'Template Email',
    description: 'Buat template HTML dengan live preview dan placeholder otomatis untuk personalisasi.',
  },
  {
    icon: Send,
    title: 'Bulk Sending',
    description: 'Kirim email massal ke ribuan kontak sekaligus dengan tracking status real-time.',
  },
  {
    icon: BarChart3,
    title: 'Campaign Analytics',
    description: 'Pantau performa campaign: sent, failed, pending dengan dashboard yang informatif.',
  },
]

const benefits = [
  'Import leads dari Excel dengan mudah',
  'Template email dengan HTML editor & live preview',
  'Placeholder otomatis (nama, email, company)',
  'Kirim ke grup atau kontak individual',
  'Tracking status pengiriman real-time',
  'Filter campaign berdasarkan tanggal',
]

const pricingPlans = [
  {
    name: 'Free',
    description: 'Untuk mencoba platform',
    monthlyPrice: 0,
    yearlyPrice: 0,
    campaigns: 1,
    recipientsPerDay: 5,
    emailsPerDay: 5,
    features: [
      { text: '1 campaign aktif', included: true },
      { text: 'Maks. 5 penerima/hari', included: true },
      { text: 'Template email dasar', included: true },
      { text: 'Import leads dari Excel', included: true },
      { text: 'Watermark BlastMail', included: true, note: 'Ada watermark' },
      { text: 'SMTP kustom', included: false },
      { text: 'Priority support', included: false },
    ],
    popular: false,
    icon: Sparkles,
    color: 'neutral',
  },
  {
    name: 'Basic',
    description: 'Untuk bisnis kecil',
    monthlyPrice: 74900,
    yearlyPrice: 800000,
    campaigns: 3,
    recipientsPerDay: 50,
    emailsPerDay: 150,
    features: [
      { text: '3 campaign aktif', included: true },
      { text: 'Maks. 50 penerima/hari', included: true },
      { text: '150 email/hari', included: true },
      { text: 'Template email lengkap', included: true },
      { text: 'Tanpa watermark', included: true },
      { text: 'SMTP kustom', included: true },
      { text: 'Priority support', included: false },
    ],
    popular: false,
    icon: Star,
    color: 'primary',
  },
  {
    name: 'Regular',
    description: 'Untuk bisnis berkembang',
    monthlyPrice: 124900,
    yearlyPrice: 1350000,
    campaigns: 5,
    recipientsPerDay: 100,
    emailsPerDay: 500,
    features: [
      { text: '5 campaign aktif', included: true },
      { text: 'Maks. 100 penerima/hari', included: true },
      { text: '500 email/hari', included: true },
      { text: 'Template email lengkap', included: true },
      { text: 'Tanpa watermark', included: true },
      { text: 'SMTP kustom', included: true },
      { text: 'Priority support', included: true },
    ],
    popular: true,
    icon: Rocket,
    color: 'accent',
  },
  {
    name: 'Pro',
    description: 'Untuk bisnis besar',
    monthlyPrice: 349000,
    yearlyPrice: 3599000,
    campaigns: 10,
    recipientsPerDay: 500,
    emailsPerDay: 5000,
    features: [
      { text: '10 campaign aktif', included: true },
      { text: 'Maks. 500 penerima/hari', included: true },
      { text: '5.000 email/hari', included: true },
      { text: 'Template email lengkap', included: true },
      { text: 'Tanpa watermark', included: true },
      { text: 'SMTP kustom', included: true },
      { text: 'Priority support', included: true },
    ],
    popular: false,
    icon: Crown,
    color: 'warning',
  },
]

function formatRupiah(amount: number): string {
  if (amount === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-10 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-500/5 to-accent-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={APP_LOGO_URL}
              alt={APP_NAME}
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-bold text-neutral-900">{APP_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a href="#features" className="transition-colors hover:text-primary-600">
              Fitur
            </a>
            <a href="#benefits" className="transition-colors hover:text-primary-600">
              Keunggulan
            </a>
            <a href="#pricing" className="transition-colors hover:text-primary-600">
              Harga
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
              Masuk
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-lg shadow-primary-500/25">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left content */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
                <Sparkles className="h-3.5 w-3.5" />
                Email Blasting Platform
              </div>

              <h1 className="text-4xl font-extrabold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Kirim{' '}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    Ribuan Email
                  </span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary-200/50 -z-0" />
                </span>{' '}
                dalam Hitungan Menit
              </h1>

              <p className="text-lg text-neutral-600 leading-relaxed">
                Platform email blasting yang powerful untuk bisnis Anda. Kelola leads, buat template menarik,
                dan kirim campaign massal dengan mudah dan efisien.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/25">
                    Mulai Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Lihat Harga
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                  <span className="text-sm text-neutral-600">Gratis untuk mulai</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                  <span className="text-sm text-neutral-600">Tanpa kartu kredit</span>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              {/* Main card */}
              <div className="relative rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-neutral-900/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Campaign Dashboard</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">Email Statistics</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-700">
                    <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
                    Live
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="h-4 w-4 text-primary-600" />
                      <span className="text-xs font-medium text-primary-600">Total Sent</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">12,847</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-success-50 to-success-100/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-success-600" />
                      <span className="text-xs font-medium text-success-600">Delivered</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">98.5%</p>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Campaign A - Promo Launch', value: 95, color: 'bg-primary-500' },
                    { label: 'Campaign B - Newsletter', value: 87, color: 'bg-accent-500' },
                    { label: 'Campaign C - Follow Up', value: 72, color: 'bg-success-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">{item.label}</span>
                        <span className="font-semibold text-neutral-900">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-100">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating card - Leads */}
              <div className="absolute -bottom-6 -left-6 hidden lg:block w-48 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-100">
                    <Users className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Total Leads</p>
                    <p className="text-xl font-bold text-neutral-900">5,234</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Templates */}
              <div className="absolute -top-4 -right-4 hidden lg:block w-44 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Templates</p>
                    <p className="text-xl font-bold text-neutral-900">24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gradient-to-b from-neutral-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">Fitur Lengkap</p>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Semua yang Anda Butuhkan untuk Email Marketing
              </h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                Dari manajemen kontak hingga pengiriman massal, BlastMail menyediakan tools yang Anda butuhkan.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 mb-5">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">Keunggulan</p>
                <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl mb-6">
                  Mengapa Memilih BlastMail?
                </h2>
                <p className="text-lg text-neutral-600 mb-8">
                  BlastMail dirancang untuk kemudahan penggunaan tanpa mengorbankan fitur powerful yang Anda butuhkan.
                </p>

                <div className="grid gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success-100">
                        <CheckCircle2 className="h-4 w-4 text-success-600" />
                      </div>
                      <span className="text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href="/signup">
                    <Button size="lg" className="shadow-lg shadow-primary-500/25">
                      Coba Sekarang - Gratis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-accent-50 p-8 lg:p-12">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary-600">99%</p>
                      <p className="text-sm text-neutral-600 mt-1">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-accent-600">10x</p>
                      <p className="text-sm text-neutral-600 mt-1">Lebih Cepat</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-success-600">24/7</p>
                      <p className="text-sm text-neutral-600 mt-1">Support</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-warning-600">100%</p>
                      <p className="text-sm text-neutral-600 mt-1">Secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-gradient-to-b from-neutral-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">Harga Terjangkau</p>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Pilih Paket yang Sesuai untuk Bisnis Anda
              </h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                Mulai gratis dan upgrade kapan saja sesuai kebutuhan bisnis Anda.
              </p>

              {/* Billing Toggle */}
              <div className="mt-8 inline-flex items-center gap-4 rounded-full bg-neutral-100 p-1.5">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm font-medium transition-all',
                    billingPeriod === 'monthly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    billingPeriod === 'yearly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  Tahunan
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full">
                    Hemat 10%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              {pricingPlans.map((plan) => {
                const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                const IconComponent = plan.icon

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      'relative rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-xl',
                      plan.popular
                        ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                        <Star className="h-3 w-3" />
                        Paling Populer
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl',
                        plan.color === 'neutral' && 'bg-neutral-100',
                        plan.color === 'primary' && 'bg-primary-100',
                        plan.color === 'accent' && 'bg-accent-100',
                        plan.color === 'warning' && 'bg-warning-100',
                      )}>
                        <IconComponent className={cn(
                          'h-5 w-5',
                          plan.color === 'neutral' && 'text-neutral-600',
                          plan.color === 'primary' && 'text-primary-600',
                          plan.color === 'accent' && 'text-accent-600',
                          plan.color === 'warning' && 'text-warning-600',
                        )} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                        <p className="text-xs text-neutral-500">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-neutral-900">
                          {formatRupiah(price)}
                        </span>
                        {price > 0 && (
                          <span className="text-sm text-neutral-500">
                            /{billingPeriod === 'monthly' ? 'bulan' : 'tahun'}
                          </span>
                        )}
                      </div>
                      {billingPeriod === 'yearly' && price > 0 && (
                        <p className="text-xs text-success-600 mt-1">
                          Hemat {formatRupiah((plan.monthlyPrice * 12) - plan.yearlyPrice)}/tahun
                        </p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-xl bg-neutral-50">
                      <div className="text-center">
                        <p className="text-xl font-bold text-neutral-900">{plan.campaigns}</p>
                        <p className="text-xs text-neutral-500">Campaign</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-neutral-900">{plan.emailsPerDay.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-neutral-500">Email/Hari</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-neutral-300 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={cn(
                            'text-sm',
                            feature.included ? 'text-neutral-700' : 'text-neutral-400'
                          )}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.monthlyPrice === 0 ? '/signup' : '/login'}>
                      <Button
                        className={cn(
                          'w-full',
                          plan.popular && 'shadow-lg shadow-primary-500/25'
                        )}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.monthlyPrice === 0 ? 'Mulai Gratis' : 'Pilih Paket'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Money Back Guarantee */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-success-50 px-6 py-3">
                <Shield className="h-5 w-5 text-success-600" />
                <span className="text-sm text-success-700 font-medium">
                  Garansi 7 hari uang kembali untuk semua paket berbayar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Siap Meningkatkan Email Marketing Anda?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Mulai gratis hari ini dan rasakan kemudahan mengirim email massal dengan BlastMail.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="shadow-xl">
                Mulai Gratis Sekarang
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <img
                  src={APP_LOGO_URL}
                  alt={APP_NAME}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg font-bold text-neutral-900">{APP_NAME}</span>
              </div>
              <p className="text-sm text-neutral-500">
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-neutral-600">
                <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
