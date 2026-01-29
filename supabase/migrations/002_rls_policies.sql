-- Enable row level security on all user tables and define policies to
-- restrict data to the current authenticated user. If the user is not
-- authenticated, auth.uid() is null so the USING/with check clause fails【695454080474738†L180-L286】.

alter table public.leads enable row level security;
alter table public.contact_groups enable row level security;
alter table public.contact_group_members enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_campaign_recipients enable row level security;

-- leads policies
create policy "Leads: user can view own leads" on public.leads for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Leads: user can insert leads" on public.leads for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Leads: user can update own leads" on public.leads for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Leads: user can delete own leads" on public.leads for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- contact_groups policies
create policy "Groups: user can view own groups" on public.contact_groups for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Groups: user can insert groups" on public.contact_groups for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Groups: user can update own groups" on public.contact_groups for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Groups: user can delete own groups" on public.contact_groups for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- contact_group_members policies
create policy "Group members: user can view their memberships" on public.contact_group_members for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Group members: user can insert memberships" on public.contact_group_members for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Group members: user can update their memberships" on public.contact_group_members for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Group members: user can delete their memberships" on public.contact_group_members for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- email_templates policies
create policy "Templates: user can view own templates" on public.email_templates for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Templates: user can insert templates" on public.email_templates for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Templates: user can update own templates" on public.email_templates for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Templates: user can delete own templates" on public.email_templates for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- email_campaigns policies
create policy "Campaigns: user can view own campaigns" on public.email_campaigns for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Campaigns: user can insert campaigns" on public.email_campaigns for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Campaigns: user can update own campaigns" on public.email_campaigns for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Campaigns: user can delete own campaigns" on public.email_campaigns for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- email_campaign_recipients policies
create policy "Recipients: user can view their campaign recipients" on public.email_campaign_recipients for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Recipients: user can insert recipients for their campaigns" on public.email_campaign_recipients for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Recipients: user can update recipients for their campaigns" on public.email_campaign_recipients for update
  using (auth.uid() is not null and user_id = auth.uid());

create policy "Recipients: user can delete recipients for their campaigns" on public.email_campaign_recipients for delete
  using (auth.uid() is not null and user_id = auth.uid());