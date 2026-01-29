import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a browser Supabase client. The client uses the publishable
 * Supabase key and is safe to run in the browser. Do not expose
 * the service role key to the client. See the Supabase SSR guide for details【338567361119373†L230-L289】.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}