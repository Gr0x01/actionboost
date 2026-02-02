import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getActiveSubscription } from "@/lib/subscription"
import { verifyBusinessOwnership } from "@/lib/business"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/checkout/create-subscription
 *
 * Creates a Stripe Checkout session in subscription mode for Boost Weekly.
 * Requires: businessId in body. User must be authenticated.
 */
export async function POST(request: NextRequest) {
  try {
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

    const { businessId } = body as { businessId?: string }

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 })
    }

    if (!UUID_REGEX.test(businessId)) {
      return NextResponse.json({ error: "Invalid businessId format" }, { status: 400 })
    }

    // Verify the user owns this business
    const isOwner = await verifyBusinessOwnership(businessId, userId)
    if (!isOwner) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION
    if (!priceId) {
      console.error("[Checkout] STRIPE_PRICE_SUBSCRIPTION not configured")
      return NextResponse.json({ error: "Subscription pricing not configured" }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

    // Check for existing active subscription
    const existing = await getActiveSubscription(userId)
    if (existing) {
      return NextResponse.json({ error: "You already have an active subscription" }, { status: 409 })
    }

    // Get user email from DB (don't trust client-provided email)
    const supabase = createServiceClient()
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // IMPORTANT: subscription_data.metadata propagates to the Subscription object.
      // session.metadata does NOT copy to the subscription.
      subscription_data: {
        metadata: {
          user_id: userId,
          business_id: businessId,
          type: "boost_weekly",
        },
      },
      metadata: {
        user_id: userId,
        business_id: businessId,
        type: "boost_weekly",
      },
      success_url: `${appUrl}/dashboard?subscription=new`,
      cancel_url: `${appUrl}/subscribe?canceled=true`,
      allow_promotion_codes: true,
    }

    // Pre-fill email from DB
    if (user?.email) {
      sessionParams.customer_email = user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[Checkout] Subscription session creation failed:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
