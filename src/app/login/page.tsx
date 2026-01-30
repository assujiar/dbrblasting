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
        <div className="glass-strong rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                mode === 'login'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="p-5 sm:p-6 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                {mode === 'login' && (
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
