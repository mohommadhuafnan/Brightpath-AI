"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { FileDown, Award, Target, Briefcase, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"

interface ReportData {
  profile: {
    full_name: string
    email: string
    headline: string
    location: string
  }
  skills: { skill_name: string; skill_level: number; category: string }[]
  progress: { xp_points: number; level: number; streak_days: number }
  interviews: { overall_score: number }[]
  projects: { title: string }[]
  cvScore: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, skillsRes, progressRes, interviewsRes, projectsRes, cvsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_skills").select("*").eq("user_id", user.id),
      supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
      supabase.from("interviews").select("overall_score").eq("user_id", user.id).eq("completed", true),
      supabase.from("projects").select("title").eq("user_id", user.id),
      supabase.from("cvs").select("ats_score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
    ])

    setReportData({
      profile: profileRes.data || { full_name: "", email: user.email || "", headline: "", location: "" },
      skills: skillsRes.data || [],
      progress: progressRes.data || { xp_points: 0, level: 1, streak_days: 0 },
      interviews: interviewsRes.data || [],
      projects: projectsRes.data || [],
      cvScore: cvsRes.data?.[0]?.ats_score || 0
    })
    setLoading(false)
  }

  const calculateReadinessScore = () => {
    if (!reportData) return 0
    
    let score = 0
    
    // Skills (30 points)
    const avgSkillLevel = reportData.skills.length > 0
      ? reportData.skills.reduce((acc, s) => acc + s.skill_level, 0) / reportData.skills.length
      : 0
    score += (avgSkillLevel / 100) * 30
    
    // CV Score (20 points)
    score += (reportData.cvScore / 100) * 20
    
    // Interview Performance (20 points)
    const avgInterviewScore = reportData.interviews.length > 0
      ? reportData.interviews.reduce((acc, i) => acc + i.overall_score, 0) / reportData.interviews.length
      : 0
    score += (avgInterviewScore / 100) * 20
    
    // Projects (15 points)
    score += Math.min(reportData.projects.length * 3, 15)
    
    // Level/XP (15 points)
    score += Math.min(reportData.progress.level * 1.5, 15)
    
    return Math.round(score)
  }

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { label: "Job Ready", color: "text-green-500" }
    if (score >= 60) return { label: "Almost Ready", color: "text-yellow-500" }
    if (score >= 40) return { label: "Making Progress", color: "text-orange-500" }
    return { label: "Just Starting", color: "text-red-500" }
  }

  async function generatePDF() {
    setGenerating(true)
    
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `career-readiness-report-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const readinessScore = calculateReadinessScore()
  const readiness = getReadinessLabel(readinessScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Readiness Report</h1>
          <p className="text-muted-foreground mt-1">
            Generate a comprehensive PDF report of your job readiness
          </p>
        </div>
        <Button onClick={generatePDF} disabled={generating}>
          {generating ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>

      {/* Readiness Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Overall Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-8 border-muted flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${readiness.color}`}>{readinessScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Badge variant={readinessScore >= 60 ? "default" : "outline"} className="mb-2">
                  {readiness.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {readinessScore >= 80 
                    ? "Excellent! You have the skills and experience to confidently apply for positions."
                    : readinessScore >= 60
                    ? "Great progress! Focus on a few more areas to become fully job-ready."
                    : readinessScore >= 40
                    ? "You're on your way. Keep building your skills and completing activities."
                    : "Just getting started. Use our tools to build your skills and prepare for your career."}
                </p>
              </div>
              <Progress value={readinessScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <p className="text-2xl font-bold">{reportData?.skills.length || 0}</p>
              </div>
            </div>
            <div className="mt-3">
              {reportData && reportData.skills.length > 0 ? (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Avg: {Math.round(reportData.skills.reduce((a, s) => a + s.skill_level, 0) / reportData.skills.length)}%
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Add skills to improve
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CV Score</p>
                <p className="text-2xl font-bold">{reportData?.cvScore || 0}%</p>
              </div>
            </div>
            <div className="mt-3">
              {reportData && reportData.cvScore >= 70 ? (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  ATS Optimized
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Upload CV for analysis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">{reportData?.interviews.length || 0}</p>
              </div>
            </div>
            <div className="mt-3">
              {reportData && reportData.interviews.length > 0 ? (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Avg: {Math.round(reportData.interviews.reduce((a, i) => a + i.overall_score, 0) / reportData.interviews.length)}%
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Complete mock interviews
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{reportData?.projects.length || 0}</p>
              </div>
            </div>
            <div className="mt-3">
              {reportData && reportData.projects.length >= 3 ? (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Good portfolio
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Build more projects
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Breakdown */}
      {reportData && reportData.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Summary</CardTitle>
            <CardDescription>Your skill proficiency levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reportData.skills.slice(0, 9).map(skill => (
                <div key={skill.skill_name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">{skill.skill_name}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={skill.skill_level} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground w-8">{skill.skill_level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>What will be included in your PDF report</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Professional summary with your profile information
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Overall career readiness score and breakdown
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Complete skills inventory with proficiency levels
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Project portfolio summary
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Interview performance metrics
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Personalized recommendations for improvement
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
