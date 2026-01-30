import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getRemainingCredits } from "@/lib/credits"

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

  // Get user's runs (include parent_run_id for chain grouping)
  // Use ->> to extract just businessName from JSON, not the whole blob
  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, input, businessName:structured_output->>businessName, created_at, completed_at, share_slug, source, parent_run_id")
    .eq("user_id", publicUser.id)
    .order("created_at", { ascending: false })

  const remainingCredits = await getRemainingCredits(publicUser.id)

  return NextResponse.json({
    runs: runs ?? [],
    credits: remainingCredits,
  })
}
