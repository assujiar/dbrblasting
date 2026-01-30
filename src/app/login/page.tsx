'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'error' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Invalid password', description: 'Password must be at least 6 characters.', variant: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'error' })
      setIsLoading(false)
      return
    }
    toast({ title: 'Welcome back!', description: 'You have successfully logged in.', variant: 'success' })
    router.push('/app')
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'error' })
      return
    }
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'error' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Invalid password', description: 'Password must be at least 6 characters.', variant: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'error' })
      setIsLoading(false)
      return
    }
    toast({ title: 'Account created!', description: 'Please check your email to verify your account.', variant: 'success' })
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
        <div className="rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={{
                color: mode === 'login' ? '#2563eb' : '#6b7280',
                borderBottom: mode === 'login' ? '2px solid #2563eb' : '2px solid transparent'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={{
                color: mode === 'signup' ? '#2563eb' : '#6b7280',
                borderBottom: mode === 'signup' ? '2px solid #2563eb' : '2px solid transparent'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827' }}
                  />
                </div>
              </div>
            )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: '#374151' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: '#2563eb' }}>
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
                <input
                  type="password"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#9ca3af' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
