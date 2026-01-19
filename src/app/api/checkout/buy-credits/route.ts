import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price IDs from Stripe Dashboard
const PRICES = {
  single: process.env.STRIPE_PRICE_SINGLE!, // $15 for 1 credit
  pack3: process.env.STRIPE_PRICE_3PACK!, // $30 for 3 credits
};

export async function POST(request: NextRequest) {
  try {
    const { pack } = (await request.json()) as { pack?: number };

    const isPack = pack === 3;
    const priceId = isPack ? PRICES.pack3 : PRICES.single;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        credits: isPack ? "3" : "1",
        credits_only: "true", // Flag to indicate no form data
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/start?credits_purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
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
