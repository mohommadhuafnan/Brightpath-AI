import { generateWithOpenRouter } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

const SYSTEM_PROMPT = `You are BrightPath AI, a friendly and knowledgeable AI career mentor. Your role is to help users with:

1. Career Development: Advice on skill building, career paths, and professional growth
2. Job Search: Resume tips, job hunting strategies, and application advice
3. Interview Prep: Mock interview questions, answering strategies, and confidence building
4. Salary Negotiation: How to research, ask for, and negotiate compensation
5. Career Transitions: Changing industries, roles, or moving into tech
6. Skill Assessment: Identifying strengths, weaknesses, and areas to improve
7. Networking: Building professional relationships and personal branding
8. Work-Life Balance: Managing stress, burnout, and career satisfaction

Guidelines:
- Be encouraging, supportive, and constructive
- Provide specific, actionable advice
- Use examples when helpful
- Ask clarifying questions when needed
- Be honest about limitations
- Keep responses conversational but professional
- Format responses with bullet points or numbered lists when appropriate for clarity

Remember: You're here to empower users to achieve their career goals!`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages, userContext }: { 
    messages: Array<{ role: "user" | "assistant"; content: string }>
    userContext?: {
      name: string
      skills: string[]
      headline: string
    }
  } = await req.json()

  let contextualPrompt = SYSTEM_PROMPT
  
  if (userContext) {
    contextualPrompt += `\n\nUser Context:
- Name: ${userContext.name}
- Current skills: ${userContext.skills.length > 0 ? userContext.skills.join(", ") : "Not specified"}
- Headline: ${userContext.headline || "Not specified"}

Use this context to personalize your advice when relevant.`
  }

  // Build conversation history
  const conversationHistory = messages.map((msg, idx) => {
    const lastUserMessage = messages
      .slice(0, idx + 1)
      .reverse()
      .find(m => m.role === "user")
    
    return {
      role: msg.role,
      content: msg.content
    }
  })

  // Get the last user message
  const lastUserMsg = conversationHistory.reverse().find(m => m.role === "user")
  if (!lastUserMsg) {
    return new Response("No user message provided", { status: 400 })
  }

  try {
    const response = await generateWithOpenRouter(
      `${contextualPrompt}\n\nUser: ${lastUserMsg.content}`,
    )

    return new Response(JSON.stringify({ response }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Mentor chat error:", error)
    return new Response("Failed to generate response", { status: 500 })
  }
}
