import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getActiveSubscription } from "@/lib/subscription"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * GET /api/strategy — returns strategy_context for current user's subscription.
 */
export async function GET() {
  const session = await getSessionUser()
  if (!session?.publicUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const subscription = await getActiveSubscription(session.publicUserId)
  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("strategy_context")
    .eq("id", subscription.id)
    .single()

  return NextResponse.json({
    strategyContext: data?.strategy_context ?? null,
  })
}
