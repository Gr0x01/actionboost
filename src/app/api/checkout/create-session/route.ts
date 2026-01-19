import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FormInput, validateForm } from "@/lib/types/form";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID from Stripe Dashboard
const PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE!; // $9.99 for 1 credit

export async function POST(request: NextRequest) {
  try {
    const { input, posthogDistinctId } = (await request.json()) as {
      input: FormInput;
      posthogDistinctId?: string;
    };

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate form content (character limits)
    const formErrors = validateForm(input);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
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
