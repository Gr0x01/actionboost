import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FormInput } from "@/lib/types/form";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price IDs from Stripe Dashboard
const PRICES = {
  single: process.env.STRIPE_PRICE_SINGLE!, // $15 for 1 credit
  pack3: process.env.STRIPE_PRICE_3PACK!, // $30 for 3 credits
};

export async function POST(request: NextRequest) {
  try {
    const { input, pack } = (await request.json()) as {
      input: FormInput;
      pack?: number;
    };

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    const isPack = pack === 3;
    const priceId = isPack ? PRICES.pack3 : PRICES.single;

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
      credits: isPack ? "3" : "1",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/processing/{CHECKOUT_SESSION_ID}`,
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
