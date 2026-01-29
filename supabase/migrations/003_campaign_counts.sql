-- Create a Postgres function to return campaigns with counts of recipients
create or replace function public.campaigns_with_counts()
returns table(
  id uuid,
  name text,
  status text,
  created_at timestamptz,
  total_count integer,
  sent_count integer,
  failed_count integer
) language sql stable as $$
  select c.id, c.name, c.status, c.created_at,
    (select count(*) from public.email_campaign_recipients r where r.campaign_id = c.id) as total_count,
    (select count(*) from public.email_campaign_recipients r where r.campaign_id = c.id and r.status = 'sent') as sent_count,
    (select count(*) from public.email_campaign_recipients r where r.campaign_id = c.id and r.status = 'failed') as failed_count
  from public.email_campaigns c
  where c.user_id = auth.uid();
$$;

-- Grant execute on the function to anon and authenticated roles
grant execute on function public.campaigns_with_counts() to anon, authenticated;