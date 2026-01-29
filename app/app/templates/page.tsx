import { createServerSupabaseClient } from '@/lib/supabase/server'
import TemplateList from './template-list'

export const revalidate = 0

export default async function TemplatesPage() {
  const supabase = createServerSupabaseClient()
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false })
  const { data: leads } = await supabase.from('leads').select('*').order('name', { ascending: true })
  const { data: groups } = await supabase.from('contact_groups').select('*')
  const { data: memberships } = await supabase
    .from('contact_group_members')
    .select('id, group_id, lead_id, leads ( name, email, company, phone )')
  return <TemplateList templates={templates ?? []} leads={leads ?? []} groups={groups ?? []} memberships={memberships ?? []} />
}