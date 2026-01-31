import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blastmail.saiki.id'

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: 'BlastMail - Platform Email Marketing & Email Blasting Indonesia',
    template: '%s | BlastMail',
  },
  description:
    'BlastMail adalah platform email marketing dan email blasting terbaik di Indonesia. Kirim email massal, kelola leads, buat template email profesional, dan pantau campaign dengan mudah. BlastMail is the best email marketing and email blasting platform. Send bulk emails, manage leads, create professional email templates, and track campaigns easily.',

  // Keywords - 50 Indonesian + 50 English
  keywords: [
    // ========== 50 Indonesian Keywords ==========
    'email marketing indonesia',
    'email blasting indonesia',
    'kirim email massal',
    'platform email marketing',
    'email blast indonesia',
    'bulk email indonesia',
    'email campaign indonesia',
    'kelola leads',
    'template email profesional',
    'email newsletter indonesia',
    'email automation indonesia',
    'email bisnis indonesia',
    'marketing digital indonesia',
    'promosi email massal',
    'broadcast email indonesia',
    'email massal murah',
    'aplikasi email marketing',
    'software email blasting',
    'layanan email marketing',
    'jasa email blast',
    'kirim email bulk',
    'email marketing terbaik',
    'platform blast email',
    'tool email marketing',
    'sistem email massal',
    'manajemen kontak email',
    'database email marketing',
    'email campaign manager',
    'pengelolaan leads',
    'template email html',
    'desain email marketing',
    'email marketing murah',
    'blast email gratis',
    'email marketing umkm',
    'email marketing bisnis kecil',
    'email marketing enterprise',
    'analytics email marketing',
    'laporan email campaign',
    'tracking email indonesia',
    'email deliverability',
    'smtp email marketing',
    'email marketing saas',
    'aplikasi blast email',
    'software kirim email massal',
    'email marketing otomatis',
    'personalisasi email',
    'segmentasi email',
    'a/b testing email',
    'email marketing roi',
    'konversi email marketing',
    // ========== 50 English Keywords ==========
    'email marketing platform',
    'email blasting software',
    'bulk email sender',
    'mass email service',
    'email campaign management',
    'lead management software',
    'email template builder',
    'email newsletter software',
    'email automation tool',
    'business email marketing',
    'digital marketing email',
    'email broadcast software',
    'affordable email marketing',
    'email marketing app',
    'email blasting service',
    'professional email marketing',
    'email outreach tool',
    'cold email software',
    'email list management',
    'email tracking software',
    'best email marketing platform',
    'bulk email marketing',
    'email marketing solution',
    'email marketing saas',
    'enterprise email marketing',
    'small business email marketing',
    'email marketing for startups',
    'email campaign software',
    'email marketing analytics',
    'email deliverability tool',
    'smtp email service',
    'transactional email',
    'marketing email platform',
    'email marketing automation',
    'drip email campaign',
    'email sequence builder',
    'contact management software',
    'subscriber management',
    'email personalization tool',
    'email segmentation software',
    'a/b testing email',
    'email marketing roi',
    'conversion email marketing',
    'email marketing dashboard',
    'real-time email tracking',
    'email open rate tracking',
    'click through rate email',
    'email bounce management',
    'multi-tenant email platform',
    'white label email marketing',
  ],

  // Authors and creator
  authors: [
    { name: 'SAIKI Group', url: 'https://saiki.id' },
    { name: 'BlastMail', url: siteUrl },
  ],
  creator: 'SAIKI Group',
  publisher: 'SAIKI Group',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/blastmail_saiki_mainlogo-horizontal-01.svg', type: 'image/svg+xml' },
    ],
    apple: '/blastmail_saiki_mainlogo-02-01.png',
    shortcut: '/blastmail_saiki_mainlogo-horizontal-01.svg',
  },

  // Manifest
  manifest: '/manifest.json',

  // Open Graph - for social sharing (Facebook, LinkedIn, etc)
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'BlastMail',
    title: 'BlastMail - Platform Email Marketing & Email Blasting Terbaik',
    description:
      'Platform email marketing dan email blasting profesional. Kirim email massal, kelola leads, buat template email, dan pantau campaign dengan mudah. Professional email marketing and blasting platform.',
    images: [
      {
        url: `${siteUrl}/blastmail_saiki_mainlogo-01.png`,
        width: 1200,
        height: 630,
        alt: 'BlastMail - Email Marketing Platform',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BlastMail - Platform Email Marketing & Email Blasting',
    description:
      'Platform email marketing dan email blasting profesional untuk bisnis Anda. Professional email marketing and blasting platform for your business.',
    images: [`${siteUrl}/blastmail_saiki_mainlogo-01.png`],
    creator: '@blastmail',
  },

  // Verification (add your verification codes here)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // Alternate languages
  alternates: {
    canonical: siteUrl,
    languages: {
      'id-ID': siteUrl,
      'en-US': siteUrl,
    },
  },

  // Category
  category: 'technology',

  // Other
  applicationName: 'BlastMail',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#db2777' },
  ],
}

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BlastMail',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Platform email marketing dan email blasting profesional untuk bisnis. Kirim email massal, kelola leads, buat template email, dan pantau campaign. Professional email marketing and blasting platform.',
  url: siteUrl,
  image: `${siteUrl}/blastmail_saiki_mainlogo-01.png`,
  author: {
    '@type': 'Organization',
    name: 'SAIKI Group',
    url: 'https://saiki.id',
  },
  developer: {
    '@type': 'Organization',
    name: 'SAIKI Group',
    url: 'https://saiki.id',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
    description: 'Free tier tersedia / Free tier available',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Email Blasting / Kirim Email Massal',
    'Lead Management / Kelola Kontak',
    'Email Template Builder / Pembuat Template Email',
    'Campaign Analytics / Analitik Campaign',
    'Excel Import / Import dari Excel',
    'Real-time Tracking / Pelacakan Real-time',
    'Multi-organization Support',
    'SMTP Configuration',
  ],
  inLanguage: ['id', 'en'],
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SAIKI Group',
  url: 'https://saiki.id',
  logo: `${siteUrl}/blastmail_saiki_mainlogo-01.png`,
  description:
    'SAIKI Group adalah perusahaan teknologi yang mengembangkan BlastMail, platform email marketing dan email blasting terbaik di Indonesia. SAIKI Group is a technology company that develops BlastMail, the best email marketing and email blasting platform.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Indonesian', 'English'],
  },
  owns: {
    '@type': 'Product',
    name: 'BlastMail',
    url: siteUrl,
    description: 'Platform email marketing dan email blasting profesional',
  },
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BlastMail',
  url: siteUrl,
  description:
    'Platform email marketing dan email blasting profesional. Professional email marketing and blasting platform.',
  inLanguage: ['id', 'en'],
  publisher: {
    '@type': 'Organization',
    name: 'SAIKI Group',
    url: 'https://saiki.id',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/app/leads?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
