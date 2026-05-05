import { generateJSONWithOpenRouter } from "@/lib/ai/gemini"
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_name, skill_level")
      .eq("user_id", user.id)

    const skillsContext = userSkills && userSkills.length > 0
      ? `User's current skills: ${userSkills.map(s => `${s.skill_name} (${s.skill_level}%)`).join(", ")}`
      : "User has not added any skills yet"

    const schema = JSON.stringify({
      jobs: [
        {
          job_title: "string",
          company: "string",
          description: "string",
          required_skills: ["string"]
        }
      ]
    })

    const jsonResponse = await generateJSONWithOpenRouter(
      `You are a job market expert. Generate 6 realistic job postings for the following role:

TARGET ROLE: ${targetRole}

${skillsContext}

For each job, provide:
1. A specific job title (with seniority level like Junior, Mid, Senior, Lead)
2. A realistic company name (can be fictional tech companies)
3. A brief job description (2-3 sentences)
4. List of 6-8 required skills (specific technologies, tools, and soft skills)

Make the jobs varied in seniority level and company type.`,
      schema
    )

    const output = JSON.parse(jsonResponse)
    const validatedOutput = JobMatchesSchema.parse(output)

    if (!validatedOutput?.jobs) {
      return Response.json({ error: "Failed to generate jobs" }, { status: 500 })
    }

    const userSkillNames = userSkills?.map(s => s.skill_name.toLowerCase()) || []

    const jobsToInsert = validatedOutput.jobs.map(job => {
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
