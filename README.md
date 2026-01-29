# Email Blasting Promo App

This repository contains a complete production‑ready web application for managing leads, building reusable email templates and sending promotional email blasts. It uses **Next.js App Router** (targeting Next .js 16.1.x) with **TypeScript**, **Supabase** (Postgres + Auth) and **TailwindCSS**/shadcn for the UI. The app is designed to be deployed to **Vercel** and ships with SQL migrations, row level security (RLS) policies, a clean glassmorphic UI and background email processing via Nodemailer.

## Features

* **Authentication** – login and signup pages powered by Supabase Auth. Protected routes automatically redirect unauthenticated users to `/login`. Supabase sessions are stored in cookies using `@supabase/ssr`, following the recommendations from the Supabase Next.js guide【338567361119373†L230-L318】.
* **Lead Management** – create, update, delete and list leads. Each lead stores a name, company, email and phone number. Data is scoped per user via RLS; policies restrict every operation to rows where `user_id = auth.uid()`【695454080474738†L180-L244】.
* **Contact Groups** – users can organise leads into their own groups (many‑to‑many). Adding or removing a lead from a group updates a join table. Groups are private to each user.
* **Email Templates** – maintain a library of templates with a friendly name, subject and HTML body. Templates use simple placeholders like `{{name}}`, `{{company}}`, `{{email}}` and `{{phone}}` that are replaced on the server when sending emails.
* **Campaigns & Logs** – send a template to multiple recipients (leads or groups) and track the delivery status. The UI shows progress as messages are queued, sent or fail. Each campaign is a separate record with child recipient rows recording the result.
* **Background email processing** – when you click **Send**, the system creates a campaign and enqueues recipient rows with status `pending`. A worker route (`/api/campaign/worker`) processes recipients in small batches (default 20). This pattern avoids hitting Vercel’s function timeouts by returning quickly and continuing work asynchronously【679579239636242†L94-L114】.
* **Modern UI** – the interface uses a light glassmorphic theme with gradient backgrounds, blurred translucent panels and colourful accents. All components (buttons, inputs, tables, dialogs, dropdowns, tabs and toasts) live in `components/ui` for reusability. Icons from `lucide-react` enhance the navigation and action buttons.

## Getting Started

### Prerequisites

* **Node.js ≥ 18** and **npm**
* A **Supabase** project. You can create one for free at [supabase.com](https://supabase.com/).
* A **SMTP** server for sending emails. Gmail, Mailgun, SendGrid and many others provide SMTP credentials. Keep credentials secure by loading them from environment variables instead of hardcoding them【549306875252446†L326-L364】.

### Local Setup

1. Clone this repository and install dependencies:

   ```sh
   git clone https://github.com/your‑org/email-blasting-app.git
   cd email-blasting-app
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your environment variables:

   ```sh
   cp .env.example .env.local
   ```

   You need your Supabase URL and publishable key, plus SMTP settings and the default “from” name and email. Do **not** commit `.env.local` to version control.

3. Link the project to your Supabase instance and apply migrations:

   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   The SQL scripts under `supabase/migrations` create the required tables and RLS policies. RLS is enabled for every table and policies ensure users can only operate on rows where `user_id` matches `auth.uid()`【695454080474738†L180-L286】.

4. Run the development server:

   ```sh
   npm run dev
   ```

   Visit `http://localhost:3000` in your browser. You should see the login page. Sign up or log in to access the app.

### Deployment

This project is designed for **Vercel**. Push your code to a GitHub repository and import it into Vercel. Set the environment variables in the Vercel dashboard (same as `.env.example`). Vercel automatically deploys the Next.js app. The route handlers use the Edge Runtime by default, but the email worker may run longer; you can enable Fluid Compute or adjust the `maxDuration` if necessary【679579239636242†L94-L113】.

### Migrations

Supabase migrations live in `supabase/migrations`. They are numbered in chronological order. The initial migration (`001_create_tables.sql`) sets up all tables and unique constraints. The second migration (`002_rls_policies.sql`) enables RLS and defines policies restricting access to each user’s data. If you add new tables, create a new SQL file with a higher prefix and run `supabase db push` again.

### Scripts

This project defines several npm scripts:

| Command           | Description                                   |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start the Next.js dev server on `localhost:3000`. |
| `npm run build`   | Build the production version of the app.       |
| `npm run start`   | Start the Next.js production server.            |
| `npm run lint`    | Run ESLint over the codebase.                   |

### File Tree

The repository is organised as follows:

```
email-blasting-app/
├── app/                 # Next.js app directory (App Router)
│   ├── layout.tsx       # Root layout with global styles
│   ├── globals.css      # Tailwind and custom CSS (gradients, noise)
│   ├── login/           # Public login/signup page
│   └── app/             # Protected area under /app
│       ├── layout.tsx   # Layout with sidebar and topbar
│       ├── page.tsx     # Redirect to Leads by default
│       ├── leads/       # Leads CRUD pages
│       ├── groups/      # Contact groups pages
│       ├── templates/   # Email template pages
│       └── campaigns/   # Campaign list and details
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Modal, Tabs, Table, Toast)
│   └── Shell.tsx        # Sidebar + topbar container used in /app
├── lib/
│   ├── supabase/        # Supabase clients and helpers (browser & server)
│   ├── email.ts         # Nodemailer setup and send logic
│   └── utils.ts         # Helper functions (template parsing, etc.)
├── middleware.ts        # Redirect middleware for protected routes
├── tailwind.config.ts   # Tailwind theme and glassmorphism tokens
├── postcss.config.js    # PostCSS configuration for Tailwind
├── next.config.mjs      # Next.js configuration (ESM)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .env.example         # Example environment variables
└── supabase/
    └── migrations/      # Database migrations and RLS policies
```

## Security Considerations

* The client uses the **publishable** Supabase key. Server‑side code always runs with the user’s session token and never uses the service role key directly. All secrets (Supabase keys, SMTP credentials) are loaded from environment variables and never exposed to the browser【549306875252446†L326-L364】.
* Row Level Security is enabled on all tables and each policy checks that `auth.uid()` is not null and matches `user_id`【695454080474738†L180-L286】. An unauthenticated user cannot access any data.
* The UI sanitises template previews to prevent injection; placeholders are replaced server‑side.

## Contributing

Feel free to open issues or submit pull requests. This project aims to be a high‑quality reference implementation for building multi‑tenant email blasting applications with Next.js and Supabase.
