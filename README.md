# BlastMail - Email Marketing Platform

Platform email blasting multi-tenant dengan role-based access control (RBAC), dibangun dengan Next.js 16, Supabase, dan TailwindCSS.

![BlastMail](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?style=flat-square&logo=vercel)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Role-Based Access Control](#role-based-access-control)
- [API Routes](#api-routes)
- [SMTP Configuration](#smtp-configuration)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage Flow](#usage-flow)
- [Troubleshooting](#troubleshooting)

---

## Overview

BlastMail adalah platform email marketing yang memungkinkan organisasi mengirim email massal ke daftar kontak mereka. Platform ini mendukung:

- **Multi-tenant architecture**: Setiap organisasi memiliki data terpisah
- **Role-based access control**: Super Admin, Org Admin, dan User
- **Organization-level SMTP**: Setiap organisasi bisa punya konfigurasi SMTP sendiri
- **Email personalization**: Template dengan placeholder dinamis

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

### Organization Features
| Feature | Description |
|---------|-------------|
| **Multi-tenant** | Data terisolasi per organisasi |
| **SMTP per Org** | Setiap org bisa punya SMTP sendiri |
| **User Management** | Assign users ke organisasi |

### Admin Features
| Feature | Description |
|---------|-------------|
| **Super Admin Panel** | Kelola semua organizations dan users |
| **Create Users** | Buat user baru langsung dari admin panel |
| **SMTP Testing** | Test koneksi SMTP sebelum deploy |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  Next.js 16 App Router + React 19 + TailwindCSS                     │
├─────────────────────────────────────────────────────────────────────┤
│                           API LAYER                                  │
│  /api/leads    /api/groups    /api/templates    /api/campaigns      │
│  /api/admin/organizations    /api/admin/users    /api/worker        │
├─────────────────────────────────────────────────────────────────────┤
│                          AUTH LAYER                                  │
│  Supabase Auth (Cookie-based sessions) + RBAC Middleware            │
├─────────────────────────────────────────────────────────────────────┤
│                         DATABASE LAYER                               │
│  PostgreSQL (Supabase) + Row Level Security (RLS)                   │
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
│   API Route     │ → getAuthContext() → Check role
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase RLS   │ → Filter by user_id / organization_id
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
│ smtp_host        │       │ full_name        │
│ smtp_port        │       │ email            │
│ smtp_user        │       │ role             │
│ smtp_pass        │       │ ...              │
│ smtp_secure      │       └──────────────────┘
│ smtp_from_name   │
│ smtp_from_email  │
│ is_active        │
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
│ template_id (FK) │       │ to_email               │
│ name             │       │ to_name                │
│ status           │       │ status                 │
└──────────────────┘       │ error                  │
                           │ sent_at                │
                           └────────────────────────┘
```

### Tables Detail

#### `organizations`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization name |
| slug | TEXT | Unique URL slug |
| description | TEXT | Optional description |
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
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                          ORG_ADMIN                                   │
│  - Full access within their organization                            │
│  - Can view/manage users in their org                               │
│  - Can view organization's SMTP (read-only)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                            USER                                      │
│  - Access to their own data only                                    │
│  - Can create/edit/delete own leads, groups, templates, campaigns   │
│  - Can view data within same organization                           │
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
| SMTP Settings | ✅ CRUD | ✅ Read | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |

### RLS Policies

Database menggunakan Row Level Security (RLS) untuk memfilter data:

```sql
-- Example: Users can view leads in their organization
CREATE POLICY "Users can view leads" ON public.leads
  FOR SELECT
  USING (
    -- Super admin can see all
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    -- Owner can see own
    user_id = auth.uid()
    OR
    -- Same organization can see
    organization_id IN (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid())
  );
```

---

## API Routes

### Public Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/callback` | Supabase auth callback |

### Protected Routes (Requires Auth)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/leads` | List leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/[id]` | Get lead detail |
| PUT | `/api/leads/[id]` | Update lead |
| DELETE | `/api/leads/[id]` | Delete lead |
| POST | `/api/leads/import` | Import leads from Excel |
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

# 5. Setup database
# Go to Supabase Dashboard → SQL Editor
# Run migrations in order:
#   - supabase/migrations/001_create_tables.sql
#   - supabase/migrations/002_rls_policies.sql
#   - supabase/migrations/003_performance_indexes.sql
#   - supabase/migrations/004_user_profiles.sql
#   - supabase/migrations/005_fix_rls_policies.sql
#   - supabase/migrations/006_organizations_and_roles.sql

# 6. Create first super admin (after registering)
# Run in Supabase SQL Editor:
UPDATE public.user_profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';

# 7. Start development server
npm run dev
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
1. User register via /login
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
```

### 4. Email Sending Architecture

```
┌─────────────────┐
│ Create Campaign │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enqueue all     │
│ recipients with │
│ status=pending  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Worker endpoint │ ◄────│ Auto-polling    │
│ /api/worker/    │      │ from UI         │
│ send-emails     │      │ every 3 seconds │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Process batch   │
│ of 20 recipients│
│ with concurrency│
│ of 3            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update status   │
│ per recipient   │
│ (sent/failed)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ All done?       │
│ Update campaign │
│ status=completed│
└─────────────────┘
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/              # Admin-only endpoints
│   │   │   ├── organizations/  # Organization CRUD
│   │   │   └── users/          # User management
│   │   ├── auth/               # Auth callback
│   │   ├── campaigns/          # Campaign endpoints
│   │   ├── groups/             # Group endpoints
│   │   ├── leads/              # Lead endpoints
│   │   ├── profile/            # User profile
│   │   ├── templates/          # Template endpoints
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
│   └── layout.tsx              # Root layout
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
│   └── utils.ts                # Utility functions
├── types/
│   └── database.ts             # TypeScript types
└── supabase/
    └── migrations/             # SQL migration files
```

---

## Troubleshooting

### Admin Panel tidak muncul

1. Pastikan user memiliki `role = 'super_admin'` di `user_profiles`
2. Jalankan fix RLS policy:
```sql
DROP POLICY IF EXISTS "Users can view profiles" ON public.user_profiles;
CREATE POLICY "Users can view profiles" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());
```
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

### API Admin Error 500

1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah diset
2. Cek Vercel logs untuk detail error

---

## License

MIT License

---

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
