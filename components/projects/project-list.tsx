"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { FolderOpen, Calendar, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  features: string[]
  status: string
  created_at: string
}

interface ProjectListProps {
  projects: Project[]
  loading: boolean
  onRefresh: () => void
}

export function ProjectList({ projects, loading, onRefresh }: ProjectListProps) {
  const supabase = createClient()

  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id)
    onRefresh()
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Empty
        icon={FolderOpen}
        title="No projects yet"
        description="Generate your first project specification using the AI Project Builder"
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map(project => (
        <Card key={project.id} className="group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => deleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {project.tech_stack.slice(0, 5).map(tech => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.tech_stack.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tech_stack.length - 5} more
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {project.features.length} features defined
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
