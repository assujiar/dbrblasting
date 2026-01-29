import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import ContinueWorker from './continue-worker'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface Params {
  params: { id: string }
}

export default async function CampaignDetail({ params }: Params) {
  const supabase = createServerSupabaseClient()
  const { data: campaign } = await supabase.from('email_campaigns').select('*').eq('id', params.id).single()
  if (!campaign) notFound()
  const { data: recipients } = await supabase
    .from('email_campaign_recipients')
    .select('id, to_email, to_name, status, error, sent_at')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: true })
  const total = recipients?.length ?? 0
  const sent = recipients?.filter((r) => r.status === 'sent').length ?? 0
  const failed = recipients?.filter((r) => r.status === 'failed').length ?? 0
  const pending = total - sent - failed
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{campaign.name}</h2>
      <p className="text-sm text-gray-600">Status: {campaign.status}</p>
      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${total > 0 ? (sent + failed) / total * 100 : 0}%` }}
        />
      </div>
      <p className="text-sm">
        {sent} sent, {failed} failed, {pending} pending
      </p>
      {pending > 0 && <ContinueWorker campaignId={campaign.id} />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Email</TableCell>
            <TableCell header>Name</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Error</TableCell>
            <TableCell header>Sent At</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell>{r.to_email}</TableCell>
              <TableCell>{r.to_name}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'sent' ? 'secondary' : r.status === 'failed' ? 'destructive' : 'default'}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell>{r.error ?? '-'}</TableCell>
              <TableCell>{r.sent_at ? new Date(r.sent_at).toLocaleString() : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}