import { getGeminiFlash } from "@/lib/ai/gemini"
import { generateText, Output } from "ai"
import { z } from "zod"

const ProjectSpecSchema = z.object({
  title: z.string(),
  description: z.string(),
  tech_stack: z.array(z.string()),
  features: z.array(z.string()),
  api_structure: z.array(z.object({
    method: z.string(),
    endpoint: z.string(),
    description: z.string()
  })),
  database_schema: z.array(z.object({
    table: z.string(),
    columns: z.array(z.string())
  })),
  readme_template: z.string(),
  wireframe_description: z.string()
})

export async function POST(req: Request) {
  try {
    const { idea, tech_stack, difficulty } = await req.json()

    const techContext = tech_stack.length > 0 
      ? `The user prefers these technologies: ${tech_stack.join(", ")}.` 
      : "Choose appropriate modern technologies for this project."

    const difficultyGuide = {
      beginner: "Keep it simple with basic CRUD operations, 3-5 features max, simple database schema",
      intermediate: "Include 6-10 features, user authentication, multiple related tables, some advanced functionality",
      advanced: "Complex architecture, 10+ features, real-time functionality, caching, advanced patterns, microservices consideration"
    }

    const result = await generateText({
      model: getGeminiFlash(),
      output: Output.object({ schema: ProjectSpecSchema }),
      prompt: `You are a senior software architect. Generate a complete project specification for the following idea.

PROJECT IDEA: ${idea}

DIFFICULTY LEVEL: ${difficulty}
${difficultyGuide[difficulty as keyof typeof difficultyGuide]}

TECHNOLOGY PREFERENCES: ${techContext}

Generate a comprehensive project specification including:
1. A catchy, professional title
2. Clear description (2-3 sentences)
3. Complete tech stack (frontend, backend, database, tools)
4. List of features (appropriate for difficulty level)
5. RESTful API structure with all endpoints needed
6. Database schema with table names and columns (include types like "id UUID PRIMARY KEY", "name VARCHAR(255)", etc.)
7. A complete README.md template with sections: Overview, Features, Tech Stack, Getting Started, API Documentation, Database Schema, Contributing
8. UI wireframe description explaining the main screens and layout

Make the project realistic and implementable. Focus on best practices and modern development patterns.`
    })

    return Response.json({ spec: result.output })
  } catch (error) {
    console.error("Project generation error:", error)
    return Response.json({ error: "Failed to generate project" }, { status: 500 })
  }
}
