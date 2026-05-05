import { getGeminiFlash } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"
import { generateText, Output } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const CVAnalysisSchema = z.object({
  ats_score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  keywords: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  sections: z.array(z.object({
    name: z.string(),
    score: z.number(),
    feedback: z.string(),
  })),
  formatting: z.object({
    score: z.number(),
    issues: z.array(z.string()),
  }),
  extracted_skills: z.array(z.string()),
})

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(buffer)
  
  // For now, we'll handle text-based files directly
  // In production, you'd use pdf-parse for PDFs, mammoth for DOCX, etc.
  if (file.type === "text/plain") {
    return text
  }
  
  // For PDF/DOCX, we'll extract what we can from the raw text
  // This is a simplified approach - in production use proper parsers
  const cleanedText = text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Remove non-printable chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
  
  return cleanedText || "Could not extract text from file. Please upload a plain text or PDF file."
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract text from file
    const cvText = await extractTextFromFile(file)

    if (cvText.length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please ensure your CV has content." },
        { status: 400 }
      )
    }

    // Analyze CV with Gemini
    const { output } = await generateText({
      model: getGeminiFlash(),
      output: Output.object({ schema: CVAnalysisSchema }),
      prompt: `You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze the following CV/resume and provide detailed feedback.

CV Content:
${cvText.substring(0, 8000)}

Analyze the CV and provide:
1. An ATS compatibility score (0-100) based on formatting, keywords, and structure
2. A brief summary of the CV's overall quality
3. List of strengths (3-5 items)
4. List of areas for improvement (3-5 items)
5. Keywords found in the CV and important keywords that are missing
6. Section-by-section analysis with scores and feedback
7. Formatting assessment with any issues found
8. List of technical and soft skills extracted from the CV

Be specific and actionable in your feedback. Focus on helping the candidate improve their chances of passing ATS systems and impressing human recruiters.`,
    })

    if (!output) {
      throw new Error("Failed to analyze CV")
    }

    // Save to database
    const { data: cvRecord, error: dbError } = await supabase
      .from("cvs")
      .insert({
        user_id: user.id,
        file_name: file.name,
        parsed_content: { raw_text: cvText.substring(0, 10000) },
        ats_score: output.ats_score,
        analysis: {
          summary: output.summary,
          strengths: output.strengths,
          improvements: output.improvements,
          keywords: output.keywords,
          sections: output.sections,
          formatting: output.formatting,
        },
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      throw new Error("Failed to save CV analysis")
    }

    // Save extracted skills
    if (output.extracted_skills && output.extracted_skills.length > 0) {
      const skillsToInsert = output.extracted_skills.map(skill => ({
        user_id: user.id,
        skill_name: skill,
        skill_level: 50, // Default level, can be adjusted
        category: "extracted",
        verified: false,
      }))

      // Insert skills, ignoring duplicates
      await supabase
        .from("user_skills")
        .upsert(skillsToInsert, { 
          onConflict: "user_id,skill_name",
          ignoreDuplicates: true 
        })
    }

    // Award XP for uploading CV
    await supabase.rpc("increment_xp", { user_id: user.id, xp_amount: 50 })

    return NextResponse.json({
      success: true,
      cv: cvRecord,
      analysis: output,
    })
  } catch (error) {
    console.error("CV analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze CV" },
      { status: 500 }
    )
  }
}
