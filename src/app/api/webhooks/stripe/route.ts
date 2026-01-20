import { NextRequest, NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { Json } from "@/lib/types/database";
import { runPipeline } from "@/lib/ai/pipeline";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { sendReceiptEmail } from "@/lib/email/resend";
import { trackServerEvent, identifyUser } from "@/lib/analytics";
import { config } from "@/lib/config";

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

  const credits = parseInt(metadata.credits || "1", 10);
  const email = session.customer_details?.email;
  const isCreditsOnly = metadata.credits_only === "true";

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

  // Track payment completed and identify user
  const distinctId = metadata.posthog_distinct_id || userId || session.id;
  trackServerEvent(distinctId, "payment_completed", {
    amount: session.amount_total ? session.amount_total / 100 : 0,
    email: email || undefined,
    credits,
    credits_only: isCreditsOnly,
  });

  if (email) {
    identifyUser(distinctId, email, {
      first_payment_at: new Date().toISOString(),
      credits_purchased: credits,
    });
  }

  // If credits-only purchase, send receipt + magic link and we're done
  if (isCreditsOnly) {
    console.log("Credits-only purchase:", credits, "credits for session:", session.id);
    if (email) {
      const amount = session.amount_total
        ? `$${(session.amount_total / 100).toFixed(2)}`
        : config.singlePrice;
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      sendReceiptEmail({
        to: email,
        productName: credits > 1 ? `${credits} Action Plan Credits` : "Action Plan Credit",
        amount,
        date,
      }).catch((err) => {
        console.error("Receipt email failed for credits-only:", session.id, err);
      });

      sendMagicLink(email, "/dashboard").catch((err) => {
        console.error("Magic link failed for credits-only:", session.id, err);
      });
    }
    return;
  }

  // Parse form data from metadata (aligned with RunInput type for AI pipeline)
  // Safely parse competitor URLs with fallback
  let competitorUrls: string[] = [];
  try {
    const parsed = JSON.parse(metadata.form_competitors || "[]");
    if (Array.isArray(parsed)) {
      competitorUrls = parsed.filter((url): url is string => typeof url === "string" && url.length > 0);
    }
  } catch {
    console.warn("Failed to parse competitor URLs from metadata:", metadata.form_competitors);
  }

  // Validate focusArea - fallback to acquisition if invalid
  const validFocusAreas = ["acquisition", "activation", "retention", "referral", "monetization", "custom"];
  const focusArea = validFocusAreas.includes(metadata.form_focus || "")
    ? metadata.form_focus
    : "acquisition";

  const formInput = {
    productDescription: metadata.form_product || "",
    currentTraction: metadata.form_traction || "",
    whatYouTried: metadata.form_tried || "",
    whatsWorking: metadata.form_working || "",
    focusArea,
    competitorUrls,
    websiteUrl: metadata.form_website || "",
    analyticsSummary: metadata.form_analytics || "",
    constraints: metadata.form_constraints || "",
  };

  // Log if critical fields are missing (shouldn't happen normally)
  if (!formInput.productDescription) {
    console.warn("Webhook: Missing productDescription for session:", session.id);
  }

  // Create the run
  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      input: formInput as unknown as Json,
      status: "pending",
      stripe_session_id: session.id,
    })
    .select("id")
    .single();

  if (runError) {
    console.error("Failed to create run:", runError);
    return;
  }

  console.log("Created run:", run.id, "for session:", session.id);

  // Track run created
  trackServerEvent(distinctId, "run_created", {
    run_id: run.id,
  });

  // Trigger AI pipeline in background (after() keeps function alive until complete)
  after(async () => {
    try {
      await runPipeline(run.id);
    } catch (err) {
      console.error("Pipeline failed for run:", run.id, err);
    }
  });

  // Send receipt + magic link for dashboard access (fire and forget)
  if (email) {
    const amount = session.amount_total
      ? `$${(session.amount_total / 100).toFixed(2)}`
      : config.singlePrice;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    sendReceiptEmail({
      to: email,
      productName: "Action Plan",
      amount,
      date,
    }).catch((err) => {
      console.error("Receipt email failed for run:", run.id, err);
    });

    sendMagicLink(email, "/dashboard").catch((err) => {
      console.error("Magic link failed for run:", run.id, err);
    });
  }
}
