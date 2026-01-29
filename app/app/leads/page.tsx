import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import LeadList from './lead-list'

export const revalidate = 0 // revalidate on every request

export default async function LeadsPage() {
  const supabase = createServerSupabaseClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return <LeadList leads={leads ?? []} />
}