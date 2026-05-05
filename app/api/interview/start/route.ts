import { getGeminiFlash } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"
import { generateText, Output } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.number(),
    text: z.string(),
    type: z.enum(["behavioral", "technical", "situational"]),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roleType, difficulty, skills } = await request.json()

    const { output } = await generateText({
      model: getGeminiFlash(),
      output: Output.object({ schema: QuestionsSchema }),
      prompt: `Generate 5 interview questions for a ${difficulty} level ${roleType} position.

The candidate has these skills: ${skills.join(", ") || "not specified"}

Create a mix of question types:
- 2 behavioral questions (asking about past experiences using STAR method)
- 2 technical/role-specific questions
- 1 situational question (hypothetical scenarios)

Make questions challenging but appropriate for the ${difficulty} level.
Questions should be realistic and commonly asked in actual interviews.

Return exactly 5 questions with their types.`,
    })

    if (!output) {
      throw new Error("Failed to generate questions")
    }

    return NextResponse.json(output)
  } catch (error) {
    console.error("Interview start error:", error)
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    )
  }
}
