"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Award } from "lucide-react"

interface Skill {
  id: string
  skill_name: string
  skill_level: number
  category: string | null
  verified: boolean
}

interface SkillsOverviewProps {
  skills: Skill[]
}

function getSkillColor(level: number) {
  if (level >= 80) return "bg-green-500"
  if (level >= 60) return "bg-yellow-500"
  if (level >= 40) return "bg-orange-500"
  return "bg-red-500"
}

function getSkillLabel(level: number) {
  if (level >= 80) return "Advanced"
  if (level >= 60) return "Intermediate"
  if (level >= 40) return "Basic"
  return "Beginner"
}

export function SkillsOverview({ skills }: SkillsOverviewProps) {
  const categories = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.skill_level, 0) / skills.length)
    : 0

  const advancedCount = skills.filter(s => s.skill_level >= 80).length
  const verifiedCount = skills.filter(s => s.verified).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your Skills
        </CardTitle>
        <CardDescription>
          {skills.length} skills tracked
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{avgLevel}%</div>
            <div className="text-xs text-muted-foreground">Avg Level</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-500">{advancedCount}</div>
            <div className="text-xs text-muted-foreground">Advanced</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-blue-500">{verifiedCount}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
        </div>

        {/* Skills by Category */}
        {skills.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(categories).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  {category}
                  <Badge variant="secondary" className="text-xs">
                    {categorySkills.length}
                  </Badge>
                </h4>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {skill.skill_name}
                          {skill.verified && (
                            <Award className="h-3 w-3 text-primary" />
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {skill.skill_level}% • {getSkillLabel(skill.skill_level)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getSkillColor(skill.skill_level)}`}
                          style={{ width: `${skill.skill_level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No skills tracked yet</p>
            <p className="text-sm text-muted-foreground">
              Upload your CV or take a skill assessment to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
