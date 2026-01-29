-- Enable required extensions
create extension if not exists "pgcrypto";

-- leads table stores individual contacts for each user
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_lead_per_user unique (user_id, email)
);

-- contact groups allow users to organise leads in many‑to‑many groups
create table if not exists public.contact_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- join table linking leads to groups
create table if not exists public.contact_group_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.contact_groups(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_group_lead_per_user unique (user_id, group_id, lead_id)
);

-- email templates hold reusable HTML content
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  html_body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- campaigns represent a single send job using a template
create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.email_templates(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- recipients queued for a campaign
create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id),
  to_email text not null,
  to_name text,
  status text not null default 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_recipient_per_campaign unique (campaign_id, to_email)
);

-- Trigger to update updated_at on row modifications
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_leads before update on public.leads
for each row execute procedure public.touch_updated_at();
create trigger touch_contact_groups before update on public.contact_groups
for each row execute procedure public.touch_updated_at();
create trigger touch_contact_group_members before update on public.contact_group_members
for each row execute procedure public.touch_updated_at();
create trigger touch_email_templates before update on public.email_templates
for each row execute procedure public.touch_updated_at();
create trigger touch_email_campaigns before update on public.email_campaigns
for each row execute procedure public.touch_updated_at();
create trigger touch_email_campaign_recipients before update on public.email_campaign_recipients
for each row execute procedure public.touch_updated_at();