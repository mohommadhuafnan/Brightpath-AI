import { createClient } from "@/lib/supabase/server"
import { MentorChat } from "@/components/mentor/mentor-chat"

export default async function MentorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user profile and skills for context
  const [{ data: profile }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_skills").select("*").eq("user_id", user.id),
  ])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Career Mentor</h1>
        <p className="text-muted-foreground">
          Get personalized career advice, interview tips, and guidance from your AI mentor.
        </p>
      </div>

      <MentorChat 
        userId={user.id}
        userContext={{
          name: profile?.full_name || "User",
          skills: skills?.map(s => s.skill_name) || [],
          headline: profile?.headline || "",
        }}
      />
    </div>
  )
}
