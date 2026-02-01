import { tavily } from "@tavily/core";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface MarketingAuditOutput {
  silentKiller: string;
  summary: string;
  scores: {
    overall: number;
    clarity: number;
    visibility: number;
    proof: number;
    advantage: number;
    // Backward compat for old stored results
    customerFocus?: number;
    friction?: number;
  };
  findings: Array<{
    category: "clarity" | "visibility" | "proof" | "advantage";
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

Your job is to give an honest, proportionate diagnosis. Some sites genuinely fail these questions. Others pass some and miss others. A few nail all three. Your assessment must match reality — don't manufacture problems that aren't there, and don't soften real ones.

You will receive a **screenshot** of the homepage AND scraped text content from a business website, plus a one-liner about what the business does. Look at the screenshot first to evaluate the visual experience before reading the scraped text.

If no screenshot is provided, note that you're evaluating text only and cannot assess visual hierarchy, CTA prominence, or above-the-fold layout.

## Your Diagnostic Lens

Evaluate through these four lenses. For each, determine whether the site is strong, adequate, or weak. Only report a finding when there is a genuine issue worth fixing.

**1. Clarity — Can a Stranger Tell What This Business Does?**
Look at the screenshot first. What's the visual hierarchy? Can you read the headline, subhead, and CTA at a glance? Evaluate the full above-the-fold experience as a visitor would see it — layout, font sizes, whitespace, and how elements guide the eye. The 3-second test measures whether a first-time visitor can answer "what does this company do?" after seeing the full above-the-fold section — NOT whether the headline alone literally states the product. An emotional or benefit-focused headline (e.g., "Wrestling with projects?") paired with a clear subhead and CTA is a PASS. Only flag clarity as an issue if a visitor would genuinely struggle to understand what the business does after reading the headline AND subhead AND CTA together. Do not penalize headlines for being emotional, aspirational, or benefit-focused — that's good copywriting, not a clarity problem.

**2. Visibility — Can the Target Audience Find You?**
From what you can see on the page: are there signals that this business is discoverable? Look for: SEO-friendly headlines (specific keywords vs. vague slogans), clear navigation structure, meta signals, blog/content links, social media presence, local signals (address, map), or any indication of channel strategy. A site that says "innovative solutions" with no specific keywords is invisible to search. A site with a clear "Marketing Automation for SaaS Founders" headline is findable. The question is: if someone had the problem this business solves, could they find this site?

**3. Proof — Do You Have Evidence That Builds Trust?**
Can you see testimonials, logos, or social proof in the screenshot? Where are they positioned? Look for: specific customer results, testimonials with outcomes, before/after examples, case studies, portfolio work, review counts, or concrete metrics. Different types of proof work for different businesses — a bakery showing photos of their work IS proof. Client logos for a B2B company IS proof. Don't dismiss valid proof because it isn't in your preferred format. The question is: would a stranger believe this business delivers? If there's no proof at all, that's a real issue. If proof exists but could be stronger, say that proportionately.

**4. Advantage — What Makes You Different?**
Is the differentiation visible on the page? Can a visitor tell why they should choose this over alternatives? Look for: unique value propositions, specific claims competitors can't make, proprietary methods/tools, niche focus, or clear "why us" sections. A site that sounds like every other business in its category has no visible advantage. A site that says "The only X that does Y" or leads with a specific, defensible claim has advantage. The question is: could you swap the company name with a competitor's and the page would still make sense? If yes, there's no visible advantage.

## Voice

Be direct and specific. Quote actual copy from the site to ground your observations. When something is genuinely wrong, name it clearly — don't soften real problems. But when something is working, say so with equal confidence. You're a consultant who calls it like you see it — that means honest praise is just as important as honest critique. Credibility comes from accuracy, not negativity.

## Calibration

Before writing your output, mentally score the site:
- **Strong site** (clear value prop, customer-focused, has proof, low friction): Lead with what's working. silentKiller should frame the biggest *opportunity* to go from good to great. 1-2 findings maximum, focused on high-leverage improvements.
- **Average site** (some things working, some not): Acknowledge strengths in the summary, then focus findings on the real gaps. 2-3 findings.
- **Weak site** (unclear, company-focused, no proof, high friction): Be direct about the core problems. 3-4 findings covering the major issues.

The number of findings should reflect the actual number of real issues — not a quota.

## Output Rules

- **silentKiller**: The single most impactful thing they should address. On a weak site, this is the biggest thing costing them customers. On a strong site, this is the highest-leverage opportunity to improve. Always reference specific content from their site. One sentence, plain language.
- **summary**: 2-3 sentences. Start with what's working (if applicable), then name the pattern: customer-focused or company-focused? Clear or confusing? Proof-heavy or claim-heavy? Be proportionate — a mostly-good site should get a mostly-positive summary.
- **findings**: Return 1-4 findings based on how many real issues exist. Each finding must:
  - Quote or reference SPECIFIC content from the site (headlines, CTAs, copy you can see)
  - Explain the impact on a first-time visitor
  - Give one specific, actionable fix they can implement today
  Spread findings across different diagnostic lenses when possible. Do NOT invent findings to fill a quota. If the site only has one real issue, return one finding.

## Scoring

Score each diagnostic lens 0-100 and compute an overall score. Scores must be consistent with your findings — don't score 85 for clarity then report a finding saying the headline is confusing.

Calibration:
- 90-100: Exceptional — best-in-class for this lens
- 70-89: Solid — working well with room for improvement
- 50-69: Needs work — noticeable gaps hurting conversion
- 0-49: Significant problems — this is actively costing customers

The overall score should reflect the weighted importance of each lens to conversion.

Return ONLY valid JSON matching this schema:
{
  "silentKiller": "The single biggest issue or opportunity",
  "summary": "2-3 sentence diagnostic summary",
  "scores": {
    "overall": 0-100,
    "clarity": 0-100,
    "visibility": 0-100,
    "proof": 0-100,
    "advantage": 0-100
  },
  "findings": [
    {
      "category": "clarity" | "visibility" | "proof" | "advantage",
      "title": "Short finding title",
      "detail": "What you observed (quote specific content from the site)",
      "recommendation": "Specific action to fix it"
    }
  ]
}`;

const VALID_CATEGORIES = ["clarity", "visibility", "proof", "advantage"] as const;

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
  if (!Array.isArray(obj.findings) || obj.findings.length < 1 || obj.findings.length > 4) return false;
  // Validate scores
  if (typeof obj.scores === "object" && obj.scores !== null) {
    const s = obj.scores as Record<string, unknown>;
    for (const key of ["overall", "clarity", "visibility", "proof", "advantage"]) {
      if (typeof s[key] !== "number" || s[key] < 0 || s[key] > 100) return false;
    }
  } else {
    return false;
  }
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
    .from("free_tool_results")
    .select("*")
    .eq("id", auditId)
    .single();

  if (fetchError || !audit) {
    console.error(`[MarketingAudit] Audit ${auditId} not found:`, fetchError);
    return { success: false, error: "Audit not found" };
  }

  // SSRF check
  if (!audit.url || isPrivateUrl(audit.url)) {
    console.error(`[MarketingAudit] Blocked private URL: ${audit.url}`);
    await supabase.from("free_tool_results").update({ status: "failed" }).eq("id", auditId);
    return { success: false, error: "Invalid URL" };
  }

  // Mark as processing
  await supabase
    .from("free_tool_results")
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

    // Step 1b: Screenshot capture
    let screenshotBase64 = "";
    try {
      const ssUrl = process.env.SCREENSHOT_SERVICE_URL;
      const ssKey = process.env.SCREENSHOT_API_KEY;
      if (ssUrl && ssKey) {
        const ssRes = await fetch(
          `${ssUrl}/screenshot?url=${encodeURIComponent(audit.url)}&width=1280&height=800`,
          {
            headers: { "x-api-key": ssKey },
            signal: AbortSignal.timeout(20000),
          }
        );
        if (ssRes.ok) {
          screenshotBase64 = Buffer.from(await ssRes.arrayBuffer()).toString("base64");
        }
      }
    } catch (err) {
      console.error(`[MarketingAudit] Screenshot failed for ${audit.url}:`, err);
    }

    // Step 2: GPT-4.1-mini analysis
    const openai = new OpenAI();

    const userMessage = `Website URL: ${audit.url}
Business description: ${audit.business_description}

${siteContent ? `--- Scraped website content ---\n${siteContent}` : "Note: Could not scrape website content. Analyze based on the URL and business description only, and note that you couldn't access the site."}`;

    const userContent: Array<{ type: "image_url"; image_url: { url: string } } | { type: "text"; text: string }> = [];
    if (screenshotBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` },
      });
    }
    userContent.push({ type: "text", text: userMessage });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) throw new Error("Empty response from GPT");

    const parsed = JSON.parse(rawOutput);
    if (!validateOutput(parsed)) throw new Error("Invalid output structure from GPT");

    const output: MarketingAuditOutput = parsed;

    // Step 3: Save to DB
    await supabase
      .from("free_tool_results")
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
      .from("free_tool_results")
      .update({ status: "failed" })
      .eq("id", auditId);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
