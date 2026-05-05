import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, MapPin, ExternalLink } from "lucide-react"

/** Public portfolio pages query Supabase — skip static generation at build. */
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single()

  if (!portfolio) {
    notFound()
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", portfolio.user_id)
    .single()

  // Fetch user skills
  const { data: skills } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", portfolio.user_id)
    .order("skill_level", { ascending: false })

  // Fetch user projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", portfolio.user_id)
    .order("created_at", { ascending: false })
    .limit(6)

  const settings = portfolio.settings || {}
  const theme = portfolio.theme || "modern"

  const themeStyles = {
    modern: {
      bg: "bg-slate-950",
      accent: "text-blue-500",
      card: "bg-slate-900 border-slate-800",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    dark: {
      bg: "bg-gray-950",
      accent: "text-emerald-500",
      card: "bg-gray-900 border-gray-800",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    gradient: {
      bg: "bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950",
      accent: "text-fuchsia-400",
      card: "bg-white/5 border-white/10 backdrop-blur",
      badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20"
    },
    minimal: {
      bg: "bg-white",
      accent: "text-gray-900",
      card: "bg-gray-50 border-gray-200",
      badge: "bg-gray-100 text-gray-700 border-gray-300"
    }
  }[theme] || themeStyles.modern

  const isLight = theme === "minimal"
  const textColor = isLight ? "text-gray-900" : "text-white"
  const mutedColor = isLight ? "text-gray-600" : "text-gray-400"

  return (
    <div className={`min-h-screen ${themeStyles[theme as keyof typeof themeStyles]?.bg || themeStyles.modern.bg}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className={`w-24 h-24 mx-auto rounded-full ${themeStyles[theme as keyof typeof themeStyles]?.card || themeStyles.modern.card} border flex items-center justify-center text-3xl font-bold ${themeStyles[theme as keyof typeof themeStyles]?.accent || themeStyles.modern.accent} mb-6`}>
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <h1 className={`text-4xl font-bold ${textColor} mb-2`}>
            {profile?.full_name || "Anonymous"}
          </h1>
          <p className={`text-xl ${themeStyles[theme as keyof typeof themeStyles]?.accent || themeStyles.modern.accent} mb-4`}>
            {settings.custom_headline || profile?.headline || "Developer"}
          </p>
          {profile?.location && (
            <p className={`${mutedColor} flex items-center justify-center gap-2`}>
              <MapPin className="h-4 w-4" />
              {profile.location}
            </p>
          )}
          {profile?.bio && (
            <p className={`${mutedColor} mt-4 max-w-2xl mx-auto`}>
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-6">
            {profile?.github_url && (
              <Button variant="outline" size="icon" asChild className={`${themeStyles[theme as keyof typeof themeStyles]?.card || themeStyles.modern.card} border`}>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            )}
            {profile?.linkedin_url && (
              <Button variant="outline" size="icon" asChild className={`${themeStyles[theme as keyof typeof themeStyles]?.card || themeStyles.modern.card} border`}>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            )}
            {profile?.email && settings.show_contact && (
              <Button variant="outline" size="icon" asChild className={`${themeStyles[theme as keyof typeof themeStyles]?.card || themeStyles.modern.card} border`}>
                <a href={`mailto:${profile.email}`}>
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </header>

        {/* Skills Section */}
        {settings.show_skills !== false && skills && skills.length > 0 && (
          <section className="mb-16">
            <h2 className={`text-2xl font-bold ${textColor} mb-6 text-center`}>Skills</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map(skill => (
                <Badge 
                  key={skill.id} 
                  variant="outline"
                  className={`${themeStyles[theme as keyof typeof themeStyles]?.badge || themeStyles.modern.badge} px-4 py-2`}
                >
                  {skill.skill_name}
                  {skill.skill_level > 0 && (
                    <span className="ml-2 opacity-60">{skill.skill_level}%</span>
                  )}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {settings.show_projects !== false && projects && projects.length > 0 && (
          <section className="mb-16">
            <h2 className={`text-2xl font-bold ${textColor} mb-6 text-center`}>Projects</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map(project => (
                <Card key={project.id} className={`${themeStyles[theme as keyof typeof themeStyles]?.card || themeStyles.modern.card} border`}>
                  <CardContent className="p-6">
                    <h3 className={`font-semibold ${textColor} mb-2`}>{project.title}</h3>
                    <p className={`text-sm ${mutedColor} mb-4 line-clamp-2`}>
                      {project.description}
                    </p>
                    {project.tech_stack && (
                      <div className="flex flex-wrap gap-1">
                        {(project.tech_stack as string[]).slice(0, 4).map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className={`text-center ${mutedColor} text-sm`}>
          <p>Built with AI Job Readiness Platform</p>
        </footer>
      </div>
    </div>
  )
}
