import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getOrCreateDefaultBusiness } from "@/lib/business"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/checkout/upgrade-to-subscription
 *
 * Upgrade a one-shot user to Boost Weekly subscription.
 * Links their latest run's business to the new subscription.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { runId } = body // Optional: the run they're upgrading from

    const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION
    if (!priceId) {
      return NextResponse.json({ error: "Subscription pricing not configured" }, { status: 500 })
    }

    const supabase = createServiceClient()

    // Get user email
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    // Resolve business: use the run's business or default
    let businessId: string | null = null
    if (runId) {
      const { data: run } = await supabase
        .from("runs")
        .select("business_id")
        .eq("id", runId)
        .eq("user_id", userId)
        .single()
      businessId = run?.business_id ?? null
    }

    if (!businessId) {
      businessId = await getOrCreateDefaultBusiness(userId)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: userId,
        business_id: businessId,
        type: "boost_weekly",
        upgrade_from_run_id: runId || "",
      },
      customer_email: user?.email || undefined,
      success_url: `${appUrl}/dashboard?subscription=new`,
      cancel_url: `${appUrl}/dashboard`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[Checkout] Upgrade session creation failed:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
