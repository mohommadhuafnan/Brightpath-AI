"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Briefcase, TrendingUp, AlertCircle, CheckCircle, XCircle, Sparkles, Building, MapPin, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react"

interface JobMatch {
  id: string
  job_title: string
  company: string
  description: string
  required_skills: string[]
  match_score: number
  skill_gaps: string[]
  matched_skills: string[]
  status: string
  created_at: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("job_matches")
      .select("*")
      .eq("user_id", user.id)
      .order("match_score", { ascending: false })

    if (data) {
      setJobs(data.map(job => ({
        ...job,
        required_skills: job.required_skills || [],
        skill_gaps: job.skill_gaps || [],
        matched_skills: []
      })))
    }
    setLoading(false)
  }

  async function analyzeJobMarket() {
    if (!targetRole.trim()) return
    setAnalyzing(true)

    try {
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole })
      })

      const data = await response.json()
      if (data.success) {
        await fetchJobs()
      }
    } catch (error) {
      console.error("Failed to analyze jobs:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  async function toggleSaved(jobId: string, currentStatus: string) {
    const newStatus = currentStatus === "saved" ? "new" : "saved"
    await supabase
      .from("job_matches")
      .update({ status: newStatus })
      .eq("id", jobId)

    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ))
  }

  const filteredJobs = jobs.filter(job =>
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const savedJobs = filteredJobs.filter(j => j.status === "saved")
  const newJobs = filteredJobs.filter(j => j.status !== "saved")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Matching</h1>
        <p className="text-muted-foreground mt-1">
          Find jobs that match your skills and identify gaps to fill
        </p>
      </div>

      {/* Analyze Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Job Market Analysis
          </CardTitle>
          <CardDescription>
            Enter a target role to find matching jobs and analyze your fit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="e.g., Frontend Developer, Data Scientist, DevOps Engineer..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeJobMarket()}
              className="flex-1"
            />
            <Button onClick={analyzeJobMarket} disabled={analyzing || !targetRole.trim()}>
              {analyzing ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Jobs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search saved jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Matches ({newJobs.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <JobList 
            jobs={newJobs} 
            loading={loading} 
            onToggleSaved={toggleSaved}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
        </TabsContent>

        <TabsContent value="saved">
          <JobList 
            jobs={savedJobs} 
            loading={loading} 
            onToggleSaved={toggleSaved}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function JobList({ 
  jobs, 
  loading, 
  onToggleSaved,
  getScoreColor,
  getScoreBg
}: { 
  jobs: JobMatch[]
  loading: boolean
  onToggleSaved: (id: string, status: string) => void
  getScoreColor: (score: number) => string
  getScoreBg: (score: number) => string
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <Empty
        icon={Briefcase}
        title="No job matches yet"
        description="Enter a target role above to find matching jobs"
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map(job => (
        <Card key={job.id} className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{job.job_title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building className="h-3 w-3" />
                  {job.company}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onToggleSaved(job.id, job.status)}
              >
                {job.status === "saved" ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Match Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Match Score</span>
                <span className={`font-bold ${getScoreColor(job.match_score)}`}>
                  {job.match_score}%
                </span>
              </div>
              <Progress value={job.match_score} className={`h-2 ${getScoreBg(job.match_score)}`} />
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {job.description}
            </p>

            {/* Skills */}
            <div className="space-y-3">
              {/* Required Skills */}
              <div>
                <span className="text-xs text-muted-foreground">Required Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.required_skills.slice(0, 5).map(skill => (
                    <Badge 
                      key={skill} 
                      variant={job.skill_gaps?.includes(skill) ? "outline" : "secondary"}
                      className={job.skill_gaps?.includes(skill) ? "border-destructive text-destructive" : ""}
                    >
                      {job.skill_gaps?.includes(skill) && <XCircle className="h-3 w-3 mr-1" />}
                      {!job.skill_gaps?.includes(skill) && <CheckCircle className="h-3 w-3 mr-1" />}
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {job.skill_gaps && job.skill_gaps.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Skills to develop
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skill_gaps.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs border-destructive/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
