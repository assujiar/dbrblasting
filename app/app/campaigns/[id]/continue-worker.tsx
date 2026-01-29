"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ContinueWorker({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/campaign/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error sending emails')
      } else {
        toast.success(`Processed ${data.processed} recipients`)
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button onClick={handleClick} disabled={loading}>{loading ? 'Sending…' : 'Continue sending'}</Button>
  )
}