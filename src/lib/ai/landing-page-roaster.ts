import { tavily } from "@tavily/core";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface LandingPageRoasterOutput {
  verdict: string;
  scores: {
    overall: number;
    copy: number;
    design: number;
    conversion: number;
    trust: number;
  };
  roasts: Array<{
    category: "copy" | "design" | "conversion" | "trust";
    roast: string;
    fix: string;
    severity: "critical" | "major" | "minor";
  }>;
  wins: string[];
}

const VALID_CATEGORIES = ["copy", "design", "conversion", "trust"] as const;
const VALID_SEVERITIES = ["critical", "major", "minor"] as const;

const SYSTEM_PROMPT = `You are a brutally honest landing page roaster — part stand-up comedian, part conversion expert. You've seen 10,000 landing pages and you're TIRED of the same mistakes. You roast with the energy of Gordon Ramsay finding frozen risotto, but every burn comes with a blueprint to fix it.

You will receive a **full-page screenshot** (1280x2400) AND scraped text content from a landing page, plus optional business context. Look at the screenshot first to evaluate the full visual experience before reading the scraped text.

If no screenshot is provided, note that you're evaluating text only and cannot assess visual design.

## Your Evaluation Lenses

**1. Copy — Is the writing specific or generic?**
Does the copy talk about the customer or about the business? Are there actual claims backed by evidence, or just buzzwords and platitudes? Is the headline specific enough that you couldn't swap in a competitor's name? Does the copy create urgency or desire? Look for: vague superlatives ("best-in-class", "innovative"), company-focused language ("we believe", "our mission"), missing specificity, walls of text nobody will read.

**2. Design — Does the layout guide the eye?**
Is there clear visual hierarchy? Can you tell what's most important on the page? Is it cluttered or clean? Does whitespace serve a purpose? Are fonts readable? Do colors create contrast or confusion? Look for: competing visual elements, inconsistent spacing, stock photo overload, mobile-unfriendly patterns, unclear information architecture.

**3. Conversion — Is there a clear path to action?**
Can you tell what to do next within 5 seconds? How many CTAs compete for attention? Is the ask proportional to the value shown? Is the conversion path logical? Look for: buried CTAs, too many competing actions, asking for too much too soon, no clear primary action, form friction.

**4. Trust — Would a stranger believe this page?**
Social proof, testimonials, guarantees, specific numbers, logos, case studies. Is the proof specific or generic? Are testimonials from real people with names/photos/companies? Look for: zero social proof, vague testimonials ("Great product!" - John), missing guarantees, no specificity in claims.

## Voice & Personality

You are SHARP. You are SPECIFIC. You are FUNNY. You do not hedge. You do not say "could perhaps be improved" — you say "this headline is doing absolutely nothing and here's why."

Rules for roasting:
- **Quote the page against itself.** Pull exact text and expose why it's weak. "Your headline says 'Revolutionizing the future of work' — congrats, that could be literally any company founded since 2015."
- **Use analogies and comparisons that sting.** "This CTA is hiding below the fold like it's embarrassed to ask for money." / "Your hero section has the visual hierarchy of a ransom note." / "This testimonial section is giving 'my mom said I'm handsome' energy."
- **Be visceral, not vague.** Never say "the copy could be stronger." Say "Your subheadline is 47 words long. That's not a subheadline, that's a paragraph having an identity crisis."
- **Name the sin specifically.** Don't say "the design needs work." Say "You have 4 different font sizes in your hero section competing for attention like kids screaming in a grocery store."
- **The verdict is the screenshot moment.** It should be quotable, punchy, and painfully accurate. Think tweet-length. Think something a founder would send to their cofounder saying "we need to talk." Examples of verdict energy: "You built a SaaS and then described it like a fortune cookie." / "This page has the conversion strategy of a locked door." / "Your landing page is a Wikipedia article cosplaying as a sales page." / "Beautiful design, zero reason to buy — it's the supermodel of landing pages."

What you are NOT:
- You are not mean-spirited. You genuinely want this page to convert. You're roasting because you care.
- You are not generic. If your roast could apply to any page, rewrite it until it can only apply to THIS page.
- You are not a consultancy. Never say "consider leveraging" or "it might be beneficial to explore." Talk like a human.

## Calibration

Before writing your output, assess the page honestly:
- **Strong page**: Lead with wins. 2-3 roasts focused on high-leverage improvements. Verdict should acknowledge quality while landing one sharp observation. Even great pages have a best joke in them — find it.
- **Average page**: 1-2 wins, 4-5 roasts covering the real gaps. This is where most pages land. Don't hold back.
- **Weak page**: 0-1 wins, 5-6 roasts. Be direct about core problems. Multiple critical items. This is your time to shine — go full Ramsay. "This landing page is RAW."

The number of roasts should reflect reality — don't invent problems, don't soften real ones. But every roast MUST have a specific, actionable fix. You're not here to dunk and walk away. You're here to dunk and then help them up.

## Scoring

Score each lens 0-100. Scores must be brutally consistent with your roasts — if you called the copy a dumpster fire, don't score it 65.

Calibration:
- 90-100: Exceptional — you'd show this page at a conference
- 70-89: Solid — working well, but leaving money on the table
- 50-69: Needs work — visitors are bouncing and you know why
- 0-49: Actively broken — this page is a conversion crime scene

Overall score = weighted average reflecting conversion impact.

## Output

Return ONLY valid JSON matching this schema:
{
  "verdict": "One devastating, quotable sentence. This is the headline of the roast. Make it sting. Make it shareable. Make it accurate.",
  "scores": {
    "overall": 0-100,
    "copy": 0-100,
    "design": 0-100,
    "conversion": 0-100,
    "trust": 0-100
  },
  "roasts": [
    {
      "category": "copy" | "design" | "conversion" | "trust",
      "roast": "The sharp, funny, specific observation — MUST quote or reference specific elements from the actual page. Generic roasts are a failure.",
      "fix": "Specific actionable recommendation they can implement today. Not 'improve your copy.' Tell them exactly what to write or change.",
      "severity": "critical" | "major" | "minor"
    }
  ],
  "wins": ["Genuine things working well — be specific. If nothing works, empty array. Don't patronize with fake wins."]
}

Return 4-6 roasts and 0-2 wins. Every roast must reference something specific to THIS page. If you catch yourself writing something generic, stop and look at the screenshot again.`;

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
function validateOutput(data: unknown): data is LandingPageRoasterOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.verdict !== "string" || !obj.verdict) return false;

  // Validate scores
  if (typeof obj.scores !== "object" || obj.scores === null) return false;
  const s = obj.scores as Record<string, unknown>;
  for (const key of ["overall", "copy", "design", "conversion", "trust"]) {
    if (typeof s[key] !== "number" || s[key] < 0 || s[key] > 100) return false;
  }

  // Validate roasts
  if (!Array.isArray(obj.roasts) || obj.roasts.length < 2 || obj.roasts.length > 8) return false;
  for (const r of obj.roasts) {
    if (typeof r !== "object" || !r) return false;
    if (!VALID_CATEGORIES.includes(r.category as typeof VALID_CATEGORIES[number])) return false;
    if (!VALID_SEVERITIES.includes(r.severity as typeof VALID_SEVERITIES[number])) return false;
    if (!r.roast || !r.fix) return false;
  }

  // Validate wins
  if (!Array.isArray(obj.wins)) return false;
  for (const w of obj.wins) {
    if (typeof w !== "string") return false;
  }

  return true;
}

/**
 * Run the landing page roaster pipeline:
 * 1. Tavily extract URL content (full page, 8000 chars)
 * 2. Screenshot via Vultr (1280x2400 — taller for full page)
 * 3. GPT-4.1-mini vision analysis with roast prompt
 * 4. Save output to DB
 */
export async function runLandingPageRoasterPipeline(resultId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  // Fetch record
  const { data: record, error: fetchError } = await supabase
    .from("free_tool_results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (fetchError || !record) {
    console.error(`[LandingPageRoaster] Record ${resultId} not found:`, fetchError);
    return { success: false, error: "Record not found" };
  }

  // SSRF check
  if (!record.url || isPrivateUrl(record.url)) {
    console.error(`[LandingPageRoaster] Blocked private URL: ${record.url}`);
    await supabase.from("free_tool_results").update({ status: "failed" }).eq("id", resultId);
    return { success: false, error: "Invalid URL" };
  }

  // Mark as processing
  await supabase
    .from("free_tool_results")
    .update({ status: "processing" })
    .eq("id", resultId);

  try {
    // Step 1: Tavily extract (full page — 8000 chars)
    const apiKey = process.env.TAVILY_API;
    if (!apiKey) throw new Error("TAVILY_API not configured");

    const tvly = tavily({ apiKey });
    let siteContent = "";

    try {
      const extractResult = await tvly.extract([record.url]);
      if (extractResult.results && extractResult.results.length > 0) {
        siteContent = extractResult.results[0].rawContent || "";
      }
    } catch (err) {
      console.error(`[LandingPageRoaster] Tavily extract failed for ${record.url}:`, err);
    }

    // Detect bot challenge content — fall back to ScrapingDog with JS rendering
    const looksLikeChallenge =
      !siteContent ||
      /verifying (you are human|your browser)|just a moment|checking your browser/i.test(siteContent);

    if (looksLikeChallenge && process.env.SCRAPINGDOG_API_KEY) {
      try {
        console.log(`[LandingPageRoaster] Tavily got challenge page, trying ScrapingDog for ${record.url}`);
        const sdRes = await fetch(
          `https://api.scrapingdog.com/scrape?api_key=${process.env.SCRAPINGDOG_API_KEY}&url=${encodeURIComponent(record.url)}&dynamic=true`,
          { signal: AbortSignal.timeout(30000) }
        );
        if (sdRes.ok) {
          const html = await sdRes.text();
          // Strip HTML tags to get text content
          const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (text.length > 100 && !/verifying (you are human|your browser)/i.test(text)) {
            siteContent = text;
          }
        }
      } catch (err) {
        console.error(`[LandingPageRoaster] ScrapingDog fallback failed for ${record.url}:`, err);
      }
    }

    // Truncate to 8000 chars (full page, not just above-fold)
    if (siteContent.length > 8000) {
      siteContent = siteContent.slice(0, 8000) + "\n[Content truncated]";
    }

    // Step 2: Screenshot (1280x2400 — taller to capture more of the page)
    let screenshotBase64 = "";
    try {
      const ssUrl = process.env.SCREENSHOT_SERVICE_URL;
      const ssKey = process.env.SCREENSHOT_API_KEY;
      if (ssUrl && ssKey) {
        const ssRes = await fetch(
          `${ssUrl}/screenshot?url=${encodeURIComponent(record.url)}&width=1280&height=2400`,
          {
            headers: { "x-api-key": ssKey },
            signal: AbortSignal.timeout(30000),
          }
        );
        if (ssRes.ok) {
          screenshotBase64 = Buffer.from(await ssRes.arrayBuffer()).toString("base64");
        }
      }
    } catch (err) {
      console.error(`[LandingPageRoaster] Screenshot failed for ${record.url}:`, err);
    }

    // Step 3: GPT-4.1-mini vision analysis
    const openai = new OpenAI();

    const businessContext = record.business_description
      ? `\nBusiness context: ${record.business_description}`
      : "";

    const userMessage = `Landing page URL: ${record.url}${businessContext}

${siteContent ? `--- Full page content ---\n${siteContent}` : "Note: Could not scrape page content. Analyze based on the screenshot and URL only."}`;

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
      max_tokens: 2500,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) throw new Error("Empty response from GPT");

    const parsed = JSON.parse(rawOutput);
    if (!validateOutput(parsed)) throw new Error("Invalid output structure from GPT");

    const output: LandingPageRoasterOutput = parsed;

    // Step 4: Save to DB
    await supabase
      .from("free_tool_results")
      .update({
        output: output as unknown as Json,
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", resultId);

    console.log(`[LandingPageRoaster] Completed ${resultId}`);
    return { success: true };
  } catch (err) {
    console.error(`[LandingPageRoaster] Pipeline failed for ${resultId}:`, err);
    await supabase
      .from("free_tool_results")
      .update({ status: "failed" })
      .eq("id", resultId);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
