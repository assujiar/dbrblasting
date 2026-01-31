# Panduan SEO & Google Indexing untuk BlastMail

Panduan lengkap untuk mengoptimalkan BlastMail agar terindeks di Google dan mesin pencari lainnya.

## Daftar Isi

1. [Overview SEO BlastMail](#overview-seo-blastmail)
2. [Setup Google Search Console](#setup-google-search-console)
3. [Submit Sitemap](#submit-sitemap)
4. [Verifikasi Kepemilikan](#verifikasi-kepemilikan)
5. [Monitoring Indexing](#monitoring-indexing)
6. [Optimasi On-Page SEO](#optimasi-on-page-seo)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview SEO BlastMail

BlastMail sudah dilengkapi dengan setup SEO yang komprehensif:

### File SEO yang Sudah Ada

| File | Fungsi | Lokasi |
|------|--------|--------|
| `robots.txt` | Instruksi untuk crawler | `/public/robots.txt` |
| `sitemap.ts` | Sitemap dinamis | `/src/app/sitemap.ts` |
| `manifest.json` | PWA manifest | `/public/manifest.json` |
| `layout.tsx` | Metadata & JSON-LD | `/src/app/layout.tsx` |

### Metadata yang Sudah Diimplementasi

- **Title**: Template dengan format `%s | BlastMail`
- **Description**: Bilingual (ID & EN)
- **Keywords**: 100 keywords (50 ID + 50 EN)
- **Open Graph**: Facebook, LinkedIn sharing
- **Twitter Card**: Twitter sharing
- **Canonical URL**: Mencegah duplicate content
- **Alternate Languages**: ID & EN
- **JSON-LD**: SoftwareApplication, Organization, WebSite

### Halaman yang Diindeks

```
https://blastmail.saiki.id/          (Homepage - priority: 1.0)
https://blastmail.saiki.id/login     (Login - priority: 0.8)
https://blastmail.saiki.id/signup    (Signup - priority: 0.8)
```

### Halaman yang Tidak Diindeks (Disallow)

```
/api/*          (API endpoints)
/app/*          (Dashboard - requires auth)
/admin/*        (Admin panel)
/reset-password (Password reset)
/forgot-password (Forgot password)
```

---

## Setup Google Search Console

### Langkah 1: Buat Akun Google Search Console

1. Buka [Google Search Console](https://search.google.com/search-console)
2. Login dengan akun Google
3. Klik **"Add property"**

### Langkah 2: Pilih Jenis Property

Pilih **"URL prefix"** dan masukkan:
```
https://blastmail.saiki.id
```

### Langkah 3: Verifikasi Kepemilikan

Ada beberapa metode verifikasi:

#### Metode 1: HTML Tag (Recommended)

1. Copy meta tag dari Google Search Console
2. Tambahkan di `src/app/layout.tsx`:

```typescript
// Di bagian metadata
export const metadata: Metadata = {
  // ... metadata lainnya
  verification: {
    google: 'your-google-verification-code',
  },
}
```

3. Deploy dan klik **Verify**

#### Metode 2: HTML File

1. Download file HTML dari Google
2. Simpan di `/public/` folder
3. Deploy dan klik **Verify**

#### Metode 3: DNS Record

1. Tambahkan TXT record di DNS provider:
```
Type: TXT
Name: @
Value: google-site-verification=xxxxx
```

2. Tunggu propagasi DNS (hingga 48 jam)
3. Klik **Verify**

---

## Submit Sitemap

### Langkah 1: Akses Sitemap di Search Console

1. Buka Google Search Console
2. Pilih property `blastmail.saiki.id`
3. Klik **"Sitemaps"** di sidebar kiri

### Langkah 2: Submit Sitemap

1. Masukkan URL sitemap:
```
sitemap.xml
```

2. Klik **"Submit"**

### Langkah 3: Verifikasi

Google akan menampilkan:
- **Status**: Success / Error
- **Discovered URLs**: Jumlah URL yang ditemukan
- **Last read**: Waktu terakhir dibaca

### Cek Sitemap Manual

Buka browser dan akses:
```
https://blastmail.saiki.id/sitemap.xml
```

Anda akan melihat XML dengan daftar URL:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blastmail.saiki.id</loc>
    <lastmod>2024-01-31T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://blastmail.saiki.id/login</loc>
    <lastmod>2024-01-31T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

---

## Verifikasi Kepemilikan

### Untuk Google Search Console

Edit file `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... metadata lainnya

  verification: {
    google: 'your-google-verification-code', // Dari Search Console
    yandex: 'your-yandex-code', // Optional
    yahoo: 'your-yahoo-code', // Optional
    other: {
      'msvalidate.01': 'your-bing-code', // Bing Webmaster
    },
  },
}
```

### Untuk Bing Webmaster Tools

1. Buka [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://blastmail.saiki.id`
3. Verifikasi dengan meta tag atau XML file
4. Submit sitemap

---

## Monitoring Indexing

### Di Google Search Console

#### 1. Coverage Report

Path: **Index** → **Coverage**

- **Valid**: Halaman yang berhasil diindeks
- **Valid with warnings**: Diindeks tapi ada warning
- **Excluded**: Tidak diindeks (by design atau error)
- **Error**: Tidak bisa diindeks karena error

#### 2. URL Inspection

Path: **URL Inspection** di top bar

1. Masukkan URL yang ingin dicek
2. Lihat status indexing
3. Request indexing untuk URL baru

#### 3. Performance Report

Path: **Performance**

- **Total clicks**: Jumlah klik dari Google
- **Total impressions**: Jumlah tampil di hasil pencarian
- **Average CTR**: Click-through rate
- **Average position**: Rata-rata posisi di SERP

### Request Indexing Manual

Jika halaman baru belum terindeks:

1. Buka **URL Inspection**
2. Masukkan URL
3. Klik **"Request indexing"**
4. Tunggu beberapa hari

---

## Optimasi On-Page SEO

### 1. Meta Tags (Sudah Diimplementasi)

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'BlastMail - Platform Email Marketing',
    template: '%s | BlastMail',
  },
  description: 'Description yang menarik...',
  keywords: ['keyword1', 'keyword2', ...],
}
```

### 2. Heading Structure

Pastikan setiap halaman memiliki:
- **H1**: 1 saja per halaman (judul utama)
- **H2**: Sub-judul
- **H3-H6**: Sub-sub judul

### 3. Image Optimization

```tsx
// Gunakan Next.js Image dengan alt text
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="BlastMail - Email Marketing Platform Logo"
  width={200}
  height={50}
/>
```

### 4. Internal Linking

```tsx
import Link from 'next/link'

// Gunakan Link untuk internal navigation
<Link href="/signup">Daftar Sekarang</Link>
```

### 5. Content Quality

- Buat konten yang unik dan bermanfaat
- Gunakan keywords secara natural
- Update konten secara berkala

---

## Troubleshooting

### Halaman Tidak Terindeks

**Kemungkinan penyebab:**

1. **Robots.txt memblokir**
   - Cek `/robots.txt`
   - Pastikan tidak ada `Disallow` untuk halaman tersebut

2. **Meta robots noindex**
   - Cek apakah ada `<meta name="robots" content="noindex">`

3. **Canonical URL salah**
   - Pastikan canonical mengarah ke URL yang benar

4. **Halaman baru**
   - Tunggu beberapa hari atau request indexing manual

### Error di Search Console

| Error | Solusi |
|-------|--------|
| **Server error (5xx)** | Cek server logs, pastikan website up |
| **Redirect error** | Perbaiki redirect chain |
| **Soft 404** | Return 404 yang proper untuk halaman tidak ada |
| **Blocked by robots.txt** | Edit robots.txt |
| **Marked 'noindex'** | Hapus noindex tag |

### Cek Robots.txt

```bash
# Test robots.txt
curl https://blastmail.saiki.id/robots.txt
```

Output yang diharapkan:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /app/
Disallow: /admin/
...
```

### Cek Sitemap

```bash
# Test sitemap
curl https://blastmail.saiki.id/sitemap.xml
```

---

## Best Practices

### 1. Konten Landing Page

- **Above the fold**: Tampilkan value proposition utama
- **Call to action**: Button yang jelas (Daftar, Coba Gratis)
- **Social proof**: Testimonial, jumlah pengguna
- **Features**: Highlight fitur utama

### 2. Page Speed

Gunakan tools untuk cek:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://webpagetest.org/)

Tips optimasi:
- Compress images
- Lazy load images
- Minify CSS/JS (Next.js sudah handle)
- Use CDN (Vercel sudah include)

### 3. Mobile-Friendly

- Website harus responsive
- Test dengan [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- Gunakan viewport yang benar (sudah di layout.tsx)

### 4. HTTPS

- Selalu gunakan HTTPS
- Vercel sudah provide SSL gratis

### 5. Structured Data Testing

Test JSON-LD dengan:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### 6. Regular Monitoring

Jadwal rutin:
- **Weekly**: Cek Search Console untuk error
- **Monthly**: Review performance metrics
- **Quarterly**: Audit SEO keseluruhan

---

## Checklist SEO

### Setup Awal

- [ ] Setup Google Search Console
- [ ] Verifikasi kepemilikan website
- [ ] Submit sitemap
- [ ] Setup Bing Webmaster Tools (optional)

### Verifikasi

- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Meta tags lengkap
- [ ] JSON-LD valid
- [ ] Open Graph valid
- [ ] Twitter Card valid

### Monitoring

- [ ] Cek indexing status mingguan
- [ ] Monitor performance di Search Console
- [ ] Fix error yang muncul

### Optimasi

- [ ] Page speed > 90 di PageSpeed Insights
- [ ] Mobile-friendly test passed
- [ ] Structured data valid
- [ ] Internal linking baik

---

## Resources

### Tools

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Documentation

- [Google Search Central](https://developers.google.com/search)
- [Next.js SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org](https://schema.org/)

### Helpful Commands

```bash
# Check robots.txt
curl https://blastmail.saiki.id/robots.txt

# Check sitemap
curl https://blastmail.saiki.id/sitemap.xml

# Check specific URL headers
curl -I https://blastmail.saiki.id/

# Check mobile user-agent
curl -A "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)" https://blastmail.saiki.id/
```

---

## Kontak

Jika ada pertanyaan terkait SEO, hubungi tim SAIKI Group di [saiki.id](https://saiki.id).
