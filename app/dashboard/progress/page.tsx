"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Trophy, Star, Flame, Target, Award, Zap, 
  FileText, Briefcase, BookOpen, Mic, MessageSquare, FolderOpen,
  Lock, CheckCircle2
} from "lucide-react"

interface UserProgress {
  xp_points: number
  level: number
  streak_days: number
  last_activity_date: string | null
  achievements: string[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  xp_reward: number
  criteria: { action: string; count: number }
}

interface UserBadge {
  badge_id: string
  earned_at: string
}

const LEVEL_XP = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000]

const BADGE_ICONS: Record<string, React.ElementType> = {
  "file-text": FileText,
  "target": Target,
  "mic": Mic,
  "hammer": FolderOpen,
  "book-open": BookOpen,
  "flame": Flame,
  "briefcase": Briefcase,
  "search": Briefcase,
  "star": Star,
  "trophy": Trophy
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    cvCount: 0,
    skillCount: 0,
    interviewCount: 0,
    projectCount: 0,
    learningPaths: 0
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch user progress
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (progressData) {
      setProgress(progressData)
    }

    // Fetch all badges
    const { data: badgesData } = await supabase
      .from("badges")
      .select("*")

    if (badgesData) {
      setBadges(badgesData)
    }

    // Fetch user's earned badges
    const { data: userBadgesData } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user.id)

    if (userBadgesData) {
      setUserBadges(userBadgesData)
    }

    // Fetch activity stats
    const [cvs, skills, interviews, projects, learning] = await Promise.all([
      supabase.from("cvs").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("user_skills").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("interviews").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("projects").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("learning_paths").select("id", { count: "exact" }).eq("user_id", user.id)
    ])

    setStats({
      cvCount: cvs.count || 0,
      skillCount: skills.count || 0,
      interviewCount: interviews.count || 0,
      projectCount: projects.count || 0,
      learningPaths: learning.count || 0
    })

    setLoading(false)
  }

  const getCurrentLevelProgress = () => {
    if (!progress) return 0
    const currentLevelXP = LEVEL_XP[progress.level - 1] || 0
    const nextLevelXP = LEVEL_XP[progress.level] || LEVEL_XP[LEVEL_XP.length - 1]
    const xpInLevel = progress.xp_points - currentLevelXP
    const xpNeeded = nextLevelXP - currentLevelXP
    return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
  }

  const getXPToNextLevel = () => {
    if (!progress) return 0
    const nextLevelXP = LEVEL_XP[progress.level] || LEVEL_XP[LEVEL_XP.length - 1]
    return Math.max(0, nextLevelXP - progress.xp_points)
  }

  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId)
  }

  const getLevelTitle = (level: number) => {
    if (level <= 2) return "Beginner"
    if (level <= 4) return "Learner"
    if (level <= 6) return "Intermediate"
    if (level <= 8) return "Advanced"
    return "Job Ready Pro"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your journey to becoming job-ready
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Level Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Level {progress?.level || 1}
            </CardTitle>
            <CardDescription>{getLevelTitle(progress?.level || 1)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {progress?.xp_points || 0} XP
              </span>
              <span className="text-sm text-muted-foreground">
                {getXPToNextLevel()} XP to next level
              </span>
            </div>
            <Progress value={getCurrentLevelProgress()} className="h-3" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress?.xp_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress?.streak_days || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userBadges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> CVs Analyzed
              </span>
              <span className="font-semibold">{stats.cvCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Skills Added
              </span>
              <span className="font-semibold">{stats.skillCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Mic className="h-4 w-4" /> Interviews Done
              </span>
              <span className="font-semibold">{stats.interviewCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Projects Created
              </span>
              <span className="font-semibold">{stats.projectCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Learning Paths
              </span>
              <span className="font-semibold">{stats.learningPaths}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges Collection
          </CardTitle>
          <CardDescription>
            Earn badges by completing activities on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {badges.map(badge => {
              const earned = hasBadge(badge.id)
              const IconComponent = BADGE_ICONS[badge.icon] || Star
              
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    earned 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-muted/30 border-muted opacity-60"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    earned ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {earned ? (
                      <IconComponent className="h-6 w-6 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  <Badge variant={earned ? "default" : "outline"} className="mt-2">
                    {earned ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        +{badge.xp_reward} XP
                      </>
                    ) : (
                      `+${badge.xp_reward} XP`
                    )}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Level Guide</CardTitle>
          <CardDescription>XP required for each level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LEVEL_XP.slice(1).map((xp, i) => {
              const level = i + 1
              const isCurrentLevel = progress?.level === level
              const isPastLevel = (progress?.level || 1) > level
              
              return (
                <div
                  key={level}
                  className={`px-4 py-2 rounded-lg text-center ${
                    isCurrentLevel 
                      ? "bg-primary text-primary-foreground" 
                      : isPastLevel
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-medium">Level {level}</p>
                  <p className="text-sm font-bold">{xp.toLocaleString()} XP</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
