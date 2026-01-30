'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Mail, Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetComplete, setResetComplete] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({ title: 'Invalid password', description: 'Password must be at least 6 characters.', variant: 'error' })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both passwords are the same.', variant: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'error' })
      setIsLoading(false)
      return
    }
    setResetComplete(true)
    setIsLoading(false)
    setTimeout(() => router.push('/app'), 2000)
  }

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#2563eb' }} />
      </div>
    )
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{ background: '#2563eb' }}>
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>BlastMail</h1>
          </div>

          <div className="rounded-xl p-6 text-center" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Invalid or Expired Link</h2>
            <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
              This reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-white font-medium rounded-lg transition-colors hover:opacity-90"
              style={{ background: '#2563eb' }}
            >
              Request New Link
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm mt-6 hover:underline"
            style={{ color: '#6b7280' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{ background: '#2563eb' }}>
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>BlastMail</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Email Marketing Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-xl p-6" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          {resetComplete ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: '#dcfce7' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#16a34a' }} />
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Password Updated!</h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Redirecting you to the app...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Set New Password</h2>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{ background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{ background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                  style={{ background: '#2563eb' }}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        {!resetComplete && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm mt-6 hover:underline"
            style={{ color: '#6b7280' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        )}
      </div>
    </div>
  )
}
