"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen, Loader2, Sparkles, Target } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface LearningPathGeneratorProps {
  userId: string
  userSkills: { skill_name: string; skill_level: number }[]
}

const popularRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Cloud Architect",
  "Cybersecurity Analyst",
  "Business Analyst",
]

export function LearningPathGenerator({ userId, userSkills }: LearningPathGeneratorProps) {
  const [targetRole, setTargetRole] = useState("")
  const [customRole, setCustomRole] = useState("")
  const [duration, setDuration] = useState("12")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    const role = targetRole === "custom" ? customRole : targetRole
    if (!role) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/learning/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          targetRole: role,
          duration: parseInt(duration),
          difficulty,
          currentSkills: userSkills,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate learning path")

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create Your Learning Path</CardTitle>
        <CardDescription>
          Tell us your target role and we&apos;ll create a personalized study plan with curated resources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Target Role</FieldLabel>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {popularRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {targetRole === "custom" && (
            <Field>
              <FieldLabel>Custom Role</FieldLabel>
              <Input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your target role"
              />
            </Field>
          )}

          <Field>
            <FieldLabel>Duration</FieldLabel>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 weeks (Intensive)</SelectItem>
                <SelectItem value="8">8 weeks</SelectItem>
                <SelectItem value="12">12 weeks (Recommended)</SelectItem>
                <SelectItem value="16">16 weeks</SelectItem>
                <SelectItem value="24">24 weeks (Comprehensive)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Your Current Level</FieldLabel>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (New to the field)</SelectItem>
                <SelectItem value="intermediate">Intermediate (Some experience)</SelectItem>
                <SelectItem value="advanced">Advanced (Looking to specialize)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {userSkills.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Your Current Skills
              </p>
              <p className="text-sm text-muted-foreground">
                {userSkills.map(s => s.skill_name).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll consider your existing skills when creating your path.
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={(!targetRole || (targetRole === "custom" && !customRole)) || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your personalized path...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Learning Path
              </>
            )}
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
