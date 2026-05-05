import { generateJSONWithOpenRouter } from "@/lib/ai/gemini"
import { z } from "zod"

const RoleInfoSchema = z.object({
  title: z.string(),
  description: z.string(),
  salary_range: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string()
  }),
  required_skills: z.array(z.object({
    name: z.string(),
    importance: z.enum(["critical", "important", "nice-to-have"])
  })),
  timeline_months: z.number(),
  growth_outlook: z.string(),
  daily_tasks: z.array(z.string()),
  career_paths: z.array(z.string())
})

export async function POST(req: Request) {
  try {
    const { role } = await req.json()

    const schema = JSON.stringify({
      title: "string",
      description: "string",
      salary_range: {
        min: "number",
        max: "number",
        currency: "string"
      },
      required_skills: [
        {
          name: "string",
          importance: "critical | important | nice-to-have"
        }
      ],
      timeline_months: "number",
      growth_outlook: "string",
      daily_tasks: ["string"],
      career_paths: ["string"]
    })

    const jsonResponse = await generateJSONWithOpenRouter(
      `You are a career counselor with deep knowledge of the tech industry. Provide comprehensive information about the following role:

ROLE: ${role}

Provide accurate, current information including:
1. A clear description of what this role does (2-3 sentences)
2. Realistic salary range in USD (annual, based on US market for mid-level position)
3. Required skills categorized by importance (critical = must-have, important = strongly preferred, nice-to-have = bonus)
4. Realistic timeline in months for someone starting from scratch to become job-ready
5. Job market growth outlook (e.g., "High demand", "Stable", "Growing rapidly", "Competitive")
6. 5-6 typical daily tasks for someone in this role
7. 4-5 potential career progression paths from this role

Be realistic and accurate with salary and timeline estimates. Skills should be specific and actionable.`,
      schema
    )

    const output = JSON.parse(jsonResponse)
    const validatedOutput = RoleInfoSchema.parse(output)

    return Response.json({ roleInfo: validatedOutput })
  } catch (error) {
    console.error("Career exploration error:", error)
    return Response.json({ error: "Failed to explore role" }, { status: 500 })
  }
}
