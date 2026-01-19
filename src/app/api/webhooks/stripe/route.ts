import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { Json } from "@/lib/types/database";
import { runPipeline } from "@/lib/ai/pipeline";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const metadata = session.metadata || {};

  // Parse form data from metadata (aligned with RunInput type for AI pipeline)
  const formInput = {
    productDescription: metadata.form_product || "",
    currentTraction: metadata.form_traction || "",
    whatYouTried: metadata.form_tried || "",
    whatsWorking: metadata.form_working || "",
    focusArea: metadata.form_focus || "acquisition",
    competitorUrls: JSON.parse(metadata.form_competitors || "[]").filter(Boolean),
    websiteUrl: metadata.form_website || "",
    analyticsSummary: metadata.form_analytics || "",
    constraints: metadata.form_constraints || "",
  };

  const credits = parseInt(metadata.credits || "1", 10);
  const email = session.customer_details?.email;

  // Get or create user if email provided
  let userId: string | null = null;

  if (email) {
    // Try to find existing user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ email })
        .select("id")
        .single();

      if (!userError && newUser) {
        userId = newUser.id;
      }
    }
  }

  // Create run_credits record
  await supabase.from("run_credits").insert({
    user_id: userId,
    credits,
    source: "stripe",
    stripe_checkout_session_id: session.id,
  });

  // Create the run
  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      input: formInput as unknown as Json,
      status: "pending",
    })
    .select("id")
    .single();

  if (runError) {
    console.error("Failed to create run:", runError);
    return;
  }

  console.log("Created run:", run.id, "for session:", session.id);

  // Trigger AI pipeline (fire and forget - don't block webhook response)
  runPipeline(run.id).catch((err) => {
    console.error("Pipeline failed for run:", run.id, err);
  });
}
