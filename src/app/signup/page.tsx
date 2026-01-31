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
import { Mail, Lock, User, Building2, ArrowRight, Sparkles, Check, Gift } from 'lucide-react'
import { isValidEmail, cn, generateSlug } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME } from '@/lib/constants'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'error' })
      return
    }
    if (!organizationName.trim()) {
      toast({ title: 'Organization required', description: 'Please enter your organization name.', variant: 'error' })
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

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // 2. Call the signup API to create organization and profile
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName,
          email,
          organizationName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete registration')
      }

      toast({
        title: 'Account created!',
        description: 'Welcome to BlastMail! Your free account is ready.',
        variant: 'success'
      })

      router.push('/app')
      router.refresh()
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const freeFeatures = [
    '1 email campaign',
    'Up to 5 recipients per day',
    'Basic email templates',
    'Free forever',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      {/* Animated background */}
      <div className="app-background" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 animate-slide-up">
          <img
            src={APP_LOGO_URL}
            alt={APP_NAME}
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-sm text-neutral-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            Start sending emails for free
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
          <div className="px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-success-50/50 to-accent-50/50">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-success-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Create Free Account</h2>
            </div>
            <p className="text-sm text-neutral-500 mt-1">Get started with our free tier</p>
          </div>

          {/* Free tier benefits */}
          <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="grid grid-cols-2 gap-2">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <Check className="h-3.5 w-3.5 text-success-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="p-5 sm:p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="organization"
                  type="text"
                  placeholder="My Company"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Sign in link */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
