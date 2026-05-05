import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { learningPathId, userId, weekCompleted } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current learning path
    const { data: learningPath, error: fetchError } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("id", learningPathId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !learningPath) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 })
    }

    // Update week completion in plan_data
    const updatedWeeks = learningPath.plan_data.weeks.map((week: any) => {
      if (week.week === weekCompleted) {
        return { ...week, completed: true }
      }
      return week
    })

    // Calculate new progress
    const completedWeeks = updatedWeeks.filter((w: any) => w.completed).length
    const totalWeeks = learningPath.duration_weeks
    const progressPercentage = Math.round((completedWeeks / totalWeeks) * 100)
    const newCurrentWeek = Math.min(weekCompleted + 1, totalWeeks)

    // Update learning path
    const { error: updateError } = await supabase
      .from("learning_paths")
      .update({
        current_week: newCurrentWeek,
        progress_percentage: progressPercentage,
        plan_data: { weeks: updatedWeeks },
      })
      .eq("id", learningPathId)

    if (updateError) throw updateError

    // Award XP for completing a week
    await supabase.rpc("increment_xp", { user_id: user.id, xp_amount: 75 })

    // Check for Learning Machine badge (first week completed)
    if (completedWeeks === 1) {
      const { data: badge } = await supabase
        .from("badges")
        .select("id")
        .eq("name", "Learning Machine")
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

    return NextResponse.json({ success: true, progressPercentage })
  } catch (error) {
    console.error("Learning progress error:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
