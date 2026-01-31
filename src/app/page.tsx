'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Send,
  Users,
  FileText,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
  Crown,
  Star,
  Rocket,
  Play,
  ChevronDown,
  Quote,
  Target,
  TrendingUp,
  Clock,
  Globe,
  MousePointer,
  Inbox,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, start])

  return count
}

// Intersection Observer hook
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

const features = [
  {
    icon: Users,
    title: 'Smart Lead Management',
    description: 'Import ribuan kontak dari Excel dalam hitungan detik. Organisasi otomatis dengan tags dan segmentasi cerdas.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Drag & Drop Template Builder',
    description: 'Buat email stunning tanpa coding. Live preview, 50+ template siap pakai, dan personalisasi dinamis.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Send,
    title: 'Lightning Fast Delivery',
    description: 'Kirim 10,000+ email dalam hitungan menit dengan delivery rate 99%. Anti-spam technology built-in.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Dashboard live dengan open rate, click rate, dan bounce tracking. Insights yang actionable untuk optimize campaign.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Data terenkripsi end-to-end. GDPR compliant. Multi-factor authentication dan audit logs lengkap.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Zap,
    title: 'Automation Workflows',
    description: 'Set it and forget it. Trigger email otomatis berdasarkan behavior, schedule, atau event tertentu.',
    gradient: 'from-yellow-500 to-orange-500',
  },
]

const stats = [
  { value: 50, suffix: 'M+', label: 'Email Terkirim', icon: Send },
  { value: 99, suffix: '%', label: 'Delivery Rate', icon: CheckCircle2 },
  { value: 10, suffix: 'K+', label: 'Happy Users', icon: Users },
  { value: 24, suffix: '/7', label: 'Support', icon: Clock },
]

const testimonials = [
  {
    name: 'Andi Pratama',
    role: 'Marketing Director',
    company: 'TechStart Indonesia',
    avatar: 'A',
    content: 'BlastMail mengubah cara kami melakukan email marketing. Conversion rate naik 3x lipat dalam sebulan pertama!',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'Founder',
    company: 'Beauty by Sarah',
    avatar: 'S',
    content: 'Interface-nya super intuitif. Dari import leads sampai kirim campaign, semua bisa selesai dalam 10 menit.',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: 'CEO',
    company: 'PropertyHub',
    avatar: 'B',
    content: 'Support team-nya luar biasa responsif. Issue kami solve dalam hitungan jam, bukan hari.',
    rating: 5,
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect untuk memulai',
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlight: 'Gratis Selamanya',
    features: ['1 campaign aktif', '50 email/hari', 'Template dasar', 'Import Excel', 'Email support'],
    cta: 'Mulai Gratis',
    popular: false,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Basic',
    description: 'Untuk pemula serius',
    monthlyPrice: 74900,
    yearlyPrice: 749000,
    highlight: 'Terjangkau',
    features: ['3 campaign aktif', '500 email/hari', 'All templates', 'Basic analytics', 'Email support'],
    cta: 'Pilih Basic',
    popular: false,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Growth',
    description: 'Untuk bisnis berkembang',
    monthlyPrice: 149000,
    yearlyPrice: 1490000,
    highlight: 'Best Value',
    features: ['5 campaign aktif', '1,000 email/hari', 'All templates', 'SMTP custom', 'Priority support', 'Analytics dashboard'],
    cta: 'Pilih Growth',
    popular: true,
    gradient: 'from-primary-500 to-accent-500',
  },
  {
    name: 'Scale',
    description: 'Untuk bisnis besar',
    monthlyPrice: 499000,
    yearlyPrice: 4990000,
    highlight: 'Most Powerful',
    features: ['Unlimited campaign', '10,000 email/hari', 'White-label', 'API access', 'Dedicated support', 'Custom integrations'],
    cta: 'Pilih Scale',
    popular: false,
    gradient: 'from-amber-500 to-orange-500',
  },
]

const faqs = [
  {
    q: 'Apakah ada free trial?',
    a: 'Ya! Paket Starter kami gratis selamanya dengan 50 email per hari. Tidak perlu kartu kredit untuk mendaftar.',
  },
  {
    q: 'Bagaimana cara import kontak?',
    a: 'Super mudah! Cukup drag & drop file Excel atau CSV Anda. BlastMail akan otomatis mapping kolom dan validasi email.',
  },
  {
    q: 'Apakah email saya masuk spam?',
    a: 'BlastMail dilengkapi anti-spam technology dan SPF/DKIM authentication. Delivery rate kami konsisten di atas 99%.',
  },
  {
    q: 'Bisa pakai SMTP sendiri?',
    a: 'Tentu! Mulai dari paket Growth, Anda bisa connect SMTP sendiri seperti Gmail, SendGrid, atau Mailgun.',
  },
  {
    q: 'Ada garansi uang kembali?',
    a: 'Ya, semua paket berbayar memiliki garansi 14 hari uang kembali tanpa pertanyaan.',
  },
]

function formatRupiah(amount: number): string {
  if (amount === 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const statsRef = useInView(0.3)

  return (
    <div className="relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/50 via-[#0a0a0f] to-accent-950/30" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 rounded-full blur-[200px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 lg:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 lg:h-10" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            {['Fitur', 'Testimonial', 'Harga', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-pink-400 hover:text-white transition-colors px-4 py-2">
              Masuk
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white border-0 shadow-lg shadow-primary-500/25">
                Coba Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-pink-400 hover:text-white"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
            <nav className="flex flex-col p-4 space-y-2">
              {['Fitur', 'Testimonial', 'Harga', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-pink-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-pink-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Masuk
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span>Platform Email Marketing #1 di Indonesia</span>
                <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight text-white mb-6 animate-slide-up">
                Kirim Email yang{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Benar-Benar Dibaca
                  </span>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-pink-200 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
                Bukan sekadar kirim email massal. BlastMail membantu Anda membangun{' '}
                <span className="text-white font-semibold">koneksi nyata</span> dengan audiens melalui email yang personal dan tepat sasaran.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white border-0 shadow-2xl shadow-primary-500/30 text-lg px-8 py-6">
                    Mulai Gratis Sekarang
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-pink-400 text-pink-300 hover:bg-pink-500/10 hover:text-pink-200 text-lg px-8 py-6">
                  <Play className="h-5 w-5" />
                  Lihat Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-pink-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Setup 5 menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Tanpa kartu kredit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Cancel kapan saja</span>
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="mt-16 lg:mt-24 relative animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="relative rounded-2xl lg:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 shadow-2xl shadow-primary-500/10">
                <div className="rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 lg:p-8">
                  {/* Mock dashboard */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Live Dashboard
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Sent', value: '12,847', change: '+23%', color: 'text-primary-400' },
                      { label: 'Open Rate', value: '68.5%', change: '+12%', color: 'text-green-400' },
                      { label: 'Click Rate', value: '24.3%', change: '+8%', color: 'text-accent-400' },
                      { label: 'Conversions', value: '847', change: '+45%', color: 'text-yellow-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/5 p-4">
                        <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                        <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                        <p className="text-xs text-green-400">{stat.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-32 lg:h-48 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 flex items-end px-4 pb-4 gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-sm opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef.ref} className="py-20 border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((stat, index) => {
                const count = useCountUp(stat.value, 2000, statsRef.inView)
                return (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-4">
                      <stat.icon className="h-6 w-6 text-primary-400" />
                    </div>
                    <p className="text-4xl lg:text-5xl font-black text-white mb-2">
                      {count}{stat.suffix}
                    </p>
                    <p className="text-sm text-pink-300">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Powerful Features
              </p>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                Semua yang Anda Butuhkan,{' '}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Dalam Satu Platform
                </span>
              </h2>
              <p className="text-lg text-pink-300 max-w-2xl mx-auto">
                Dari lead management hingga analytics, BlastMail menyediakan semua tools untuk email marketing yang sukses.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
                >
                  {/* Gradient glow on hover */}
                  <div className={cn(
                    'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl',
                    `bg-gradient-to-br ${feature.gradient}`
                  )} style={{ transform: 'scale(0.8)' }} />

                  <div className={cn(
                    'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br mb-5',
                    feature.gradient
                  )}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-pink-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonial" className="py-20 lg:py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Testimonials
              </p>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                Dipercaya oleh{' '}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  10,000+ Marketer
                </span>
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8"
                >
                  <Quote className="h-8 w-8 text-primary-500/30 mb-4" />

                  <p className="text-pink-200 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-pink-300">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Simple Pricing
              </p>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                Harga yang{' '}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Masuk Akal
                </span>
              </h2>
              <p className="text-lg text-pink-300 max-w-2xl mx-auto mb-8">
                Mulai gratis, upgrade sesuai pertumbuhan bisnis Anda.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 p-1.5">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                    billingPeriod === 'monthly'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-pink-200 hover:text-white'
                  )}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    billingPeriod === 'yearly'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-pink-200 hover:text-white'
                  )}
                >
                  Tahunan
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    -17%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => {
                const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      'relative rounded-2xl border p-6 lg:p-8 transition-all duration-300',
                      plan.popular
                        ? 'border-primary-500/50 bg-gradient-to-b from-primary-500/10 to-transparent scale-105 shadow-2xl shadow-primary-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-1.5 text-xs font-semibold text-white">
                          <Star className="h-3 w-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <p className={cn(
                        'text-xs font-medium uppercase tracking-wider mb-2',
                        plan.popular ? 'text-primary-400' : 'text-pink-300'
                      )}>
                        {plan.highlight}
                      </p>
                      <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-sm text-pink-300">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">
                          {price === 0 ? 'Gratis' : formatRupiah(price)}
                        </span>
                        {price > 0 && (
                          <span className="text-pink-300">
                            /{billingPeriod === 'monthly' ? 'bln' : 'thn'}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-pink-200">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href={price === 0 ? '/signup' : '/login'}>
                      <Button
                        className={cn(
                          'w-full',
                          plan.popular
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white border-0 shadow-lg'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                        )}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Guarantee */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-green-500/10 border border-green-500/20 px-6 py-3">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  14 hari garansi uang kembali untuk semua paket berbayar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                FAQ
              </p>
              <h2 className="text-3xl lg:text-4xl font-black text-white">
                Pertanyaan yang Sering Ditanyakan
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-white">{faq.q}</span>
                    <ChevronDown className={cn(
                      'h-5 w-5 text-white/50 transition-transform',
                      openFaq === index && 'rotate-180'
                    )} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-pink-200 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

              <div className="relative px-6 py-16 lg:px-16 lg:py-24 text-center">
                <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                  Siap Tingkatkan Email Marketing Anda?
                </h2>
                <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
                  Bergabung dengan 10,000+ marketer yang sudah merasakan kemudahan BlastMail.
                  Mulai gratis, tanpa kartu kredit.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-white/90 shadow-2xl text-lg px-8 py-6">
                      Mulai Gratis Sekarang
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-white/20 text-white hover:bg-white/30 text-lg px-8 py-6">
                      Sudah Punya Akun? Masuk
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Logo className="h-8" />
                <span className="text-sm text-pink-400">by SAIKI Group</span>
              </div>

              <p className="text-sm text-pink-300">
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>

              <div className="flex items-center gap-6 text-sm text-pink-300">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
