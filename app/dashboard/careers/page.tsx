"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Search, Briefcase, DollarSign, Clock, TrendingUp, ChevronRight, Target } from "lucide-react"

const POPULAR_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile Developer",
  "Cloud Architect"
]

interface RoleInfo {
  title: string
  description: string
  salary_range: { min: number; max: number; currency: string }
  required_skills: { name: string; importance: "critical" | "important" | "nice-to-have" }[]
  timeline_months: number
  growth_outlook: string
  daily_tasks: string[]
  career_paths: string[]
}

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null)
  const [loading, setLoading] = useState(false)

  async function exploreRole(role: string) {
    setSelectedRole(role)
    setLoading(true)

    try {
      const response = await fetch("/api/careers/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      })

      const data = await response.json()
      if (data.roleInfo) {
        setRoleInfo(data.roleInfo)
      }
    } catch (error) {
      console.error("Failed to explore role:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = POPULAR_ROLES.filter(role =>
    role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Career Role Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Discover career paths, required skills, and salary expectations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Explore Roles</CardTitle>
            <CardDescription>Select a role to learn more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {filteredRoles.map(role => (
                <button
                  key={role}
                  onClick={() => exploreRole(role)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedRole === role 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">{role}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Or search for any role:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Blockchain Developer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      exploreRole(searchQuery)
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  onClick={() => searchQuery.trim() && exploreRole(searchQuery)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {selectedRole || "Select a Role"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner className="h-8 w-8" />
              </div>
            ) : !roleInfo ? (
              <div className="text-center text-muted-foreground py-20">
                Select a role from the list to see detailed information
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-muted-foreground">{roleInfo.description}</p>

                {/* Key Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Salary Range</span>
                    </div>
                    <p className="font-semibold">
                      {roleInfo.salary_range.currency}{roleInfo.salary_range.min.toLocaleString()} - {roleInfo.salary_range.currency}{roleInfo.salary_range.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Time to Job-Ready</span>
                    </div>
                    <p className="font-semibold">{roleInfo.timeline_months} months</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Growth Outlook</span>
                    </div>
                    <p className="font-semibold">{roleInfo.growth_outlook}</p>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <h3 className="font-semibold mb-3">Required Skills</h3>
                  <div className="space-y-2">
                    {roleInfo.required_skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge variant={
                          skill.importance === "critical" ? "default" :
                          skill.importance === "important" ? "secondary" : "outline"
                        }>
                          {skill.importance}
                        </Badge>
                        <span className="text-sm">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Tasks */}
                <div>
                  <h3 className="font-semibold mb-3">Typical Daily Tasks</h3>
                  <ul className="space-y-2">
                    {roleInfo.daily_tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Paths */}
                <div>
                  <h3 className="font-semibold mb-3">Career Progression</h3>
                  <div className="flex flex-wrap gap-2">
                    {roleInfo.career_paths.map((path, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => exploreRole(path)}>
                        {path}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
