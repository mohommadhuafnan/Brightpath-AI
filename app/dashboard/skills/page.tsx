import { createClient } from "@/lib/supabase/server"
import { SkillsOverview } from "@/components/skills/skills-overview"
import { SkillAssessment } from "@/components/skills/skill-assessment"
import { SkillHeatmap } from "@/components/skills/skill-heatmap"

export default async function SkillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user skills
  const { data: skills } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", user.id)
    .order("skill_level", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Dashboard</h1>
        <p className="text-muted-foreground">
          Track your skills, identify gaps, and benchmark against industry standards.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkillsOverview skills={skills || []} />
        </div>
        <div>
          <SkillAssessment userId={user.id} />
        </div>
      </div>

      <SkillHeatmap skills={skills || []} />
    </div>
  )
}
