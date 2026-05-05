"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Play,
  RefreshCw,
  Target,
  Trophy,
} from "lucide-react"

interface LearningPathViewerProps {
  learningPath: {
    id: string
    target_role: string
    duration_weeks: number
    difficulty: string
    current_week: number
    progress_percentage: number
    plan_data: {
      weeks: {
        week: number
        title: string
        description: string
        topics: string[]
        resources: {
          title: string
          type: string
          url: string
          duration?: string
        }[]
        milestones: string[]
        completed?: boolean
      }[]
    } | null
  }
  userId: string
}

export function LearningPathViewer({ learningPath, userId }: LearningPathViewerProps) {
  const [activeWeek, setActiveWeek] = useState(learningPath.current_week)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const weeks = learningPath.plan_data?.weeks || []
  const currentWeekData = weeks.find(w => w.week === activeWeek)

  const handleCompleteWeek = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningPathId: learningPath.id,
          userId,
          weekCompleted: activeWeek,
        }),
      })

      if (!response.ok) throw new Error("Failed to update progress")

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetPath = async () => {
    if (!confirm("Are you sure you want to create a new learning path?")) return
    
    try {
      await fetch("/api/learning/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningPathId: learningPath.id, userId }),
      })
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {learningPath.target_role}
              </CardTitle>
              <CardDescription>
                {learningPath.duration_weeks}-week {learningPath.difficulty} learning path
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetPath}>
              <RefreshCw className="mr-2 h-4 w-4" />
              New Path
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{learningPath.progress_percentage}%</span>
            </div>
            <Progress value={learningPath.progress_percentage} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Week {learningPath.current_week} of {learningPath.duration_weeks}</span>
              <span>{learningPath.duration_weeks - learningPath.current_week + 1} weeks remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weeks.map((week) => (
          <Button
            key={week.week}
            variant={activeWeek === week.week ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveWeek(week.week)}
            className="shrink-0"
          >
            {week.completed ? (
              <CheckCircle2 className="mr-1 h-4 w-4" />
            ) : week.week === learningPath.current_week ? (
              <Play className="mr-1 h-4 w-4" />
            ) : (
              <Circle className="mr-1 h-4 w-4" />
            )}
            Week {week.week}
          </Button>
        ))}
      </div>

      {/* Week Content */}
      {currentWeekData && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Week {currentWeekData.week}: {currentWeekData.title}</CardTitle>
                <CardDescription>{currentWeekData.description}</CardDescription>
              </div>
              {currentWeekData.completed && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="topics">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
              </TabsList>

              <TabsContent value="topics" className="mt-4">
                <div className="space-y-2">
                  {currentWeekData.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <div className="space-y-3">
                  {currentWeekData.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {resource.type}
                            {resource.duration && ` • ${resource.duration}`}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="mt-4">
                <div className="space-y-2">
                  {currentWeekData.milestones.map((milestone, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Trophy className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">{milestone}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {activeWeek === learningPath.current_week && !currentWeekData.completed && (
              <Button
                onClick={handleCompleteWeek}
                disabled={isUpdating}
                className="w-full mt-6"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Week as Complete
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
