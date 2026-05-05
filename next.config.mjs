/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mirror SUPABASE_* into NEXT_PUBLIC_* at build so the browser bundle can auth
  // when only integration-supplied SUPABASE_URL / SUPABASE_ANON_KEY exist on Vercel.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
