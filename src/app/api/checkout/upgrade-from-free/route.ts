import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAuditToken } from "@/lib/auth/audit-token";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE!;

/**
 * Create a Stripe checkout session to upgrade from free audit to full plan.
 * Uses the existing free audit's input data - user doesn't need to fill form again.
 */
export async function POST(request: NextRequest) {
  try {
    const { freeAuditId, token, posthogDistinctId } = (await request.json()) as {
      freeAuditId: string;
      token: string;
      posthogDistinctId?: string;
    };

    if (!freeAuditId || !token) {
      return NextResponse.json(
        { error: "Free audit ID and token required" },
        { status: 400 }
      );
    }

    // Verify the token
    if (!verifyAuditToken(freeAuditId, token)) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();

    // Fetch the free audit
    const { data: freeAudit, error } = await supabase
      .from("free_audits")
      .select("id, email, input, user_id, business_id")
      .eq("id", freeAuditId)
      .single();

    if (error || !freeAudit) {
      return NextResponse.json(
        { error: "Free audit not found" },
        { status: 404 }
      );
    }

    const input = freeAudit.input as Record<string, unknown>;

    // Store form data in metadata (same pattern as regular checkout)
    const metadata: Record<string, string> = {
      form_product: String(input.productDescription || "").slice(0, 500),
      form_traction: String(input.currentTraction || "").slice(0, 500),
      form_tactics: String(input.tacticsAndResults || "").slice(0, 500),
      form_focus: String(input.focusArea || "acquisition"),
      form_competitors: JSON.stringify(input.competitorUrls || []).slice(0, 500),
      form_website: String(input.websiteUrl || ""),
      form_analytics: String(input.analyticsSummary || "").slice(0, 500),
      form_constraints: String(input.constraints || "").slice(0, 500),
      form_email: freeAudit.email,
      credits: "1",
      posthog_distinct_id: posthogDistinctId || "",
      // Mark this as an upgrade from free
      upgrade_from_free_audit_id: freeAuditId,
      // Pass through business_id if exists
      business_id: freeAudit.business_id || "",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_SINGLE,
          quantity: 1,
        },
      ],
      metadata,
      customer_email: freeAudit.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/processing/{CHECKOUT_SESSION_ID}?new=1&upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/free-results/${freeAuditId}?token=${token}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Upgrade checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
