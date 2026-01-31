# BlastMail - Email Marketing Platform

Platform email blasting multi-tenant dengan role-based access control (RBAC), comprehensive analytics dashboard, dan subscription tiers. Dibangun dengan Next.js 16, Supabase, dan TailwindCSS.

**Website:** [https://blastmail.saiki.id](https://blastmail.saiki.id)

**Developed by:** [SAIKI Group](https://saiki.id)

![BlastMail](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?style=flat-square&logo=vercel)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Analytics Dashboard](#analytics-dashboard)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Role-Based Access Control](#role-based-access-control)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Subscription Tiers](#subscription-tiers)
- [API Routes](#api-routes)
- [SMTP Configuration](#smtp-configuration)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Database Migrations](#database-migrations)
- [Deployment](#deployment)
- [Usage Flow](#usage-flow)
- [SEO & Metadata](#seo--metadata)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

BlastMail adalah platform email marketing profesional yang memungkinkan organisasi mengirim email massal ke daftar kontak mereka. Platform ini mendukung:

- **Multi-tenant architecture**: Setiap organisasi memiliki data terpisah
- **Role-based access control**: Super Admin, Org Admin, dan User
- **Organization-level SMTP**: Setiap organisasi bisa punya konfigurasi SMTP sendiri
- **Email personalization**: Template dengan placeholder dinamis
- **Comprehensive Analytics**: Dashboard analytics yang komprehensif dan insightful
- **Subscription Tiers**: Berbagai tier langganan dengan batasan fitur

---

## Features

### Core Features
| Feature | Description |
|---------|-------------|
| **Lead Management** | CRUD kontak dengan search, filter, dan pagination |
| **Contact Groups** | Organisir leads ke dalam grup (many-to-many) |
| **Email Templates** | Buat template HTML dengan WYSIWYG editor |
| **Email Campaigns** | Kirim email massal dengan progress tracking |
| **Campaign Analytics** | Log detail per recipient (sent, failed, pending) |
| **Import/Export** | Import leads dari Excel/CSV |

### Analytics Features
| Feature | Description |
|---------|-------------|
| **Overview Dashboard** | Total leads, groups, templates, campaigns |
| **Email Performance** | Delivery rate, success rate, failure rate |
| **Campaign Status** | Distribusi campaign berdasarkan status |
| **Weekly Comparison** | Perbandingan minggu ini vs minggu lalu |
| **Daily Activity** | Trend email harian dalam 14 hari terakhir |
| **Recent Campaigns** | Daftar campaign terbaru dengan statistik |
| **Monthly Summary** | Leads dan campaigns bulan ini |

### Organization Features
| Feature | Description |
|---------|-------------|
| **Multi-tenant** | Data terisolasi per organisasi |
| **SMTP per Org** | Setiap org bisa punya SMTP sendiri |
| **User Management** | Assign users ke organisasi |
| **Organization Logo** | Upload logo organisasi |
| **Subscription Tiers** | Free, Basic, Regular, Pro |

### Admin Features
| Feature | Description |
|---------|-------------|
| **Super Admin Panel** | Kelola semua organizations dan users |
| **Create Users** | Buat user baru langsung dari admin panel |
| **SMTP Testing** | Test koneksi SMTP sebelum deploy |
| **Notification System** | Sistem notifikasi real-time |

### User Features
| Feature | Description |
|---------|-------------|
| **Profile Management** | Update profile dan avatar |
| **Change Password** | Ubah password dari halaman profile |
| **Dark/Light Mode** | Toggle tema aplikasi |

---

## Analytics Dashboard

Dashboard BlastMail menyediakan analytics yang komprehensif dan insightful:

### Overview Stats
- **Total Leads**: Jumlah total kontak
- **Contact Groups**: Jumlah grup kontak
- **Email Templates**: Jumlah template email
- **Total Campaigns**: Jumlah campaign

### Email Performance
- **Delivered**: Email yang berhasil terkirim
- **Failed**: Email yang gagal
- **Pending**: Email yang menunggu diproses
- **Delivery Rate**: Persentase keberhasilan pengiriman
- **Failure Rate**: Persentase kegagalan

### Campaign Status Distribution
- **Completed**: Campaign yang sudah selesai
- **Running**: Campaign yang sedang berjalan
- **Draft**: Campaign dalam draft
- **Failed**: Campaign yang gagal

### Weekly Comparison
- Emails sent this week vs last week
- Campaigns created this week vs last week
- New leads this week vs last week
- Percentage change indicators

### Daily Activity Chart
- Bar chart email activity 14 hari terakhir
- Visualisasi sent vs failed emails
- Trend harian yang mudah dibaca

### Recent Campaigns
- 5 campaign terbaru
- Status, recipients, sent/failed counts
- Success rate per campaign

### Monthly Summary
- Leads added this month
- Campaigns created this month

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  Next.js 16 App Router + React 19 + TailwindCSS v4                 │
├─────────────────────────────────────────────────────────────────────┤
│                           API LAYER                                  │
│  /api/leads    /api/groups    /api/templates    /api/campaigns      │
│  /api/analytics    /api/admin/*    /api/worker    /api/profile      │
├─────────────────────────────────────────────────────────────────────┤
│                          AUTH LAYER                                  │
│  Supabase Auth (Cookie-based sessions) + RBAC Middleware            │
├─────────────────────────────────────────────────────────────────────┤
│                         DATABASE LAYER                               │
│  PostgreSQL (Supabase) + Row Level Security (RLS)                   │
│  SECURITY DEFINER Functions untuk bypass RLS                        │
├─────────────────────────────────────────────────────────────────────┤
│                          SMTP LAYER                                  │
│  Nodemailer → Organization SMTP / Fallback Env SMTP                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATIONS                                 │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   Org A         │   Org B         │   Org C                         │
│   - Users       │   - Users       │   - Users                       │
│   - Leads       │   - Leads       │   - Leads                       │
│   - Groups      │   - Groups      │   - Groups                      │
│   - Templates   │   - Templates   │   - Templates                   │
│   - Campaigns   │   - Campaigns   │   - Campaigns                   │
│   - SMTP Config │   - SMTP Config │   - SMTP Config                 │
│   - Tier: Pro   │   - Tier: Basic │   - Tier: Free                  │
└─────────────────┴─────────────────┴─────────────────────────────────┘
```

### Request Flow

```
User Request
    │
    ▼
┌─────────────────┐
│   Middleware    │ → Check auth cookies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Route     │ → getClientForUser() → Check role & org
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin Client   │ → Bypass RLS, manual org filtering
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │ → Return filtered data
└─────────────────┘
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.0 |
| **UI Library** | React 19 |
| **Styling** | TailwindCSS v4 |
| **UI Components** | Radix UI Primitives |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Email** | Nodemailer |
| **Icons** | Lucide React |
| **Deployment** | Vercel |
| **Image Handling** | Supabase Storage |

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│   organizations  │       │   user_profiles  │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────│ organization_id  │
│ name             │       │ id (PK)          │
│ slug (unique)    │       │ user_id (FK)     │──► auth.users
│ logo_url         │       │ full_name        │
│ description      │       │ email            │
│ subscription_tier│       │ role             │
│ smtp_*           │       │ ...              │
│ is_active        │       └──────────────────┘
└──────────────────┘
         │
         │ organization_id
         ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      leads       │       │  contact_groups  │       │ email_templates  │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ user_id          │       │ user_id          │       │ user_id          │
│ organization_id  │       │ organization_id  │       │ organization_id  │
│ name             │       │ name             │       │ name             │
│ email            │       │ description      │       │ subject          │
│ company          │       └────────┬─────────┘       │ html_body        │
│ phone            │                │                 └────────┬─────────┘
└────────┬─────────┘                │                          │
         │                          │                          │
         │         ┌────────────────┴────────────────┐         │
         │         │   contact_group_members         │         │
         │         ├─────────────────────────────────┤         │
         └────────►│ group_id (FK)                   │         │
                   │ lead_id (FK)                    │         │
                   │ user_id                         │         │
                   │ organization_id                 │         │
                   └─────────────────────────────────┘         │
                                                               │
┌──────────────────────────────────────────────────────────────┘
│
▼
┌──────────────────┐       ┌────────────────────────┐
│  email_campaigns │       │ email_campaign_recipients│
├──────────────────┤       ├────────────────────────┤
│ id (PK)          │◄──────│ campaign_id (FK)       │
│ user_id          │       │ id (PK)                │
│ organization_id  │       │ lead_id (FK)           │
│ template_id (FK) │       │ organization_id        │
│ name             │       │ to_email               │
│ status           │       │ to_name                │
└──────────────────┘       │ status                 │
                           │ error                  │
                           │ sent_at                │
                           └────────────────────────┘

┌────────────────────────┐       ┌──────────────────┐
│ organization_daily_usage│       │   notifications  │
├────────────────────────┤       ├──────────────────┤
│ id (PK)                │       │ id (PK)          │
│ organization_id (FK)   │       │ user_id (FK)     │
│ usage_date             │       │ title            │
│ emails_sent            │       │ message          │
└────────────────────────┘       │ type             │
                                 │ is_read          │
                                 └──────────────────┘
```

### Tables Detail

#### `organizations`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization name |
| slug | TEXT | Unique URL slug |
| description | TEXT | Optional description |
| logo_url | TEXT | Organization logo URL |
| subscription_tier | ENUM | free, basic, regular, pro |
| smtp_host | TEXT | SMTP server host |
| smtp_port | INTEGER | SMTP port (default: 587) |
| smtp_user | TEXT | SMTP username |
| smtp_pass | TEXT | SMTP password |
| smtp_secure | BOOLEAN | Use TLS (default: false) |
| smtp_from_name | TEXT | Sender display name |
| smtp_from_email | TEXT | Sender email address |
| is_active | BOOLEAN | Active status |

#### `user_profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| organization_id | UUID | FK to organizations |
| full_name | TEXT | User's full name |
| email | TEXT | User's email |
| phone | TEXT | Phone number |
| position | TEXT | Job title |
| company | TEXT | Company name |
| role | user_role | super_admin, org_admin, user |

#### `leads`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner user |
| organization_id | UUID | Owner organization |
| name | TEXT | Contact name |
| email | TEXT | Contact email |
| company | TEXT | Company name |
| phone | TEXT | Phone number |

#### `contact_groups`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner user |
| organization_id | UUID | Owner organization |
| name | TEXT | Group name |
| description | TEXT | Group description |

#### `email_templates`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner user |
| organization_id | UUID | Owner organization |
| name | TEXT | Template name |
| subject | TEXT | Email subject |
| html_body | TEXT | HTML content |

#### `email_campaigns`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner user |
| organization_id | UUID | Owner organization |
| template_id | UUID | FK to email_templates |
| name | TEXT | Campaign name |
| status | TEXT | draft, running, completed, failed |

#### `email_campaign_recipients`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK to email_campaigns |
| lead_id | UUID | FK to leads |
| organization_id | UUID | FK to organizations |
| to_email | TEXT | Recipient email |
| to_name | TEXT | Recipient name |
| status | TEXT | pending, sent, failed |
| error | TEXT | Error message if failed |
| sent_at | TIMESTAMP | When email was sent |

---

## Role-Based Access Control

### Roles Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPER_ADMIN                                  │
│  - Full access to all organizations                                 │
│  - Can create/edit/delete organizations                             │
│  - Can create/edit/delete all users                                 │
│  - Can assign users to organizations                                │
│  - Can configure SMTP per organization                              │
│  - Can view all analytics                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                          ORG_ADMIN                                   │
│  - Full access within their organization                            │
│  - Can view/manage users in their org                               │
│  - Can view organization's SMTP (read-only)                         │
│  - Can view org analytics                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                            USER                                      │
│  - Access to their own data only                                    │
│  - Can create/edit/delete own leads, groups, templates, campaigns   │
│  - Can view data within same organization                           │
│  - Can view personal analytics                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Access Matrix

| Resource | Super Admin | Org Admin | User |
|----------|-------------|-----------|------|
| All Organizations | ✅ CRUD | ❌ | ❌ |
| Own Organization | ✅ CRUD | ✅ Read | ✅ Read |
| All Users | ✅ CRUD | ❌ | ❌ |
| Org Users | ✅ CRUD | ✅ Read | ❌ |
| Own Profile | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| Leads | ✅ All | ✅ Org | ✅ Own + Org View |
| Groups | ✅ All | ✅ Org | ✅ Own + Org View |
| Templates | ✅ All | ✅ Org | ✅ Own + Org View |
| Campaigns | ✅ All | ✅ Org | ✅ Own + Org View |
| Analytics | ✅ All | ✅ Org | ✅ Org |
| SMTP Settings | ✅ CRUD | ✅ Read | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |

---

## Row Level Security (RLS)

### Strategi RLS

BlastMail menggunakan strategi kombinasi untuk menghindari infinite recursion RLS:

1. **SECURITY DEFINER Functions**: Helper functions yang bypass RLS untuk check role/org
2. **Admin Client**: API routes menggunakan admin client yang bypass RLS
3. **Manual Filtering**: API routes melakukan filtering berdasarkan organization_id

### Helper Functions

```sql
-- Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### RLS Policy Pattern

```sql
-- Example: Users can view leads
CREATE POLICY "Users can view leads" ON public.leads
  FOR SELECT
  USING (
    public.is_super_admin()
    OR
    user_id = auth.uid()
    OR
    (organization_id IS NOT NULL AND organization_id = public.get_user_organization_id())
  );
```

### API Route Pattern

```typescript
// Get client with user context (uses admin client internally)
const { client, user, profile } = await getClientForUser()

// Determine organization filter
const isSuperAdminWithoutOrg = profile?.role === 'super_admin' && !profile.organization_id
const orgId = !isSuperAdminWithoutOrg ? profile?.organization_id : null

// Build query with org filter
let query = client.from('leads').select('*')
if (orgId) {
  query = query.eq('organization_id', orgId)
}
```

---

## Subscription Tiers

### Tier Limits

| Tier | Max Campaigns | Max Recipients/Day | Watermark |
|------|---------------|-------------------|-----------|
| **Free** | 1 | 5 | ✅ Yes |
| **Basic** | 3 | 50 | ❌ No |
| **Regular** | 5 | 100 | ❌ No |
| **Pro** | 10 | 500 | ❌ No |

### Tier Functions

```sql
-- Get tier limits
SELECT * FROM public.get_tier_limits('basic');
-- Returns: max_campaigns=3, max_recipients_per_day=50, has_watermark=false

-- Check if org can send more emails
SELECT public.can_send_emails('org-uuid', 10);
-- Returns: true/false

-- Check if org can create more campaigns
SELECT public.can_create_campaign('org-uuid');
-- Returns: true/false

-- Increment daily email count (after sending)
SELECT public.increment_daily_email_count('org-uuid', 5);
```

---

## API Routes

### Public Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/callback` | Supabase auth callback |
| POST | `/api/auth/signup` | User registration |

### Protected Routes (Requires Auth)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/leads` | List leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/[id]` | Get lead detail |
| PUT | `/api/leads/[id]` | Update lead |
| DELETE | `/api/leads/[id]` | Delete lead |
| POST | `/api/leads/import` | Import leads from Excel |
| GET | `/api/leads/[id]/groups` | Get lead's groups |
| GET | `/api/leads/[id]/email-history` | Get lead's email history |
| GET | `/api/groups` | List groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/[id]` | Get group with members |
| PUT | `/api/groups/[id]` | Update group |
| DELETE | `/api/groups/[id]` | Delete group |
| POST | `/api/groups/[id]/members` | Add members to group |
| DELETE | `/api/groups/[id]/members` | Remove member from group |
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/[id]` | Get template |
| PUT | `/api/templates/[id]` | Update template |
| DELETE | `/api/templates/[id]` | Delete template |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/[id]` | Get campaign detail |
| DELETE | `/api/campaigns/[id]` | Delete campaign |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |
| POST | `/api/worker/send-emails` | Process email queue |
| POST | `/api/upload/image` | Upload image for email template |
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/[id]` | Mark notification as read |
| GET | `/api/organization/usage` | Get org usage stats |
| POST | `/api/organization/logo` | Upload org logo |

### Analytics Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics?type=overview` | Dashboard overview stats |
| GET | `/api/analytics?type=campaign_stats` | Campaign status distribution |
| GET | `/api/analytics?type=email_stats` | Email delivery statistics |
| GET | `/api/analytics?type=weekly_comparison` | Week-over-week comparison |
| GET | `/api/analytics?type=recent_campaigns` | Recent campaigns list |
| GET | `/api/analytics?type=top_campaigns` | Top performing campaigns |
| GET | `/api/analytics?type=daily_activity` | Daily email activity |
| GET | `/api/analytics?type=leads_growth` | Leads growth over time |

### Admin Routes (Super Admin Only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/organizations` | List all organizations |
| POST | `/api/admin/organizations` | Create organization |
| GET | `/api/admin/organizations/[id]` | Get organization detail |
| PUT | `/api/admin/organizations/[id]` | Update organization |
| DELETE | `/api/admin/organizations/[id]` | Delete organization |
| POST | `/api/admin/organizations/[id]/test-smtp` | Test SMTP connection |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/users/[id]` | Get user detail |
| PUT | `/api/admin/users/[id]` | Update user |
| DELETE | `/api/admin/users/[id]` | Delete user |

---

## SMTP Configuration

### Priority Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SMTP Resolution Flow                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   User sends campaign                                                │
│         │                                                            │
│         ▼                                                            │
│   ┌───────────────────────────────────────┐                         │
│   │ User has organization_id?              │                         │
│   └─────────────────┬─────────────────────┘                         │
│                     │                                                │
│         ┌───────────┴───────────┐                                   │
│         │ YES                   │ NO                                │
│         ▼                       │                                   │
│   ┌─────────────────────────┐   │                                   │
│   │ Org has SMTP configured? │   │                                   │
│   └───────────┬─────────────┘   │                                   │
│               │                 │                                   │
│     ┌─────────┴─────────┐       │                                   │
│     │ YES               │ NO    │                                   │
│     ▼                   │       │                                   │
│   ┌─────────────┐       │       │                                   │
│   │ Use Org     │       │       │                                   │
│   │ SMTP Config │       │       │                                   │
│   └─────────────┘       │       │                                   │
│                         ▼       ▼                                   │
│                   ┌─────────────────────┐                           │
│                   │ Use Environment     │                           │
│                   │ Variable SMTP       │                           │
│                   └─────────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Organization SMTP (via Admin Panel)

1. Login sebagai Super Admin
2. Buka **Admin Panel** → **Organizations**
3. Pilih/buat organisasi
4. Isi SMTP settings:
   - SMTP Host (e.g., `smtp.gmail.com`)
   - SMTP Port (e.g., `587`)
   - SMTP User (email)
   - SMTP Password
   - Use TLS (recommended: true for port 587)
   - From Name
   - From Email
5. Klik **Test Connection**
6. Simpan

### Fallback SMTP (Environment Variables)

Jika organisasi tidak punya SMTP config, sistem akan fallback ke env variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL
NEXT_PUBLIC_SITE_URL=https://blastmail.saiki.id

# Fallback SMTP (optional if all orgs have SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Variable Description

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (for admin API) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Website URL for SEO and links |
| `SMTP_HOST` | ⚠️ | Fallback SMTP host |
| `SMTP_PORT` | ⚠️ | Fallback SMTP port |
| `SMTP_SECURE` | ⚠️ | Use TLS (true/false) |
| `SMTP_USER` | ⚠️ | Fallback SMTP username |
| `SMTP_PASS` | ⚠️ | Fallback SMTP password |

⚠️ = Required if not all organizations have SMTP configured

---

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- SMTP credentials (Gmail, SendGrid, dll)

### Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd dbrblasting

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Edit .env.local with your credentials
nano .env.local

# 5. Setup database (see Database Migrations section)

# 6. Start development server
npm run dev
```

---

## Database Migrations

Jalankan migration secara berurutan di Supabase SQL Editor:

```
supabase/migrations/
├── 00001_initial_schema.sql
├── 001_create_tables.sql
├── 002_rls_policies.sql
├── 003_campaign_counts.sql
├── 004_user_profiles.sql
├── 005_performance_indexes.sql
├── 006_organizations_and_roles.sql
├── 007_create_first_super_admin.sql
├── 008_schema_fixes.sql
├── 009_add_reply_to.sql
├── 010_fix_rls_recursion.sql
├── 011_email_images_storage.sql
├── 012_subscription_tiers.sql
├── 013_org_logos_and_notifications.sql
├── 014_app_assets_bucket.sql
└── 015_analytics_functions.sql
```

### Create First Super Admin

Setelah register, jalankan di SQL Editor:

```sql
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

---

## Deployment

### Vercel Deployment

1. Push code ke GitHub
2. Connect repo ke Vercel
3. Set environment variables di Vercel Dashboard
4. Deploy

### Environment Variables di Vercel

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
NEXT_PUBLIC_SITE_URL = https://blastmail.saiki.id
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
```

---

## Usage Flow

### 1. Initial Setup (Super Admin)

```
1. Register account
2. Update role to super_admin (via SQL)
3. Login → Admin Panel muncul di sidebar
4. Create organizations
5. Configure SMTP per organization
6. Create users dan assign ke organizations
```

### 2. User Registration Flow

```
Option A: Self-registration
1. User register via /signup
2. User login
3. User update profile
4. Super Admin assign user ke organization (via Admin Panel)

Option B: Admin creates user
1. Super Admin → Admin Panel → Users → Add User
2. User langsung bisa login dengan credentials yang dibuat
```

### 3. Email Campaign Flow

```
1. User login
2. Import/add leads di Leads page
3. Create contact groups
4. Add leads ke groups
5. Create email template
6. Create campaign:
   - Pilih template
   - Pilih recipients (individual leads atau group)
   - Review dan send
7. Monitor progress di campaign detail
8. View analytics di Dashboard
```

---

## SEO & Metadata

BlastMail sudah di-optimize untuk SEO dengan:

### Metadata
- Title dengan template system
- Description dalam Bahasa Indonesia dan English
- Keywords (50+ dalam Bahasa Indonesia, 50+ dalam English)
- Open Graph untuk social sharing
- Twitter Card
- Canonical URLs
- Alternate languages

### Structured Data (JSON-LD)
- SoftwareApplication schema
- Organization schema
- WebSite schema dengan SearchAction

### Technical SEO
- `robots.txt` untuk crawler rules
- `sitemap.xml` dinamis
- `manifest.json` untuk PWA

### Files
- `/public/robots.txt` - Crawler rules
- `/public/manifest.json` - PWA manifest
- `/src/app/sitemap.ts` - Dynamic sitemap
- `/src/app/layout.tsx` - Metadata & JSON-LD

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/              # Admin-only endpoints
│   │   │   ├── organizations/  # Organization CRUD
│   │   │   └── users/          # User management
│   │   ├── analytics/          # Analytics endpoint
│   │   ├── auth/               # Auth callback & signup
│   │   ├── campaigns/          # Campaign endpoints
│   │   ├── groups/             # Group endpoints
│   │   ├── leads/              # Lead endpoints
│   │   ├── notifications/      # Notification endpoints
│   │   ├── organization/       # Org usage & logo
│   │   ├── profile/            # User profile
│   │   ├── templates/          # Template endpoints
│   │   ├── upload/             # Image upload
│   │   └── worker/             # Email worker
│   ├── admin/                  # Admin panel pages
│   │   ├── organizations/      # Org management UI
│   │   └── users/              # User management UI
│   ├── app/                    # Main app pages
│   │   ├── campaigns/
│   │   ├── groups/
│   │   ├── leads/
│   │   ├── profile/
│   │   └── templates/
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── forgot-password/        # Forgot password
│   ├── reset-password/         # Reset password
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout with SEO
│   └── sitemap.ts             # Dynamic sitemap
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── layout/                 # App shell, sidebar, topbar
│   ├── leads/                  # Lead-specific components
│   ├── groups/                 # Group-specific components
│   ├── templates/              # Template components
│   └── campaigns/              # Campaign components
├── lib/
│   ├── auth/                   # RBAC utilities
│   ├── email/                  # Email sender
│   ├── supabase/               # Supabase clients
│   │   ├── server.ts           # Server client
│   │   ├── admin.ts            # Admin client
│   │   └── client.ts           # Browser client
│   └── utils.ts                # Utility functions
├── types/
│   └── database.ts             # TypeScript types
├── public/
│   ├── robots.txt              # Crawler rules
│   ├── manifest.json           # PWA manifest
│   └── ...logos & assets
└── supabase/
    └── migrations/             # SQL migration files
```

---

## Troubleshooting

### Admin Panel tidak muncul

1. Pastikan user memiliki `role = 'super_admin'` di `user_profiles`
2. Jalankan migration `010_fix_rls_recursion.sql`
3. Logout dan login kembali

### SMTP Connection Failed

1. Verify credentials di organization settings
2. Untuk Gmail, gunakan App Password (bukan password biasa)
3. Pastikan port dan TLS setting benar:
   - Port 587 + TLS = `smtp_secure: false`
   - Port 465 + SSL = `smtp_secure: true`

### User tidak bisa lihat data

1. Pastikan user sudah di-assign ke organization
2. Cek apakah organization `is_active = true`
3. Verify RLS policies aktif

### API Error 500

1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah diset
2. Cek Vercel/server logs untuk detail error
3. Pastikan semua migrations sudah dijalankan

### Analytics tidak muncul

1. Jalankan migration `015_analytics_functions.sql`
2. Pastikan user sudah login
3. Cek browser console untuk error

### RLS Infinite Recursion

1. Pastikan migration `010_fix_rls_recursion.sql` sudah dijalankan
2. Gunakan `getClientForUser()` di API routes
3. Jangan query `user_profiles` langsung dengan RLS enabled

---

## Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License

---

## Credits

**Developed by [SAIKI Group](https://saiki.id)**

BlastMail - Platform Email Marketing & Email Blasting Terbaik di Indonesia
