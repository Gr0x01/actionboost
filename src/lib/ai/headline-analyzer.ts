import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface HeadlineAnalysisOutput {
  overall: number;
  scores: {
    clarity: number;
    specificity: number;
    differentiation: number;
    customerFocus: number;
  };
  verdict: string;
  analysis: {
    clarity: string;
    specificity: string;
    differentiation: string;
    customerFocus: string;
  };
  rewrites: Array<{
    headline: string;
    why: string;
  }>;
}

const SYSTEM_PROMPT = `You are a headline and value proposition analyst. Given a headline/tagline and optional business context, you evaluate how clear, specific, differentiated, and customer-focused it is.

## Scoring Categories (0-100 each)

**Clarity** — Can a stranger immediately understand what this business does?
- 90-100: Crystal clear in under 3 seconds
- 70-89: Clear with minor ambiguity
- 50-69: Takes effort to understand
- 0-49: Confusing or meaningless to outsiders

**Specificity** — Does it contain concrete details or just buzzwords?
- 90-100: Specific numbers, outcomes, or details
- 70-89: Mostly specific with minor vagueness
- 50-69: Generic language mixed with some specifics
- 0-49: Pure buzzwords ("innovative solutions," "world-class," "cutting-edge")

**Differentiation** — Could a competitor use this exact headline?
- 90-100: Unique to this business, no one else could claim it
- 70-89: Mostly unique with some generic elements
- 50-69: Could apply to several competitors
- 0-49: Interchangeable with any competitor

**Customer Focus** — Does it speak to a specific person's problem or desire?
- 90-100: Clearly addresses a specific audience's need
- 70-89: Implies the customer benefit
- 50-69: Product-focused rather than customer-focused
- 0-49: No clear audience or benefit

## Rules
- Be honest. Most headlines score 30-55.
- Every score needs specific evidence from the headline itself.
- NEVER use emojis.
- Rewrites must use information from the business context to be specific.
- If no business context is provided, rewrites should demonstrate the STRUCTURE of a good headline while noting what specifics are missing.

## Output Format

Return ONLY valid JSON:
{
  "overall": <weighted average: clarity 35%, specificity 25%, differentiation 20%, customerFocus 20%>,
  "scores": {
    "clarity": <0-100>,
    "specificity": <0-100>,
    "differentiation": <0-100>,
    "customerFocus": <0-100>
  },
  "verdict": "<1 sentence: the single biggest problem with this headline>",
  "analysis": {
    "clarity": "<1-2 sentences with specific evidence>",
    "specificity": "<1-2 sentences with specific evidence>",
    "differentiation": "<1-2 sentences with specific evidence>",
    "customerFocus": "<1-2 sentences with specific evidence>"
  },
  "rewrites": [
    {"headline": "<rewritten headline>", "why": "<1 sentence explaining what this fixes>"},
    {"headline": "<rewritten headline>", "why": "<1 sentence explaining what this fixes>"},
    {"headline": "<rewritten headline>", "why": "<1 sentence explaining what this fixes>"}
  ]
}`;

function validateOutput(data: unknown): data is HeadlineAnalysisOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.overall !== "number") return false;
  if (typeof obj.verdict !== "string" || !obj.verdict) return false;

  const scores = obj.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores !== "object") return false;
  if (typeof scores.clarity !== "number") return false;
  if (typeof scores.specificity !== "number") return false;
  if (typeof scores.differentiation !== "number") return false;
  if (typeof scores.customerFocus !== "number") return false;

  const analysis = obj.analysis as Record<string, unknown> | undefined;
  if (!analysis || typeof analysis !== "object") return false;
  if (typeof analysis.clarity !== "string") return false;
  if (typeof analysis.specificity !== "string") return false;
  if (typeof analysis.differentiation !== "string") return false;
  if (typeof analysis.customerFocus !== "string") return false;

  if (!Array.isArray(obj.rewrites) || obj.rewrites.length < 1) return false;
  for (const r of obj.rewrites) {
    if (typeof r !== "object" || !r) return false;
    if (typeof (r as Record<string, unknown>).headline !== "string") return false;
    if (typeof (r as Record<string, unknown>).why !== "string") return false;
  }

  return true;
}

export async function runHeadlineAnalysisPipeline(resultId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: record, error: fetchError } = await supabase
    .from("free_tool_results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (fetchError || !record) {
    console.error(`[HeadlineAnalyzer] Record ${resultId} not found:`, fetchError);
    return { success: false, error: "Record not found" };
  }

  await supabase
    .from("free_tool_results")
    .update({ status: "processing" })
    .eq("id", resultId);

  try {
    const input = record.input as { headline: string; whatTheySell?: string; whoItsFor?: string } | null;
    if (!input?.headline) {
      throw new Error("Missing required headline input");
    }

    let userMessage = `Headline to analyze: "${input.headline}"`;
    if (input.whatTheySell) {
      userMessage += `\nWhat the business sells: ${input.whatTheySell}`;
    }
    if (input.whoItsFor) {
      userMessage += `\nWho it's for: ${input.whoItsFor}`;
    }

    const openai = new OpenAI();

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

    await supabase
      .from("free_tool_results")
      .update({
        output: parsed as unknown as Json,
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", resultId);

    console.log(`[HeadlineAnalyzer] Completed ${resultId}`);
    return { success: true };
  } catch (err) {
    console.error(`[HeadlineAnalyzer] Pipeline failed for ${resultId}:`, err);
    await supabase
      .from("free_tool_results")
      .update({ status: "failed" })
      .eq("id", resultId);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
