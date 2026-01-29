# BlastMail - Email Marketing Platform

A professional email blasting and marketing platform built with Next.js 16, Supabase, and TailwindCSS featuring a beautiful glassmorphism UI.

![BlastMail](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?style=flat-square&logo=vercel)

## Features

- **Authentication**: Secure login/signup with Supabase Auth
- **Lead Management**: CRUD operations for contacts with search and pagination
- **Contact Groups**: Organize leads into targeted groups (many-to-many)
- **Email Templates**: Create and manage HTML email templates with personalization
- **Email Campaigns**: Batch email sending with progress tracking
- **Campaign Logs**: Detailed send logs with status per recipient
- **Glassmorphism UI**: Modern, elegant design with blur effects and gradients

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS v4, Radix UI primitives
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (cookie-based sessions)
- **Email**: Nodemailer (SMTP)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- SMTP server credentials (Gmail, SendGrid, etc.)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd dbrblasting
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration script:

```sql
-- Copy contents from supabase/migrations/00001_initial_schema.sql
```

3. Get your project credentials from Settings > API:
   - Project URL
   - anon public key

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM_NAME=BlastMail
MAIL_FROM_EMAIL=your-email@gmail.com
```

#### Gmail SMTP Setup

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password: Google Account > Security > App passwords
3. Use the 16-character app password as `SMTP_PASS`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Create your account

1. Navigate to `/login`
2. Click "Sign Up" tab
3. Enter your details and create an account
4. Check your email for verification (if enabled in Supabase)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── leads/        # Lead CRUD
│   │   ├── groups/       # Group management
│   │   ├── templates/    # Template CRUD
│   │   ├── campaigns/    # Campaign management
│   │   └── worker/       # Email sending worker
│   ├── app/              # Protected app pages
│   │   ├── leads/
│   │   ├── groups/
│   │   ├── templates/
│   │   └── campaigns/
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Sidebar & Topbar
│   ├── leads/            # Lead components
│   ├── groups/           # Group components
│   ├── templates/        # Template components
│   └── campaigns/        # Campaign components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── email/            # Email sender
│   └── utils.ts          # Utility functions
└── types/
    └── database.ts       # TypeScript types
```

## Database Schema

### Tables

- **leads**: Contact information (name, email, company, phone)
- **contact_groups**: Group names
- **contact_group_members**: Many-to-many join table
- **email_templates**: Email templates (name, subject, html_body)
- **email_campaigns**: Campaign records with status
- **email_campaign_recipients**: Individual recipient status

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);
```

## Email Personalization

Use these placeholders in your templates:

- `{{name}}` - Recipient's name
- `{{company}}` - Recipient's company
- `{{email}}` - Recipient's email
- `{{phone}}` - Recipient's phone

Example:
```html
<p>Hello {{name}},</p>
<p>Thank you for your interest in our product at {{company}}.</p>
```

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Set the same variables from `.env.example` in your Vercel project settings.

## Email Sending Architecture

To avoid Vercel function timeouts, the app uses a worker pattern:

1. **Create Campaign**: Enqueues all recipients with `pending` status
2. **Worker Endpoint**: Processes 20 recipients per call
3. **Auto-polling**: UI automatically calls worker until complete
4. **Manual Continue**: Button to resume if needed

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Troubleshooting

### SMTP Connection Issues

- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password
- Check if your SMTP provider requires specific port/security settings

### Supabase Auth Issues

- Ensure Site URL is configured in Supabase Auth settings
- For local development, add `http://localhost:3000` to redirect URLs

### RLS Errors

- Make sure you're logged in
- Check that `user_id` is being set correctly on inserts

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
