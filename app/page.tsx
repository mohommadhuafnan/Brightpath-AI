import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Target, 
  MessageSquare, 
  Mic, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Zap
} from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "CV Analysis & ATS Scoring",
    description: "Upload your resume and get instant AI feedback on formatting, keywords, and ATS compatibility with actionable improvement suggestions."
  },
  {
    icon: Target,
    title: "Skill Gap Benchmarking",
    description: "Compare your skills against industry standards and target roles. Visual heatmaps show exactly where to focus your learning."
  },
  {
    icon: BookOpen,
    title: "Personalized Learning Paths",
    description: "Get week-by-week study plans tailored to your career goals, with curated resources and milestone tracking."
  },
  {
    icon: Briefcase,
    title: "AI Project Builder",
    description: "Generate portfolio-ready project ideas complete with tech stack recommendations, feature lists, and implementation guides."
  },
  {
    icon: Mic,
    title: "Interview Simulator",
    description: "Practice with AI-powered mock interviews. Get real-time feedback on your responses with detailed scoring and tips."
  },
  {
    icon: MessageSquare,
    title: "24/7 AI Career Mentor",
    description: "Chat with your personal AI career coach anytime. Get advice on applications, negotiations, career pivots, and more."
  },
  {
    icon: TrendingUp,
    title: "Career Role Explorer",
    description: "Discover roles that match your skills and interests. Compare salaries, requirements, and growth trajectories."
  },
  {
    icon: Award,
    title: "Portfolio & Achievements",
    description: "Build a stunning portfolio website automatically. Track your progress with XP, badges, and shareable achievements."
  }
]

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "85%", label: "Interview Success Rate" },
  { value: "50+", label: "Career Paths" },
  { value: "24/7", label: "AI Support" }
]

const testimonials = [
  {
    quote: "BrightPath helped me identify skill gaps I didn&apos;t even know I had. Landed my dream job in 3 months!",
    author: "Sarah M.",
    role: "Software Engineer at Tech Corp"
  },
  {
    quote: "The interview simulator was a game-changer. I went from nervous wreck to confident candidate.",
    author: "James L.",
    role: "Product Manager at StartupXYZ"
  },
  {
    quote: "Finally, a career tool that actually understands what employers are looking for. Highly recommend!",
    author: "Priya K.",
    role: "Data Scientist at Analytics Inc"
  }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BrightPath AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Success Stories
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Zap className="h-4 w-4" />
                AI-Powered Career Development
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                Your AI Career Companion for{" "}
                <span className="text-primary">Landing Dream Jobs</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 text-pretty">
                From CV optimization to interview prep, BrightPath AI guides you through every step of your career journey with personalized insights and actionable plans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/auth/sign-up">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t w-full max-w-2xl">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive AI-powered tools designed to accelerate your career growth and help you stand out in any job market.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How BrightPath Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes and let AI guide your career development journey.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Upload Your CV",
                  description: "Start by uploading your resume. Our AI instantly analyzes it for ATS compatibility, keywords, and improvement areas."
                },
                {
                  step: "2",
                  title: "Get Personalized Insights",
                  description: "Receive a detailed skill gap analysis, role recommendations, and a customized learning roadmap tailored to your goals."
                },
                {
                  step: "3",
                  title: "Practice & Grow",
                  description: "Use interview simulators, build projects, chat with your AI mentor, and track progress as you level up your career."
                }
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their careers with BrightPath AI.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 fill-primary" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-foreground mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground border-0 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to Transform Your Career?</h2>
                    <p className="text-primary-foreground/80 max-w-md">
                      Join thousands of professionals using AI to land their dream jobs faster.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" variant="secondary" asChild className="gap-2">
                      <Link href="/auth/sign-up">
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">BrightPath AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 BrightPath AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
