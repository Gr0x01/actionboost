import { tavily } from "@tavily/core";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface MarketingAuditOutput {
  silentKiller: string;
  summary: string;
  findings: Array<{
    category: "clarity" | "customer-focus" | "proof" | "friction";
    title: string;
    detail: string;
    recommendation: string;
  }>;
}

const SYSTEM_PROMPT = `You are a marketing consultant running The 3-Second Test on small business websites.

The test: When a stranger lands on this site, can they answer three questions in 3 seconds?
1. What does this business sell?
2. Who is it for?
3. Why should I pick them over an alternative?

Most small business sites fail all three. Your job is to diagnose exactly where and why — using specific observations from the site content.

You will receive scraped content from a business website and a one-liner about what the business does.

## Your Diagnostic Lens

Evaluate through these four lenses:

**1. Clarity — What Makes Them the Only Choice**
Can you identify what makes this business the *only* choice — not just a better choice? Is there a clear differentiator in the headline, subheadline, or first visible section? Or do they sound like every other competitor?

**2. Customer vs. Company Focus**
Is the site talking about themselves ("We are..." / "Our story..." / "Our team...") or about the customer's problem ("You need..." / "Your business is struggling with...")? If you see more "we" than "you," that's a red flag. Count the ratio in the homepage copy.

**3. Proof of Transformation**
Does the site show what customers *become* after working with them, or just what the business *does*? Look for: specific customer results, before/after stories, testimonials with outcomes (not just "great service!"), case studies. Generic trust badges ("500+ clients") don't count — that's a number, not proof.

**4. Friction — What's Stopping the Next Step**
What's stopping a visitor from taking action? Is there one clear CTA or multiple competing ones? Is the CTA obvious, or buried? Can someone book/buy/contact without hunting? Count how many different actions the homepage asks for. More than 2 = confusion.

## Voice

Be direct and specific. Name the real problem, not the polite version. Quote actual copy from the site to show what you mean. If the headline is vague, quote it and explain why. If the CTA is buried, say where. Don't hedge ("this might be confusing") — diagnose ("this is confusing because..."). You're a consultant who's seen 1000 sites like this, not a diplomat trying to be nice.

## Output Rules

- **silentKiller**: Name the one biggest thing costing them customers. One sentence, plain language. Quote or reference specific content from their site. Example: "Your homepage headline is 'Welcome to ABC Salon' — visitors have no idea what you do or why they should care."
- **summary**: 2-3 sentences. What's the overall pattern — customer-focused or company-focused? Clear or confusing? Proof-heavy or claim-heavy? Name what's working (if anything) and what's not.
- **findings**: Return exactly 3-4 findings. Each finding must:
  - Quote or reference SPECIFIC content from the site (headlines, CTAs, copy you can see)
  - Explain why it's a problem for a first-time visitor
  - Give one specific, actionable fix they can make today
  Prioritize findings from different diagnostic lenses (clarity, customer-focus, proof, friction). Don't give 4 clarity findings — spread them out.

Return ONLY valid JSON matching this schema:
{
  "silentKiller": "The single biggest thing costing them customers",
  "summary": "2-3 sentence diagnostic summary",
  "findings": [
    {
      "category": "clarity" | "customer-focus" | "proof" | "friction",
      "title": "Short finding title",
      "detail": "What you observed (quote specific content from the site)",
      "recommendation": "Specific action to fix it"
    }
  ]
}`;

const VALID_CATEGORIES = ["clarity", "customer-focus", "proof", "friction"] as const;

/** Block private/internal IP ranges (SSRF protection) */
function isPrivateUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1$|fe80:)/i.test(hostname)
      || !hostname.includes(".");
  } catch {
    return true;
  }
}

/** Validate GPT output matches expected shape */
function validateOutput(data: unknown): data is MarketingAuditOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.silentKiller !== "string" || !obj.silentKiller) return false;
  if (typeof obj.summary !== "string" || !obj.summary) return false;
  if (!Array.isArray(obj.findings) || obj.findings.length < 1) return false;
  for (const f of obj.findings) {
    if (typeof f !== "object" || !f) return false;
    if (!VALID_CATEGORIES.includes(f.category as typeof VALID_CATEGORIES[number])) return false;
    if (!f.title || !f.detail || !f.recommendation) return false;
  }
  return true;
}

/**
 * Run the marketing audit pipeline:
 * 1. Tavily extract URL content
 * 2. GPT-4.1-mini analyze
 * 3. Save output to DB
 */
export async function runMarketingAuditPipeline(auditId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  // Fetch audit record
  const { data: audit, error: fetchError } = await supabase
    .from("marketing_audits")
    .select("*")
    .eq("id", auditId)
    .single();

  if (fetchError || !audit) {
    console.error(`[MarketingAudit] Audit ${auditId} not found:`, fetchError);
    return { success: false, error: "Audit not found" };
  }

  // SSRF check
  if (isPrivateUrl(audit.url)) {
    console.error(`[MarketingAudit] Blocked private URL: ${audit.url}`);
    await supabase.from("marketing_audits").update({ status: "failed" }).eq("id", auditId);
    return { success: false, error: "Invalid URL" };
  }

  // Mark as processing
  await supabase
    .from("marketing_audits")
    .update({ status: "processing" })
    .eq("id", auditId);

  try {
    // Step 1: Tavily extract
    const apiKey = process.env.TAVILY_API;
    if (!apiKey) throw new Error("TAVILY_API not configured");

    const tvly = tavily({ apiKey });
    let siteContent = "";

    try {
      const extractResult = await tvly.extract([audit.url]);
      if (extractResult.results && extractResult.results.length > 0) {
        siteContent = extractResult.results[0].rawContent || "";
      }
    } catch (err) {
      console.error(`[MarketingAudit] Tavily extract failed for ${audit.url}:`, err);
    }

    // Truncate to ~5000 chars to keep costs low
    if (siteContent.length > 5000) {
      siteContent = siteContent.slice(0, 5000) + "\n[Content truncated]";
    }

    // Step 2: GPT-4.1-mini analysis
    const openai = new OpenAI();

    const userMessage = `Website URL: ${audit.url}
Business description: ${audit.business_description}

${siteContent ? `--- Scraped website content ---\n${siteContent}` : "Note: Could not scrape website content. Analyze based on the URL and business description only, and note that you couldn't access the site."}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) throw new Error("Empty response from GPT");

    const parsed = JSON.parse(rawOutput);
    if (!validateOutput(parsed)) throw new Error("Invalid output structure from GPT");

    const output: MarketingAuditOutput = parsed;

    // Step 3: Save to DB
    await supabase
      .from("marketing_audits")
      .update({
        output: output as unknown as Json,
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", auditId);

    console.log(`[MarketingAudit] Completed audit ${auditId}`);
    return { success: true };
  } catch (err) {
    console.error(`[MarketingAudit] Pipeline failed for ${auditId}:`, err);
    await supabase
      .from("marketing_audits")
      .update({ status: "failed" })
      .eq("id", auditId);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
