import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

/**
 * This proxy runs on every request except for static assets. It refreshes the
 * Supabase session using the cookie stored in the request so that Server
 * Components always have a valid session. Without this, long‑lived sessions
 * may expire and `auth.getUser()` would return null.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclude static files, images and the login page from proxying
    '/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login).*)',
  ],
}