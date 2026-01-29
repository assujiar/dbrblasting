import { createServerSupabaseClient } from '@/lib/supabase/server'
import GroupList from './group-list'

export const revalidate = 0

export default async function GroupsPage() {
  const supabase = createServerSupabaseClient()
  const { data: groups } = await supabase.from('contact_groups').select('*').order('created_at', { ascending: false })
  const { data: leads } = await supabase.from('leads').select('*').order('name', { ascending: true })
  // Fetch group members with join to leads
  const { data: memberships } = await supabase
    .from('contact_group_members')
    .select('id, group_id, lead_id, leads ( name, email, company, phone )')
  return <GroupList groups={groups ?? []} leads={leads ?? []} memberships={memberships ?? []} />
}