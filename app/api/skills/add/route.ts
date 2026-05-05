import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, skillName, skillLevel, category } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if skill already exists
    const { data: existing } = await supabase
      .from("user_skills")
      .select("id")
      .eq("user_id", user.id)
      .eq("skill_name", skillName)
      .single()

    if (existing) {
      // Update existing skill
      const { error } = await supabase
        .from("user_skills")
        .update({
          skill_level: skillLevel,
          category,
        })
        .eq("id", existing.id)

      if (error) throw error
    } else {
      // Insert new skill
      const { error } = await supabase
        .from("user_skills")
        .insert({
          user_id: user.id,
          skill_name: skillName,
          skill_level: skillLevel,
          category,
        })

      if (error) throw error

      // Award XP for adding skill
      await supabase.rpc("increment_xp", { user_id: user.id, xp_amount: 25 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add skill error:", error)
    return NextResponse.json(
      { error: "Failed to add skill" },
      { status: 500 }
    )
  }
}
