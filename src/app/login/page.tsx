'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { isValidEmail, cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      {/* Animated background */}
      <div className="app-background" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <img
            src={APP_LOGO_URL}
            alt={APP_NAME}
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-sm text-neutral-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            Email marketing made simple
          </p>
        </div>

        {/* Card */}
        <div className={cn(
          'rounded-2xl overflow-hidden animate-scale-in',
          'bg-white/80 backdrop-blur-xl',
          'border border-white/60',
          'shadow-xl shadow-neutral-900/10'
        )}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50/50 to-accent-50/50">
            <h2 className="text-lg font-semibold text-neutral-900">Welcome Back</h2>
            <p className="text-sm text-neutral-500">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Sign up link */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 text-center">
            <p className="text-sm text-neutral-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
