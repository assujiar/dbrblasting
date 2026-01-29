import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabaseClient } from './lib/supabase/server'

/**
 * Middleware to protect the `/app` routes. If the user is not authenticated,
 * redirect to `/login`. This uses the Supabase session stored in cookies and
 * validates it by calling `auth.getUser()`【338567361119373†L301-L318】.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/app')) {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}