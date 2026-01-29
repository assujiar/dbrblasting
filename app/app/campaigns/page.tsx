import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function CampaignsPage() {
  const supabase = createServerSupabaseClient()
  // Fetch campaigns with counts of sent and total recipients
  const { data: campaigns } = await supabase.rpc('campaigns_with_counts')
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Campaigns</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Campaign</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Progress</TableCell>
            <TableCell header>Created</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(campaigns ?? []).map((c: any) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/app/campaigns/${c.id}`} className="text-accent hover:underline">
                  {c.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={c.status === 'completed' ? 'secondary' : c.status === 'failed' ? 'destructive' : 'default'}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell>
                {c.sent_count}/{c.total_count}
              </TableCell>
              <TableCell>{new Date(c.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}