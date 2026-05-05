"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mic, 
  Play, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface InterviewSimulatorProps {
  userId: string
  userSkills: string[]
}

type InterviewState = "setup" | "question" | "answer" | "feedback" | "complete"

interface Question {
  id: number
  text: string
  type: "behavioral" | "technical" | "situational"
}

interface Feedback {
  score: number
  strengths: string[]
  improvements: string[]
  tips: string
}

const roleTypes = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UX Designer",
  "Marketing Manager",
  "Sales Representative",
  "Project Manager",
  "Business Analyst",
]

const difficultyLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "senior", label: "Senior" },
]

export function InterviewSimulator({ userId, userSkills }: InterviewSimulatorProps) {
  const [state, setState] = useState<InterviewState>("setup")
  const [roleType, setRoleType] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answer, setAnswer] = useState("")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  const router = useRouter()

  const startInterview = async () => {
    if (!roleType) return
    
    setIsLoading(true)
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleType, difficulty, skills: userSkills }),
      })

      if (!response.ok) throw new Error("Failed to start interview")

      const data = await response.json()
      setQuestions(data.questions)
      setState("question")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentQuestionIndex],
          answer,
          roleType,
          difficulty,
        }),
      })

      if (!response.ok) throw new Error("Failed to get feedback")

      const feedback = await response.json()
      setCurrentFeedback(feedback)
      setFeedbacks([...feedbacks, feedback])
      setState("feedback")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer("")
      setCurrentFeedback(null)
      setState("question")
    } else {
      // Calculate overall score
      const avgScore = feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length
      setOverallScore(Math.round(avgScore))
      
      // Save interview to database
      saveInterview(Math.round(avgScore))
      
      setState("complete")
    }
  }

  const saveInterview = async (score: number) => {
    try {
      await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleType,
          difficulty,
          questions,
          feedbacks,
          overallScore: score,
        }),
      })
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const resetInterview = () => {
    setState("setup")
    setRoleType("")
    setDifficulty("intermediate")
    setCurrentQuestionIndex(0)
    setQuestions([])
    setAnswer("")
    setFeedbacks([])
    setCurrentFeedback(null)
    setOverallScore(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Mock Interview
        </CardTitle>
        <CardDescription>
          {state === "setup" && "Configure your interview session"}
          {state === "question" && `Question ${currentQuestionIndex + 1} of ${questions.length}`}
          {state === "answer" && "Type your response"}
          {state === "feedback" && "AI Feedback"}
          {state === "complete" && "Interview Complete"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        {state !== "setup" && state !== "complete" && (
          <Progress 
            value={((currentQuestionIndex + (state === "feedback" ? 1 : 0)) / questions.length) * 100} 
            className="mb-6 h-2"
          />
        )}

        {/* Setup State */}
        {state === "setup" && (
          <div className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Role Type</FieldLabel>
                <Select value={roleType} onValueChange={setRoleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTypes.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Difficulty</FieldLabel>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Button 
              onClick={startInterview} 
              disabled={!roleType || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing questions...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
          </div>
        )}

        {/* Question State */}
        {state === "question" && questions[currentQuestionIndex] && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Badge variant="secondary" className="mb-2">
                {questions[currentQuestionIndex].type}
              </Badge>
              <p className="text-lg font-medium">
                {questions[currentQuestionIndex].text}
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="answer">Your Response</FieldLabel>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be specific and use the STAR method for behavioral questions."
                className="min-h-[200px] mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Take your time and structure your response clearly.
              </p>
            </div>

            <Button 
              onClick={submitAnswer} 
              disabled={!answer.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing response...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Feedback
                </>
              )}
            </Button>
          </div>
        )}

        {/* Feedback State */}
        {state === "feedback" && currentFeedback && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="font-medium">Response Score</span>
              <span className={`text-2xl font-bold ${
                currentFeedback.score >= 80 ? "text-green-500" :
                currentFeedback.score >= 60 ? "text-yellow-500" : "text-red-500"
              }`}>
                {currentFeedback.score}%
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-500/10">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {currentFeedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {currentFeedback.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {currentFeedback.tips && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pro Tip
                </h4>
                <p className="text-sm text-muted-foreground">{currentFeedback.tips}</p>
              </div>
            )}

            <Button onClick={nextQuestion} className="w-full">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Interview
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Complete State */}
        {state === "complete" && (
          <div className="text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Interview Complete!</h3>
              <p className="text-muted-foreground">
                You&apos;ve completed all {questions.length} questions.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-muted/50 inline-block">
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className={`text-4xl font-bold ${
                overallScore >= 80 ? "text-green-500" :
                overallScore >= 60 ? "text-yellow-500" : "text-red-500"
              }`}>
                {overallScore}%
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetInterview}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
              <Button asChild>
                <a href="/dashboard/mentor">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Tips from Mentor
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
