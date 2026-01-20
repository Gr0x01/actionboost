import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ credits: 0, loggedIn: false })
    }

    const serviceClient = createServiceClient()

    // Get public user
    const { data: publicUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (!publicUser) {
      return NextResponse.json({ credits: 0, loggedIn: true })
    }

    // Get credits
    const { data: creditRecords } = await serviceClient
      .from("run_credits")
      .select("credits")
      .eq("user_id", publicUser.id)

    // Get run count
    const { count: runCount } = await serviceClient
      .from("runs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", publicUser.id)

    const totalCredits = creditRecords?.reduce((sum, c) => sum + c.credits, 0) ?? 0
    const usedCredits = runCount ?? 0
    const remainingCredits = Math.max(0, totalCredits - usedCredits)

    return NextResponse.json({
      credits: remainingCredits,
      loggedIn: true,
      email: user.email,
    })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json({ credits: 0, loggedIn: false })
  }
}
