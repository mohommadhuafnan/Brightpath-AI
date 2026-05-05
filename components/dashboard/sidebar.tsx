"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import {
  LayoutDashboard,
  FileText,
  Target,
  BookOpen,
  Briefcase,
  Mic,
  MessageSquare,
  TrendingUp,
  Search,
  Award,
  Sparkles,
  Flame,
  Star,
  Settings,
  LogOut,
  FileDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  user: {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
  }
  progress: {
    xp: number
    level: number
    streak: number
  }
}

const mainNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/cv-analysis", label: "CV Analysis", icon: FileText },
  { href: "/dashboard/skills", label: "Skill Dashboard", icon: Target },
  { href: "/dashboard/learning", label: "Learning Path", icon: BookOpen },
  { href: "/dashboard/projects", label: "Project Builder", icon: Briefcase },
  { href: "/dashboard/interview", label: "Interview Sim", icon: Mic },
  { href: "/dashboard/mentor", label: "AI Mentor", icon: MessageSquare },
]

const exploreNavItems = [
  { href: "/dashboard/careers", label: "Career Explorer", icon: TrendingUp },
  { href: "/dashboard/jobs", label: "Job Matching", icon: Search },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Award },
  { href: "/dashboard/progress", label: "My Progress", icon: Flame },
  { href: "/dashboard/reports", label: "PDF Reports", icon: FileDown },
]

function calculateXpForNextLevel(level: number): number {
  return level * 500
}

export function DashboardSidebar({ user, progress }: DashboardSidebarProps) {
  const pathname = usePathname()
  const xpForNextLevel = calculateXpForNextLevel(progress.level)
  const xpProgress = (progress.xp % 500) / 5 // Progress percentage within current level

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">BrightPath</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Progress Card */}
        <div className="px-4 py-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Level {progress.level}</p>
                  <p className="text-xs text-muted-foreground">{progress.xp} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{progress.streak}</span>
              </div>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {xpForNextLevel - (progress.xp % 500)} XP to next level
            </p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {exploreNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
