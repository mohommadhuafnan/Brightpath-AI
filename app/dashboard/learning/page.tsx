import { createClient } from "@/lib/supabase/server"
import { LearningPathGenerator } from "@/components/learning/learning-path-generator"
import { LearningPathViewer } from "@/components/learning/learning-path-viewer"

export default async function LearningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch existing learning path
  const { data: learningPaths } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  // Fetch user skills for context
  const { data: skills } = await supabase
    .from("user_skills")
    .select("skill_name, skill_level")
    .eq("user_id", user.id)

  const currentPath = learningPaths?.[0] || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
        <p className="text-muted-foreground">
          Generate a personalized study plan to reach your career goals.
        </p>
      </div>

      {currentPath ? (
        <LearningPathViewer 
          learningPath={currentPath} 
          userId={user.id}
        />
      ) : (
        <LearningPathGenerator 
          userId={user.id} 
          userSkills={skills || []}
        />
      )}
    </div>
  )
}
