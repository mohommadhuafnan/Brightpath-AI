/**
 * Resolve Supabase URL and anon key.
 * Vercel/Supabase integrations often set SUPABASE_URL + SUPABASE_ANON_KEY only.
 * The browser normally only sees NEXT_PUBLIC_* — next.config.mjs mirrors the plain vars.
 */
export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  )
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ""
  )
}
