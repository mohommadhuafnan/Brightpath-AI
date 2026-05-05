import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, roleType, difficulty, questions, feedbacks, overallScore } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Save interview to database
    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        role_type: roleType,
        difficulty,
        questions,
        feedback: feedbacks,
        overall_score: overallScore,
        completed: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Award XP for completing interview
    await supabase.rpc("increment_xp", { user_id: user.id, xp_amount: 100 })

    // Check for interview badge (5 interviews)
    const { count } = await supabase
      .from("interviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)

    if (count && count >= 5) {
      // Award Interview Ready badge
      const { data: badge } = await supabase
        .from("badges")
        .select("id")
        .eq("name", "Interview Ready")
        .single()

      if (badge) {
        await supabase
          .from("user_badges")
          .upsert({
            user_id: user.id,
            badge_id: badge.id,
          }, { onConflict: "user_id,badge_id" })
      }
    }

    return NextResponse.json({ success: true, interview })
  } catch (error) {
    console.error("Interview save error:", error)
    return NextResponse.json(
      { error: "Failed to save interview" },
      { status: 500 }
    )
  }
}
