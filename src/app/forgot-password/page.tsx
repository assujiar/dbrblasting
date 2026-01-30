'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'error' })
      setIsLoading(false)
      return
    }
    setEmailSent(true)
    setIsLoading(false)
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
          {emailSent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: '#dcfce7' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#16a34a' }} />
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Check your email</h2>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
                We sent a reset link to <span className="font-medium" style={{ color: '#374151' }}>{email}</span>
              </p>
              <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
                Didn&apos;t receive it? Check spam or try again.
              </p>
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-sm font-medium hover:underline"
                style={{ color: '#2563eb' }}
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Forgot password?</h2>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                  Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Send Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
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
