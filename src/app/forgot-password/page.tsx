'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            BlastMail
          </h1>
          <p className="text-sm text-gray-500 mt-1">Email Marketing Platform</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-5 sm:p-6">
          {emailSent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-4">
                We sent a reset link to <span className="font-medium text-gray-700">{email}</span>
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Didn&apos;t receive it? Check spam or try again.
              </p>
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" loading={isLoading} className="w-full">
                  Send Reset Link
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
