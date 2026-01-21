import { NextRequest, NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { Json } from "@/lib/types/database";
import { runPipeline, runFreePipeline } from "@/lib/ai/pipeline";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { sendReceiptEmail, sendAbandonedCheckoutEmail } from "@/lib/email/resend";
import { trackServerEvent, identifyUser } from "@/lib/analytics";
import { config } from "@/lib/config";
import { applyContextDeltaToUser } from "@/lib/context/accumulate";
import { isValidEmail } from "@/lib/validation";
import type { FocusArea } from "@/lib/types/form";

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

  // Cart abandonment: when checkout expires, send free audit
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Handle in background to not block webhook response
    after(async () => {
      await handleCheckoutExpired(session);
    });
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

  // Support both new (form_tactics) and legacy (form_tried + form_working) formats
  const tacticsAndResults = metadata.form_tactics ||
    [metadata.form_tried, metadata.form_working].filter(Boolean).join("\n\n") ||
    "";

  const formInput = {
    productDescription: metadata.form_product || "",
    currentTraction: metadata.form_traction || "",
    tacticsAndResults,
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

  // If returning user provided a context update, merge it into their stored context
  // This ensures the pipeline sees the latest user information
  const contextDelta = metadata.context_delta;
  if (contextDelta && userId) {
    const result = await applyContextDeltaToUser(userId, contextDelta);
    if (!result.success) {
      console.error(`[Webhook] Failed to merge context delta for user ${userId}:`, result.error);
      // Continue anyway - run will use stale context but at least it will process
    } else {
      console.log(`[Webhook] Merged context delta for user ${userId}`);
    }
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

/**
 * Normalize email for rate limiting - strips Gmail plus addressing
 */
function normalizeEmailForRateLimit(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return local.split("+")[0].replace(/\./g, "") + "@gmail.com";
  }
  return email.toLowerCase().trim();
}

/**
 * Handle expired checkout sessions - cart abandonment recovery
 * Creates a free audit for the user and sends them an email
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const metadata = session.metadata || {};

  // Get email from metadata (collected before checkout)
  const email = metadata.form_email;

  // Skip if no email was provided (user skipped email step)
  if (!email || !isValidEmail(email)) {
    console.log(`[Webhook] Session ${session.id} expired without valid email, skipping abandonment flow`);
    return;
  }

  const normalizedEmail = normalizeEmailForRateLimit(email);
  const displayEmail = email.toLowerCase().trim();

  console.log(`[Webhook] Processing abandoned checkout for ${displayEmail}, session: ${session.id}`);

  // Check if user already has a free audit
  const { data: existingAudit } = await supabase
    .from("free_audits")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  if (existingAudit) {
    console.log(`[Webhook] User ${displayEmail} already has free audit ${existingAudit.id}, sending recovery email`);
    // Send recovery email pointing to existing audit
    sendAbandonedCheckoutEmail({
      to: displayEmail,
      freeAuditId: existingAudit.id,
    }).catch((err) => {
      console.error("[Webhook] Failed to send abandonment email for existing audit:", err);
    });

    trackServerEvent(session.id, "cart_abandonment_existing_audit", {
      free_audit_id: existingAudit.id,
      email_domain: displayEmail.split("@")[1],
    });
    return;
  }

  // Parse form data from metadata (same pattern as handleCheckoutCompleted)
  let competitorUrls: string[] = [];
  try {
    const parsed = JSON.parse(metadata.form_competitors || "[]");
    if (Array.isArray(parsed)) {
      competitorUrls = parsed.filter((url): url is string => typeof url === "string" && url.length > 0);
    }
  } catch {
    console.warn("[Webhook] Failed to parse competitor URLs from metadata");
  }

  const validFocusAreas: FocusArea[] = ["acquisition", "activation", "retention", "referral", "monetization", "custom"];
  const focusArea: FocusArea = validFocusAreas.includes(metadata.form_focus as FocusArea)
    ? (metadata.form_focus as FocusArea)
    : "acquisition";

  const tacticsAndResults = metadata.form_tactics ||
    [metadata.form_tried, metadata.form_working].filter(Boolean).join("\n\n") ||
    "";

  const runInput = {
    productDescription: metadata.form_product || "",
    currentTraction: metadata.form_traction || "",
    tacticsAndResults,
    focusArea,
    competitorUrls,
    websiteUrl: metadata.form_website || "",
    analyticsSummary: metadata.form_analytics || "",
    constraints: metadata.form_constraints || "",
  };

  // Skip if no product description (shouldn't happen but be safe)
  if (!runInput.productDescription) {
    console.warn(`[Webhook] No product description for abandoned session ${session.id}, skipping`);
    return;
  }

  // Get or create user by email
  let userId: string | null = null;
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", displayEmail)
    .single();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({ email: displayEmail })
      .select("id")
      .single();

    if (!userError && newUser) {
      userId = newUser.id;
    }
  }

  // Create free audit record with abandoned_checkout source
  const { data: freeAudit, error: insertError } = await supabase
    .from("free_audits")
    .insert({
      email: normalizedEmail,
      user_id: userId,
      input: runInput as unknown as Json,
      status: "pending",
      source: "abandoned_checkout",
    })
    .select("id")
    .single();

  if (insertError || !freeAudit) {
    // Check for race condition (duplicate)
    if (insertError?.code === "23505") {
      console.log(`[Webhook] Race condition: free audit already exists for ${displayEmail}`);
      return;
    }
    console.error("[Webhook] Failed to create free audit for abandoned checkout:", insertError);
    return;
  }

  console.log(`[Webhook] Created free audit ${freeAudit.id} for abandoned session ${session.id}`);

  // Track abandonment recovery
  trackServerEvent(session.id, "cart_abandonment_free_audit_created", {
    free_audit_id: freeAudit.id,
    email_domain: displayEmail.split("@")[1],
  });

  // Run free pipeline - the pipeline will send the appropriate email based on source
  runFreePipeline(freeAudit.id, runInput).catch((err) => {
    console.error("[Webhook] Free pipeline failed for abandoned checkout audit:", freeAudit.id, err);
  });

  // Send magic link for dashboard access
  sendMagicLink(displayEmail, "/dashboard").catch((err) => {
    console.error("[Webhook] Magic link failed for abandoned checkout:", freeAudit.id, err);
  });
}
