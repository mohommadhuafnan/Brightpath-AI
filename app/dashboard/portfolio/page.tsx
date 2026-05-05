"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Globe, Eye, Palette, Link as LinkIcon, Save, ExternalLink, Copy, Check } from "lucide-react"

const THEMES = [
  { id: "modern", name: "Modern", description: "Clean and minimal with bold accents", colors: ["#0F172A", "#3B82F6", "#F8FAFC"] },
  { id: "dark", name: "Dark Pro", description: "Professional dark theme", colors: ["#111827", "#10B981", "#E5E7EB"] },
  { id: "gradient", name: "Gradient", description: "Vibrant gradient backgrounds", colors: ["#7C3AED", "#EC4899", "#FAFAFA"] },
  { id: "minimal", name: "Minimal", description: "Simple black and white", colors: ["#FFFFFF", "#000000", "#6B7280"] }
]

interface Portfolio {
  id: string
  slug: string
  theme: string
  is_public: boolean
  settings: {
    show_skills?: boolean
    show_projects?: boolean
    show_contact?: boolean
    custom_headline?: string
  }
}

interface Profile {
  full_name: string
  headline: string
  bio: string
  location: string
  linkedin_url: string
  github_url: string
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Form state
  const [slug, setSlug] = useState("")
  const [theme, setTheme] = useState("modern")
  const [isPublic, setIsPublic] = useState(true)
  const [showSkills, setShowSkills] = useState(true)
  const [showProjects, setShowProjects] = useState(true)
  const [showContact, setShowContact] = useState(true)
  const [customHeadline, setCustomHeadline] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    // Fetch portfolio
    const { data: portfolioData } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (portfolioData) {
      setPortfolio(portfolioData)
      setSlug(portfolioData.slug)
      setTheme(portfolioData.theme || "modern")
      setIsPublic(portfolioData.is_public)
      setShowSkills(portfolioData.settings?.show_skills ?? true)
      setShowProjects(portfolioData.settings?.show_projects ?? true)
      setShowContact(portfolioData.settings?.show_contact ?? true)
      setCustomHeadline(portfolioData.settings?.custom_headline || "")
    } else {
      // Generate default slug from user email
      const defaultSlug = user.email?.split("@")[0]?.replace(/[^a-z0-9]/gi, "-").toLowerCase() || `user-${Date.now()}`
      setSlug(defaultSlug)
    }

    setLoading(false)
  }

  async function savePortfolio() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const portfolioData = {
      user_id: user.id,
      slug,
      theme,
      is_public: isPublic,
      settings: {
        show_skills: showSkills,
        show_projects: showProjects,
        show_contact: showContact,
        custom_headline: customHeadline
      }
    }

    if (portfolio) {
      await supabase
        .from("portfolios")
        .update(portfolioData)
        .eq("id", portfolio.id)
    } else {
      await supabase
        .from("portfolios")
        .insert(portfolioData)
    }

    await fetchData()
    setSaving(false)
  }

  const portfolioUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/portfolio/${slug}` 
    : `/portfolio/${slug}`

  const copyUrl = () => {
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and customize your professional portfolio
          </p>
        </div>
        {portfolio && isPublic && (
          <Button variant="outline" asChild>
            <a href={`/portfolio/${slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
        )}
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Globe className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* URL Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Portfolio URL
                </CardTitle>
                <CardDescription>
                  Customize your public portfolio link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Custom URL Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase())}
                      placeholder="your-name"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your portfolio will be available at: /portfolio/{slug}
                  </p>
                </div>

                {portfolio && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">Your Portfolio URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm flex-1 truncate">{portfolioUrl}</code>
                      <Button size="icon" variant="ghost" onClick={copyUrl}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Make Portfolio Public</Label>
                    <p className="text-xs text-muted-foreground">Allow anyone to view your portfolio</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </CardContent>
            </Card>

            {/* Content Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Choose what to display on your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Custom Headline</Label>
                  <Input
                    id="headline"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    placeholder={profile?.headline || "Full Stack Developer"}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Show Skills Section</Label>
                    <Switch checked={showSkills} onCheckedChange={setShowSkills} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Projects Section</Label>
                    <Switch checked={showProjects} onCheckedChange={setShowProjects} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Contact Section</Label>
                    <Switch checked={showContact} onCheckedChange={setShowContact} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Choose Theme</CardTitle>
              <CardDescription>
                Select a visual style for your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      theme === t.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex gap-1 mb-3">
                      {t.colors.map((color, i) => (
                        <div 
                          key={i} 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    {theme === t.id && (
                      <Badge className="mt-2">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePortfolio} disabled={saving}>
          {saving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Portfolio
        </Button>
      </div>
    </div>
  )
}
