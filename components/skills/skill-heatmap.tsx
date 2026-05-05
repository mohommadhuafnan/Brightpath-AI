"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  skill_name: string
  skill_level: number
  category: string | null
}

interface SkillHeatmapProps {
  skills: Skill[]
}

function getHeatmapColor(level: number) {
  if (level >= 80) return "bg-green-500 hover:bg-green-600"
  if (level >= 60) return "bg-yellow-500 hover:bg-yellow-600"
  if (level >= 40) return "bg-orange-500 hover:bg-orange-600"
  return "bg-red-500 hover:bg-red-600"
}

function getHeatmapBgColor(level: number) {
  if (level >= 80) return "bg-green-500/20"
  if (level >= 60) return "bg-yellow-500/20"
  if (level >= 40) return "bg-orange-500/20"
  return "bg-red-500/20"
}

export function SkillHeatmap({ skills }: SkillHeatmapProps) {
  if (skills.length === 0) {
    return null
  }

  // Group skills by category
  const categories = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Heatmap</CardTitle>
        <CardDescription>
          Visual overview of your skill proficiency levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Beginner (0-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-500" />
            <span className="text-xs text-muted-foreground">Basic (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Intermediate (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span className="text-xs text-muted-foreground">Advanced (80-100%)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-6">
          {Object.entries(categories).map(([category, categorySkills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium mb-3">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={cn(
                      "group relative px-3 py-2 rounded-lg cursor-default transition-all",
                      getHeatmapBgColor(skill.skill_level)
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full transition-colors",
                          getHeatmapColor(skill.skill_level)
                        )}
                      />
                      <span className="text-sm font-medium">{skill.skill_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {skill.skill_level}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-500">
                {skills.filter(s => s.skill_level < 40).length}
              </div>
              <div className="text-xs text-muted-foreground">Beginner</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {skills.filter(s => s.skill_level >= 40 && s.skill_level < 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Basic</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {skills.filter(s => s.skill_level >= 60 && s.skill_level < 80).length}
              </div>
              <div className="text-xs text-muted-foreground">Intermediate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {skills.filter(s => s.skill_level >= 80).length}
              </div>
              <div className="text-xs text-muted-foreground">Advanced</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
