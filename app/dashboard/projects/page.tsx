"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProjectBuilder } from "@/components/projects/project-builder"
import { ProjectList } from "@/components/projects/project-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hammer, FolderOpen } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  features: string[]
  status: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setProjects(data.map(p => ({
        ...p,
        tech_stack: p.tech_stack || [],
        features: p.features || []
      })))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Project Builder</h1>
        <p className="text-muted-foreground mt-1">
          Generate complete project specifications with AI assistance
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder" className="gap-2">
            <Hammer className="h-4 w-4" />
            New Project
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            My Projects ({projects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <ProjectBuilder onProjectCreated={fetchProjects} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectList projects={projects} loading={loading} onRefresh={fetchProjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
