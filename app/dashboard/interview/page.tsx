import { createClient } from "@/lib/supabase/server"
import { InterviewSimulator } from "@/components/interview/interview-simulator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Clock, CheckCircle2 } from "lucide-react"

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch recent interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch user skills for context
  const { data: skills } = await supabase
    .from("user_skills")
    .select("skill_name")
    .eq("user_id", user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Simulator</h1>
        <p className="text-muted-foreground">
          Practice mock interviews with AI and get instant feedback on your responses.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InterviewSimulator 
            userId={user.id} 
            userSkills={skills?.map(s => s.skill_name) || []}
          />
        </div>

        <div className="space-y-6">
          {/* Recent Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Interviews
              </CardTitle>
              <CardDescription>Your practice history</CardDescription>
            </CardHeader>
            <CardContent>
              {interviews && interviews.length > 0 ? (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {interview.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{interview.role_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(interview.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {interview.completed && (
                        <Badge variant="secondary">
                          {interview.overall_score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No interviews yet. Start practicing!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Interview Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Use the STAR method for behavioral questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Be specific with examples and metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Take a moment to think before answering
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Show enthusiasm and ask questions
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
