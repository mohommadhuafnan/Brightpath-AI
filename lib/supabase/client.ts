import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseAnonKey, getSupabaseUrl } from "./env"

export function createClient() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing: set SUPABASE_URL + SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    )
  }
  return createBrowserClient(url, anonKey)
}
