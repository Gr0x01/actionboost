import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Find public user linked to auth user
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!publicUser) {
    // User exists in auth but not linked to public.users yet (no purchases)
    return NextResponse.json({ runs: [], credits: 0 })
  }

  // Get user's runs (include source to identify refinements)
  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, input, created_at, completed_at, share_slug, source")
    .eq("user_id", publicUser.id)
    .order("created_at", { ascending: false })

  // Get credit balance
  const { data: credits } = await supabase
    .from("run_credits")
    .select("credits")
    .eq("user_id", publicUser.id)

  const totalCredits = credits?.reduce((sum, c) => sum + c.credits, 0) ?? 0
  // Only count runs that explicitly used credits (not stripe payments, promos, or refinements)
  const usedCredits = runs?.filter(r => r.source === "credits").length ?? 0
  const remainingCredits = Math.max(0, totalCredits - usedCredits)

  return NextResponse.json({
    runs: runs ?? [],
    credits: remainingCredits,
  })
}
