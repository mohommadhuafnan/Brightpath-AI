import { getGeminiFlash } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"
import { generateText, Output } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const FeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  tips: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question, answer, roleType, difficulty } = await request.json()

    const { output } = await generateText({
      model: getGeminiFlash(),
      output: Output.object({ schema: FeedbackSchema }),
      prompt: `You are an expert interview coach evaluating a candidate's response.

Role: ${roleType}
Level: ${difficulty}
Question Type: ${question.type}

Question: ${question.text}

Candidate's Response:
${answer}

Evaluate the response and provide:
1. A score from 0-100 based on:
   - Relevance and directness (did they answer the question?)
   - Specificity (did they use concrete examples?)
   - Structure (was the response organized, using STAR method if behavioral?)
   - Communication (clarity, conciseness, professionalism)

2. 2-3 specific strengths of the response

3. 2-3 specific areas for improvement

4. One actionable tip to improve future responses

Be constructive and encouraging while being honest about areas to improve.`,
    })

    if (!output) {
      throw new Error("Failed to generate feedback")
    }

    return NextResponse.json(output)
  } catch (error) {
    console.error("Interview feedback error:", error)
    return NextResponse.json(
      { error: "Failed to get feedback" },
      { status: 500 }
    )
  }
}
