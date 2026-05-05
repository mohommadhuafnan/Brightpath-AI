/** Avoid prerendering auth routes at build time when Supabase env vars are not available (e.g. CI). */
export const dynamic = "force-dynamic"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
