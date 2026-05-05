import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  FileText,
  Target,
  BookOpen,
  Briefcase,
  Mic,
  MessageSquare,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Trophy,
} from "lucide-react"

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: progress },
    { data: cvs },
    { data: skills },
    { data: learningPaths },
    { data: interviews },
    { data: badges },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("user_progress").select("*").eq("user_id", userId).single(),
    supabase.from("cvs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("user_skills").select("*").eq("user_id", userId),
    supabase.from("learning_paths").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("interviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("user_badges").select("*, badges(*)").eq("user_id", userId),
  ])

  return {
    profile,
    progress,
    latestCv: cvs?.[0] || null,
    skills: skills || [],
    learningPath: learningPaths?.[0] || null,
    recentInterviews: interviews || [],
    earnedBadges: badges || [],
  }
}

const quickActions = [
  { href: "/dashboard/cv-analysis", label: "Upload CV", icon: FileText, description: "Get AI feedback on your resume" },
  { href: "/dashboard/skills", label: "Assess Skills", icon: Target, description: "Benchmark your abilities" },
  { href: "/dashboard/interview", label: "Practice Interview", icon: Mic, description: "Simulate real interviews" },
  { href: "/dashboard/mentor", label: "Chat with Mentor", icon: MessageSquare, description: "Get career advice" },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const data = await getDashboardData(user.id)
  const firstName = data.profile?.full_name?.split(" ")[0] || "there"

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your career development journey.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-orange-600">
            <Flame className="h-5 w-5" />
            <span className="font-medium">{data.progress?.streak_days || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
            <Star className="h-5 w-5" />
            <span className="font-medium">Level {data.progress?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.progress?.xp_points || 0}</div>
            <Progress value={(data.progress?.xp_points || 0) % 500 / 5} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {500 - ((data.progress?.xp_points || 0) % 500)} XP to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.skills.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.skills.filter(s => s.skill_level >= 70).length} at advanced level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentInterviews.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentInterviews.filter(i => i.completed).length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              Keep going to earn more!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.href} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CV Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CV Status
            </CardTitle>
            <CardDescription>Your resume analysis overview</CardDescription>
          </CardHeader>
          <CardContent>
            {data.latestCv ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ATS Score</span>
                  <span className="text-2xl font-bold text-primary">{data.latestCv.ats_score}%</span>
                </div>
                <Progress value={data.latestCv.ats_score} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Last updated: {new Date(data.latestCv.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/cv-analysis">View Details</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No CV uploaded yet</p>
                <Button asChild>
                  <Link href="/dashboard/cv-analysis">Upload Your CV</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Path Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Path
            </CardTitle>
            <CardDescription>Your personalized study plan</CardDescription>
          </CardHeader>
          <CardContent>
            {data.learningPath ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{data.learningPath.target_role}</h4>
                  <p className="text-sm text-muted-foreground">
                    Week {data.learningPath.current_week} of {data.learningPath.duration_weeks}
                  </p>
                </div>
                <Progress value={data.learningPath.progress_percentage} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {data.learningPath.progress_percentage}% complete
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/learning">Continue</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No learning path created yet</p>
                <Button asChild>
                  <Link href="/dashboard/learning">Create Learning Path</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Badges */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recent Interviews
            </CardTitle>
            <CardDescription>Your mock interview history</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentInterviews.length > 0 ? (
              <div className="space-y-3">
                {data.recentInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {interview.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{interview.role_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {interview.completed && (
                      <span className="text-sm font-medium text-primary">
                        {interview.overall_score}%
                      </span>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/interview">Practice More</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Mic className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No interviews yet</p>
                <Button asChild>
                  <Link href="/dashboard/interview">Start Practicing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Badges you&apos;ve earned</CardDescription>
          </CardHeader>
          <CardContent>
            {data.earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {data.earnedBadges.slice(0, 8).map((userBadge: any) => (
                  <div
                    key={userBadge.id}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5"
                    title={userBadge.badges?.description}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs text-center truncate w-full">
                      {userBadge.badges?.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No badges yet</p>
                <p className="text-sm text-muted-foreground">
                  Complete activities to earn badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
