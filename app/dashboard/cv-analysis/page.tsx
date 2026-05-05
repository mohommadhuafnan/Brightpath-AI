import { createClient } from "@/lib/supabase/server"
import { CVUploader } from "@/components/cv-analysis/cv-uploader"
import { CVResults } from "@/components/cv-analysis/cv-results"

export default async function CVAnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch latest CV
  const { data: cvs } = await supabase
    .from("cvs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const latestCv = cvs?.[0] || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CV Analysis</h1>
        <p className="text-muted-foreground">
          Upload your resume for AI-powered analysis and ATS optimization suggestions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CVUploader userId={user.id} existingCv={latestCv} />
        {latestCv && <CVResults cv={latestCv} />}
      </div>
    </div>
  )
}
