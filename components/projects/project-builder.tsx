"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Code, FileText, Layout, Database, X, Save, Copy, Check } from "lucide-react"

interface ProjectSpec {
  title: string
  description: string
  tech_stack: string[]
  features: string[]
  api_structure: { method: string; endpoint: string; description: string }[]
  database_schema: { table: string; columns: string[] }[]
  readme_template: string
  wireframe_description: string
}

const TECH_OPTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Express", "FastAPI", "Django", "Flask",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase",
  "TypeScript", "JavaScript", "Python", "Go", "Rust",
  "Tailwind CSS", "shadcn/ui", "Material UI", "Chakra UI",
  "Docker", "Kubernetes", "AWS", "Vercel", "Railway"
]

export function ProjectBuilder({ onProjectCreated }: { onProjectCreated: () => void }) {
  const [projectIdea, setProjectIdea] = useState("")
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [projectSpec, setProjectSpec] = useState<ProjectSpec | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  async function generateProject() {
    if (!projectIdea.trim()) return
    setLoading(true)

    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: projectIdea,
          tech_stack: selectedTech,
          difficulty
        })
      })

      const data = await response.json()
      if (data.spec) {
        setProjectSpec(data.spec)
      }
    } catch (error) {
      console.error("Failed to generate project:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProject() {
    if (!projectSpec) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("projects").insert({
        user_id: user.id,
        title: projectSpec.title,
        description: projectSpec.description,
        tech_stack: projectSpec.tech_stack,
        features: projectSpec.features,
        api_structure: projectSpec.api_structure,
        readme_template: projectSpec.readme_template,
        wireframe: projectSpec.wireframe_description,
        status: "draft"
      })

      onProjectCreated()
      setProjectSpec(null)
      setProjectIdea("")
      setSelectedTech([])
    } catch (error) {
      console.error("Failed to save project:", error)
    } finally {
      setSaving(false)
    }
  }

  const copyReadme = () => {
    if (projectSpec?.readme_template) {
      navigator.clipboard.writeText(projectSpec.readme_template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Project Generator
          </CardTitle>
          <CardDescription>
            Describe your project idea and let AI generate a complete specification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idea">Project Idea</Label>
            <Textarea
              id="idea"
              placeholder="e.g., A task management app with team collaboration features, real-time updates, and Kanban boards..."
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - Simple CRUD app</SelectItem>
                <SelectItem value="intermediate">Intermediate - Multiple features</SelectItem>
                <SelectItem value="advanced">Advanced - Complex architecture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Technologies (optional)</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
              {TECH_OPTIONS.map(tech => (
                <Badge
                  key={tech}
                  variant={selectedTech.includes(tech) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                  {selectedTech.includes(tech) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateProject} 
            disabled={loading || !projectIdea.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Generating Project Spec...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Project Specification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Spec */}
      <Card className={!projectSpec ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Generated Specification
            </span>
            {projectSpec && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyReadme}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" onClick={saveProject} disabled={saving}>
                  {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  <span className="ml-1">Save</span>
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!projectSpec ? (
            <div className="text-center text-muted-foreground py-12">
              Generate a project to see the specification here
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="readme">README</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{projectSpec.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{projectSpec.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tech Stack</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {projectSpec.tech_stack.map(tech => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Features</Label>
                  <ul className="mt-1 space-y-1">
                    {projectSpec.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">UI Wireframe Description</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {projectSpec.wireframe_description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="api">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {projectSpec.api_structure.map((endpoint, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            endpoint.method === "GET" ? "secondary" :
                            endpoint.method === "POST" ? "default" :
                            endpoint.method === "PUT" ? "outline" : "destructive"
                          }>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="database">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {projectSpec.database_schema.map((table, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-mono font-semibold">{table.table}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {table.columns.map((col, j) => (
                            <Badge key={j} variant="outline" className="font-mono text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="readme">
                <ScrollArea className="h-[300px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap p-3 bg-muted rounded-lg">
                    {projectSpec.readme_template}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
