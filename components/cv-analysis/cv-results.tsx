"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Target,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

interface CVResultsProps {
  cv: {
    id: string
    ats_score: number
    analysis: {
      summary?: string
      strengths?: string[]
      improvements?: string[]
      keywords?: {
        found: string[]
        missing: string[]
      }
      sections?: {
        name: string
        score: number
        feedback: string
      }[]
      formatting?: {
        score: number
        issues: string[]
      }
    } | null
    parsed_content: any
    created_at: string
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500"
  if (score >= 60) return "text-yellow-500"
  return "text-red-500"
}

function getScoreIcon(score: number) {
  if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-500" />
  if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  return <XCircle className="h-5 w-5 text-red-500" />
}

export function CVResults({ cv }: CVResultsProps) {
  const analysis = cv.analysis || {
    summary: "Your CV has been analyzed. Upload a new version to get updated feedback.",
    strengths: [],
    improvements: [],
    keywords: { found: [], missing: [] },
    sections: [],
    formatting: { score: 0, issues: [] }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Analysis Results
        </CardTitle>
        <CardDescription>
          AI-powered insights to improve your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ATS Score */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">ATS Compatibility Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(cv.ats_score)}`}>
              {cv.ats_score}%
            </span>
          </div>
          <Progress value={cv.ats_score} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {cv.ats_score >= 80
              ? "Excellent! Your CV is well-optimized for ATS systems."
              : cv.ats_score >= 60
              ? "Good, but there's room for improvement."
              : "Your CV needs optimization to pass ATS filters."}
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {analysis.summary && (
              <div>
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
            )}

            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvements && analysis.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {analysis.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="keywords" className="mt-4 space-y-4">
            {analysis.keywords && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Keywords Found ({analysis.keywords.found?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.found?.map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700">
                        {keyword}
                      </Badge>
                    ))}
                    {(!analysis.keywords.found || analysis.keywords.found.length === 0) && (
                      <p className="text-sm text-muted-foreground">No keywords detected</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Suggested Keywords ({analysis.keywords.missing?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.missing?.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="border-yellow-500/50 text-yellow-700">
                        {keyword}
                      </Badge>
                    ))}
                    {(!analysis.keywords.missing || analysis.keywords.missing.length === 0) && (
                      <p className="text-sm text-muted-foreground">No missing keywords</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="sections" className="mt-4 space-y-3">
            {analysis.sections && analysis.sections.length > 0 ? (
              analysis.sections.map((section, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{section.name}</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(section.score)}
                      <span className={`text-sm font-medium ${getScoreColor(section.score)}`}>
                        {section.score}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{section.feedback}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Section analysis not available
              </p>
            )}
          </TabsContent>

          <TabsContent value="tips" className="mt-4 space-y-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Quick Tips for ATS Optimization
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Use standard section headings (Experience, Education, Skills)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Include relevant keywords from job descriptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Use a clean, simple format without tables or graphics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  Quantify achievements with numbers and metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">5.</span>
                  Keep formatting consistent throughout
                </li>
              </ul>
            </div>

            {analysis.formatting && analysis.formatting.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Formatting Issues
                </h4>
                <ul className="space-y-1">
                  {analysis.formatting.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
