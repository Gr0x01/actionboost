import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getRemainingCredits } from "@/lib/credits"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ credits: 0, loggedIn: false })
    }

    const serviceClient = createServiceClient()

    const { data: publicUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (!publicUser) {
      return NextResponse.json({ credits: 0, loggedIn: true })
    }

    const remainingCredits = await getRemainingCredits(publicUser.id)

    return NextResponse.json(
      { credits: remainingCredits, loggedIn: true, email: user.email },
      { headers: { "Cache-Control": "private, max-age=0, stale-while-revalidate=30" } }
    )
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json({ credits: 0, loggedIn: false })
  }
}
