import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

/** Dashboard requires cookies + Supabase; do not prerender at build without env. */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <SidebarProvider>
      <DashboardSidebar 
        user={{
          id: user.id,
          email: user.email || "",
          fullName: profile?.full_name || user.user_metadata?.full_name || "User",
          avatarUrl: profile?.avatar_url,
        }}
        progress={{
          xp: progress?.xp_points || 0,
          level: progress?.level || 1,
          streak: progress?.streak_days || 0,
        }}
      />
      <SidebarInset>
        <DashboardHeader 
          user={{
            fullName: profile?.full_name || user.user_metadata?.full_name || "User",
            email: user.email || "",
            avatarUrl: profile?.avatar_url,
          }}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
