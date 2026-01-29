import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build time
    // This prevents build errors when env vars are not available
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error('Not configured') }),
        signUp: async () => ({ data: null, error: new Error('Not configured') }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({ data: [], error: null, count: 0 }),
          order: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
          range: () => ({ data: [], error: null, count: 0 }),
          or: () => ({ data: [], error: null, count: 0 }),
          in: () => ({ data: [], error: null }),
          limit: () => ({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({ single: () => ({ data: null, error: null }) }),
        }),
        update: () => ({
          eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        }),
        delete: () => ({
          eq: () => ({ error: null }),
        }),
        upsert: () => ({
          select: () => ({ data: [], error: null }),
        }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
