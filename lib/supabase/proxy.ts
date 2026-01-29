import { type NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from './server'

/**
 * Middleware helper that refreshes the Supabase session and updates cookies.
 * It should be called from a Next.js proxy middleware (see proxy.ts).
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerSupabaseClient()
  // Refresh the session by calling getUser. This sends a request to
  // Supabase Auth and returns a new session if the old one is expired.
  await supabase.auth.getUser()
  return response
}