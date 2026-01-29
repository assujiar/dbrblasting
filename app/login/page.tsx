import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          {isSignup ? 'Create an account' : 'Sign in to your account'}
        </h1>
        <form action={isSignup ? signup : login} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" required className="w-full" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" name="password" type="password" required className="w-full" />
          </div>
          <Button type="submit" className="w-full">
            {isSignup ? 'Sign up' : 'Log in'}
          </Button>
        </form>
        <p className="text-center text-sm">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignup((v) => !v)}
            className="text-accent font-medium hover:underline"
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}