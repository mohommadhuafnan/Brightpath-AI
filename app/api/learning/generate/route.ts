import { generateJSONWithOpenRouter } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const LearningPathSchema = z.object({
  weeks: z.array(z.object({
    week: z.number(),
    title: z.string(),
    description: z.string(),
    topics: z.array(z.string()),
    resources: z.array(z.object({
      title: z.string(),
      type: z.string(),
      url: z.string(),
      duration: z.string().nullable(),
    })),
    milestones: z.array(z.string()),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, targetRole, duration, difficulty, currentSkills } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const skillsList = currentSkills.map((s: any) => `${s.skill_name} (${s.skill_level}%)`).join(", ")

    const schema = JSON.stringify({
      weeks: [
        {
          week: "number",
          title: "string",
          description: "string",
          topics: ["string"],
          resources: [
            {
              title: "string",
              type: "string",
              url: "string",
              duration: "string or null"
            }
          ],
          milestones: ["string"]
        }
      ]
    })

    const jsonResponse = await generateJSONWithOpenRouter(
      `Create a detailed ${duration}-week learning path for someone wanting to become a ${targetRole}.

Current skill level: ${difficulty}
Existing skills: ${skillsList || "None specified"}

Generate a comprehensive learning plan with:
- Weekly modules with clear titles and descriptions
- 3-5 specific topics to cover each week
- 2-4 learning resources per week (include real, popular learning resources)
- 2-3 milestones/deliverables per week

Make the progression logical, building from fundamentals to advanced topics.`,
      schema
    )

    const output = JSON.parse(jsonResponse)
    const validatedOutput = LearningPathSchema.parse(output)

    if (!validatedOutput?.weeks) {
      throw new Error("Failed to generate learning path")
    }

    const { data: learningPath, error } = await supabase
      .from("learning_paths")
      .insert({
        user_id: user.id,
        target_role: targetRole,
        duration_weeks: duration,
        difficulty,
        current_week: 1,
        progress_percentage: 0,
        plan_data: validatedOutput,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.rpc("increment_xp", { user_id: user.id, xp_amount: 100 })

    return NextResponse.json({ success: true, learningPath })
  } catch (error) {
    console.error("Learning path generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate learning path" },
      { status: 500 }
    )
  }
}
