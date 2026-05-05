import { getGeminiFlash } from "@/lib/ai/gemini"
import { generateText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const JobMatchesSchema = z.object({
  jobs: z.array(z.object({
    job_title: z.string(),
    company: z.string(),
    description: z.string(),
    required_skills: z.array(z.string())
  }))
})

export async function POST(req: Request) {
  try {
    const { targetRole } = await req.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_name, skill_level")
      .eq("user_id", user.id)

    const skillsContext = userSkills && userSkills.length > 0
      ? `User's current skills: ${userSkills.map(s => `${s.skill_name} (${s.skill_level}%)`).join(", ")}`
      : "User has not added any skills yet"

    // Generate job matches using AI
    const result = await generateText({
      model: getGeminiFlash(),
      output: Output.object({ schema: JobMatchesSchema }),
      prompt: `You are a job market expert. Generate 6 realistic job postings for the following role:

TARGET ROLE: ${targetRole}

${skillsContext}

For each job, provide:
1. A specific job title (with seniority level like Junior, Mid, Senior, Lead)
2. A realistic company name (can be fictional tech companies)
3. A brief job description (2-3 sentences)
4. List of 6-8 required skills (specific technologies, tools, and soft skills)

Make the jobs varied in:
- Seniority level (some junior, some mid, some senior)
- Company type (startup, big tech, agency, etc.)
- Specific focus within the role

Be realistic with skill requirements that match current job market demands in 2024.`
    })

    if (!result.output?.jobs) {
      return Response.json({ error: "Failed to generate jobs" }, { status: 500 })
    }

    // Calculate match scores and skill gaps
    const userSkillNames = userSkills?.map(s => s.skill_name.toLowerCase()) || []

    const jobsToInsert = result.output.jobs.map(job => {
      const requiredSkillsLower = job.required_skills.map(s => s.toLowerCase())
      const matchedSkills = requiredSkillsLower.filter(skill => 
        userSkillNames.some(us => us.includes(skill) || skill.includes(us))
      )
      const skillGaps = job.required_skills.filter(skill => 
        !userSkillNames.some(us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
      )
      
      const matchScore = Math.round((matchedSkills.length / job.required_skills.length) * 100)

      return {
        user_id: user.id,
        job_title: job.job_title,
        company: job.company,
        description: job.description,
        required_skills: job.required_skills,
        match_score: matchScore,
        skill_gaps: skillGaps,
        status: "new"
      }
    })

    // Insert jobs into database
    const { error } = await supabase
      .from("job_matches")
      .insert(jobsToInsert)

    if (error) {
      console.error("Failed to insert jobs:", error)
      return Response.json({ error: "Failed to save jobs" }, { status: 500 })
    }

    return Response.json({ success: true, count: jobsToInsert.length })
  } catch (error) {
    console.error("Job analysis error:", error)
    return Response.json({ error: "Failed to analyze jobs" }, { status: 500 })
  }
}
