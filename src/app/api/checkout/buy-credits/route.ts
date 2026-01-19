import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID from Stripe Dashboard
const PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE!; // $7.99 for 1 credit

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_SINGLE,
          quantity: 1,
        },
      ],
      metadata: {
        credits: "1",
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
