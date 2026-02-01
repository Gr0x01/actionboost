import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getActiveSubscription } from "@/lib/subscription"

/**
 * POST /api/checkin
 * Create or update a weekly check-in for the current subscription week.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { sentiment, notes } = body as { sentiment?: string; notes?: string }

  if (!sentiment || !["great", "okay", "rough"].includes(sentiment)) {
    return NextResponse.json({ error: "Valid sentiment required (great/okay/rough)" }, { status: 400 })
  }

  const subscription = await getActiveSubscription(userId)
  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 403 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from("weekly_checkins")
    .upsert(
      {
        subscription_id: subscription.id,
        week_number: subscription.current_week,
        sentiment,
        notes: notes || null,
      },
      { onConflict: "subscription_id,week_number" }
    )

  if (error) {
    console.error("[Checkin] Upsert failed:", error)
    return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
