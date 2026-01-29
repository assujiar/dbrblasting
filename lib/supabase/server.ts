import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Creates a server‑side Supabase client using the incoming request cookies.
 * The session is stored in httpOnly cookies so both server and client can
 * access the user. Always call `supabase.auth.getUser()` to validate
 * the token; do not rely on `getSession` alone【338567361119373†L301-L324】.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name, options)
        },
      },
      headers: {
        get(name: string) {
          return headers().get(name)
        },
      },
    }
  )
  return supabase
}