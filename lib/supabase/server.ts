import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseAnonKey, getSupabaseUrl } from "./env"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing: set SUPABASE_URL + SUPABASE_ANON_KEY (or NEXT_PUBLIC_*) in Vercel.",
    )
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
