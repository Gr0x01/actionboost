/**
 * Generate target audience examples for programmatic SEO pages.
 *
 * Usage: npx tsx scripts/generate-target-audience-examples.ts
 *
 * Requires OPENAI_API_KEY env var.
 * Writes output to src/data/target-audience-examples.json
 * Estimated cost: ~$0.50-1.00 for all niches
 */
import OpenAI from "openai";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { NICHES } from "../src/data/target-audience-niches";

const SYSTEM_PROMPT = `You are a customer research strategist. Given a business description, produce a detailed target audience profile.

Return ONLY valid JSON matching this schema:
{
  "primaryAudience": {
    "headline": "One vivid sentence describing the ideal customer",
    "demographics": { "ageRange": "", "gender": "", "income": "", "education": "", "location": "" },
    "psychographics": { "values": ["3-5"], "interests": ["3-5"], "lifestyle": "2-3 sentences" },
    "painPoints": ["4-6 specific, in their words"],
    "buyingTriggers": ["3-5 moments"],
    "objections": ["3-5 hesitations"],
    "whereToFind": [{"platform": "", "detail": ""}],
    "dayInTheLife": "3-4 sentence narrative"
  },
  "messagingGuide": {
    "hookExamples": ["3 specific headlines"],
    "toneAdvice": "2-3 sentences",
    "wordsToUse": ["8-12"],
    "wordsToAvoid": ["5-8"]
  },
  "competitorInsight": "2-3 sentences"
}

Be specific to the business. No generic filler.`;

const BATCH_SIZE = 15;
const OUTPUT_PATH = "src/data/target-audience-examples.json";

async function main() {
  const openai = new OpenAI();

  // Load existing results to allow incremental runs
  let existing: Record<string, unknown> = {};
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    } catch {
      existing = {};
    }
  }

  const toGenerate = NICHES.filter((n) => !(n.slug in existing));
  console.log(`Total niches: ${NICHES.length}, already done: ${NICHES.length - toGenerate.length}, to generate: ${toGenerate.length}`);

  if (toGenerate.length === 0) {
    console.log("All niches already generated. Done.");
    return;
  }

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
    const batch = toGenerate.slice(i, i + BATCH_SIZE);
    console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}: generating ${batch.map((n) => n.slug).join(", ")}`);

    const results = await Promise.allSettled(
      batch.map(async (niche) => {
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Business type: ${niche.label}\nDescription: ${niche.businessDescription}` },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error("Empty response");
        const parsed = JSON.parse(raw);
        // Basic structure validation
        if (!parsed.primaryAudience?.headline || !parsed.messagingGuide?.hookExamples || !parsed.competitorInsight) {
          throw new Error(`Invalid output structure for ${niche.slug}`);
        }
        return { slug: niche.slug, data: parsed };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        existing[r.value.slug] = r.value.data;
        completed++;
      } else {
        failed++;
        console.error(`  Failed:`, r.reason);
      }
    }

    // Save after each batch (incremental)
    writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2));
    console.log(`  Saved. Progress: ${completed}/${toGenerate.length} (${failed} failed)`);
  }

  console.log(`\nDone! ${completed} generated, ${failed} failed. Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
