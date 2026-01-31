import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blast-mail.vercel.app'

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: 'BlastMail - Platform Email Marketing & Email Blasting Indonesia',
    template: '%s | BlastMail',
  },
  description:
    'BlastMail adalah platform email marketing dan email blasting terbaik di Indonesia. Kirim email massal, kelola leads, buat template email profesional, dan pantau campaign dengan mudah. BlastMail is the best email marketing and email blasting platform. Send bulk emails, manage leads, create professional email templates, and track campaigns easily.',

  // Keywords - Indonesian & English
  keywords: [
    // Indonesian keywords
    'email marketing indonesia',
    'email blasting indonesia',
    'kirim email massal',
    'platform email marketing',
    'email blast',
    'bulk email',
    'email campaign',
    'kelola leads',
    'template email',
    'email newsletter',
    'email automation',
    'email bisnis',
    'marketing digital',
    'promosi email',
    'broadcast email',
    'email massal murah',
    'aplikasi email marketing',
    'software email blasting',
    'layanan email marketing',
    'jasa email blast',
    // English keywords
    'email marketing platform',
    'email blasting software',
    'bulk email sender',
    'mass email service',
    'email campaign management',
    'lead management',
    'email template builder',
    'email newsletter software',
    'email automation tool',
    'business email marketing',
    'digital marketing email',
    'email broadcast',
    'affordable email marketing',
    'email marketing app',
    'email blasting service',
    'professional email marketing',
    'email outreach',
    'cold email software',
    'email list management',
    'email tracking',
  ],

  // Authors and creator
  authors: [{ name: 'BlastMail', url: siteUrl }],
  creator: 'BlastMail',
  publisher: 'BlastMail',

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
      { url: '/favicon.ico', sizes: 'any' },
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
    name: 'BlastMail',
    url: siteUrl,
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
  name: 'BlastMail',
  url: siteUrl,
  logo: `${siteUrl}/blastmail_saiki_mainlogo-01.png`,
  description:
    'BlastMail adalah platform email marketing dan email blasting terbaik di Indonesia. BlastMail is the best email marketing and email blasting platform.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Indonesian', 'English'],
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
