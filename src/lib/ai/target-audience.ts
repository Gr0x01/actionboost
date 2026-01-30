import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface TargetAudienceOutput {
  primaryAudience: {
    headline: string;
    demographics: {
      ageRange: string;
      gender: string;
      income: string;
      education: string;
      location: string;
    };
    psychographics: {
      values: string[];
      interests: string[];
      lifestyle: string;
    };
    painPoints: string[];
    buyingTriggers: string[];
    objections: string[];
    whereToFind: Array<{
      platform: string;
      detail: string;
    }>;
    dayInTheLife: string;
  };
  messagingGuide: {
    hookExamples: string[];
    toneAdvice: string;
    wordsToUse: string[];
    wordsToAvoid: string[];
  };
  competitorInsight: string;
}

const SYSTEM_PROMPT = `You are a customer research strategist. Given a business description, you produce a detailed target audience profile that helps the business owner understand exactly who they should be selling to and how to reach them.

Your output must be specific and actionable — not generic personas. Ground everything in the business's actual market.

## Output Rules

Return ONLY valid JSON matching this schema:
{
  "primaryAudience": {
    "headline": "One sentence describing the ideal customer in vivid, specific terms (not 'small business owners' — more like 'Solo consultants making $80-150K who know they need marketing but hate doing it')",
    "demographics": {
      "ageRange": "e.g. 28-45",
      "gender": "e.g. Skews female (65%) but not exclusively",
      "income": "e.g. $60K-120K household",
      "education": "e.g. College-educated, often with advanced degrees",
      "location": "e.g. Urban/suburban US, UK, Canada, Australia"
    },
    "psychographics": {
      "values": ["3-5 core values, e.g. 'Efficiency over perfection'"],
      "interests": ["3-5 interests beyond your product"],
      "lifestyle": "2-3 sentence description of their daily reality"
    },
    "painPoints": ["4-6 specific pain points — not generic. Quote what they'd actually say to a friend."],
    "buyingTriggers": ["3-5 moments or events that make them ready to buy NOW"],
    "objections": ["3-5 reasons they hesitate before purchasing — the internal dialogue"],
    "whereToFind": [
      {"platform": "Specific platform or channel", "detail": "What they do there, which communities/groups/hashtags"}
    ],
    "dayInTheLife": "A vivid 3-4 sentence narrative of a typical day, showing where your product fits into their routine and emotional state"
  },
  "messagingGuide": {
    "hookExamples": ["3 specific headline/hook examples they'd stop scrolling for"],
    "toneAdvice": "2-3 sentences on the right voice and tone for this audience",
    "wordsToUse": ["8-12 words/phrases that resonate with this audience"],
    "wordsToAvoid": ["5-8 words/phrases that would turn them off or feel generic"]
  },
  "competitorInsight": "2-3 sentences on how competitors typically talk to this audience and what gap this business can own"
}

Be specific to the business. Reference their actual product/service. If optional customer description is provided, use it as a starting point but challenge or expand it based on what would actually work best for the business.`;

function validateOutput(data: unknown): data is TargetAudienceOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  // Check top-level keys
  if (!obj.primaryAudience || typeof obj.primaryAudience !== "object") return false;
  if (!obj.messagingGuide || typeof obj.messagingGuide !== "object") return false;
  if (typeof obj.competitorInsight !== "string") return false;

  const pa = obj.primaryAudience as Record<string, unknown>;
  if (typeof pa.headline !== "string" || !pa.headline) return false;
  if (!pa.demographics || typeof pa.demographics !== "object") return false;
  if (!Array.isArray(pa.painPoints) || pa.painPoints.length < 1) return false;
  if (!Array.isArray(pa.buyingTriggers) || pa.buyingTriggers.length < 1) return false;
  if (!Array.isArray(pa.objections) || pa.objections.length < 1) return false;
  if (!Array.isArray(pa.whereToFind) || pa.whereToFind.length < 1) return false;
  if (typeof pa.dayInTheLife !== "string") return false;

  const mg = obj.messagingGuide as Record<string, unknown>;
  if (!Array.isArray(mg.hookExamples) || mg.hookExamples.length < 1) return false;
  if (typeof mg.toneAdvice !== "string") return false;
  if (!Array.isArray(mg.wordsToUse) || mg.wordsToUse.length < 1) return false;
  if (!Array.isArray(mg.wordsToAvoid) || mg.wordsToAvoid.length < 1) return false;

  return true;
}

export async function runTargetAudiencePipeline(resultId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: record, error: fetchError } = await supabase
    .from("free_tool_results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (fetchError || !record) {
    console.error(`[TargetAudience] Record ${resultId} not found:`, fetchError);
    return { success: false, error: "Record not found" };
  }

  // Mark as processing
  await supabase
    .from("free_tool_results")
    .update({ status: "processing" })
    .eq("id", resultId);

  try {
    const input = record.input as { businessName: string; whatTheySell: string; targetCustomer?: string } | null;
    if (!input?.businessName || !input?.whatTheySell) {
      throw new Error("Missing required input fields");
    }

    const userMessage = `Business name: ${input.businessName}
What they sell: ${input.whatTheySell}
${input.targetCustomer ? `Who the owner thinks their customer is: ${input.targetCustomer}` : "No existing customer description provided — figure out who the ideal customer is from scratch."}`;

    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2500,
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

    console.log(`[TargetAudience] Completed ${resultId}`);
    return { success: true };
  } catch (err) {
    console.error(`[TargetAudience] Pipeline failed for ${resultId}:`, err);
    await supabase
      .from("free_tool_results")
      .update({ status: "failed" })
      .eq("id", resultId);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
