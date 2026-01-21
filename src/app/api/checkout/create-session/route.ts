import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm } from "@/lib/types/form";
import { MAX_CONTEXT_LENGTH } from "@/lib/types/database";
import { applyContextDeltaToUser } from "@/lib/context/accumulate";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID from Stripe Dashboard
const PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE!; // $9.99 for 1 credit

export async function POST(request: NextRequest) {
  try {
    const { input, contextDelta, posthogDistinctId } = (await request.json()) as {
      input: FormInput;
      contextDelta?: string;
      posthogDistinctId?: string;
    };

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate form content (character limits)
    // contextDelta present means this is a returning user update, relax validation
    const isReturningUser = !!contextDelta;
    const formErrors = validateForm(input, isReturningUser);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
    }

    // Validate contextDelta length
    if (contextDelta && contextDelta.length > MAX_CONTEXT_LENGTH) {
      return NextResponse.json(
        { error: `Context update too long (max ${MAX_CONTEXT_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // For returning users with contextDelta, apply it NOW before Stripe checkout
    // This avoids the 500 char Stripe metadata limit entirely
    let contextAppliedToUser = false;
    if (contextDelta) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // User is authenticated - find their public user ID and apply context
        const serviceClient = createServiceClient();
        const { data: publicUser } = await serviceClient
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (publicUser) {
          const result = await applyContextDeltaToUser(publicUser.id, contextDelta);
          if (result.success) {
            contextAppliedToUser = true;
            console.log(`[Checkout] Applied context delta for user ${publicUser.id} before Stripe checkout`);
          } else {
            console.error(`[Checkout] Failed to apply context delta:`, result.error);
            // Continue anyway - they can still checkout, context just won't be updated
          }
        }
      }
    }

    // Store form data in metadata (500 char limit per key)
    const metadata: Record<string, string> = {
      form_product: input.productDescription.slice(0, 500),
      form_traction: input.currentTraction.slice(0, 500),
      form_tried: input.triedTactics.slice(0, 500),
      form_working: input.workingOrNot.slice(0, 500),
      form_focus: input.focusArea,
      form_competitors: JSON.stringify(input.competitors).slice(0, 500),
      form_website: input.websiteUrl || "",
      form_analytics: (input.analyticsSummary || "").slice(0, 500),
      form_constraints: (input.constraints || "").slice(0, 500),
      credits: "1",
      posthog_distinct_id: posthogDistinctId || "",
      // Context delta: if already applied to user, don't duplicate in metadata
      // If not applied (edge case: user not authenticated), fall back to truncated version
      context_delta: contextAppliedToUser ? "" : (contextDelta?.slice(0, 500) || ""),
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/processing/{CHECKOUT_SESSION_ID}?new=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/start`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
