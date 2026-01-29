"use server"

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Logs in a user via Supabase Auth using email and password. When
 * successful, redirects to `/app`. On failure, throws an error that will
 * automatically populate the `error` field on the form.
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(error.message)
  }
  redirect('/app')
}

/**
 * Signs up a new user. After the user is created, they remain logged in and
 * redirected to `/app`. Supabase will send a confirmation email by default.
 */
export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    throw new Error(error.message)
  }
  redirect('/app')
}