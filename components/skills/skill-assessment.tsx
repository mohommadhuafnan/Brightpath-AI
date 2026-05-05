"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Plus, Loader2, X, Sparkles } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface SkillAssessmentProps {
  userId: string
}

const suggestedSkills = [
  "JavaScript", "Python", "React", "Node.js", "SQL",
  "Communication", "Leadership", "Project Management",
  "Data Analysis", "Machine Learning", "AWS", "Docker"
]

export function SkillAssessment({ userId }: SkillAssessmentProps) {
  const [skillName, setSkillName] = useState("")
  const [skillLevel, setSkillLevel] = useState(50)
  const [category, setCategory] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const handleAddSkill = async () => {
    if (!skillName.trim()) return

    setIsAdding(true)
    try {
      const response = await fetch("/api/skills/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          skillName: skillName.trim(),
          skillLevel,
          category: category || "Other",
        }),
      })

      if (!response.ok) throw new Error("Failed to add skill")

      setSkillName("")
      setSkillLevel(50)
      setCategory("")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const selectSuggestedSkill = (skill: string) => {
    setSkillName(skill)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Skill
        </CardTitle>
        <CardDescription>
          Self-assess your skills to track progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Skill Name</FieldLabel>
            <Input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., JavaScript, Leadership"
            />
          </Field>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Suggested:</p>
            <div className="flex flex-wrap gap-1">
              {suggestedSkills.slice(0, 6).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => selectSuggestedSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Field>
            <FieldLabel>
              Proficiency Level: {skillLevel}%
            </FieldLabel>
            <Slider
              value={[skillLevel]}
              onValueChange={(v) => setSkillLevel(v[0])}
              max={100}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Beginner</span>
              <span>Advanced</span>
            </div>
          </Field>

          <Field>
            <FieldLabel>Category (optional)</FieldLabel>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Technical, Soft Skills"
            />
          </Field>

          <Button
            onClick={handleAddSkill}
            disabled={!skillName.trim() || isAdding}
            className="w-full"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </>
            )}
          </Button>
        </FieldGroup>

        <div className="mt-6 pt-6 border-t">
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard/cv-analysis">
              <Sparkles className="mr-2 h-4 w-4" />
              Auto-detect from CV
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
