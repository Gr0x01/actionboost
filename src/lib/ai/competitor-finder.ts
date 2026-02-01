import { tavily } from "@tavily/core";
import OpenAI from "openai";

export interface CompetitorFinderOutput {
  competitors: Array<{
    name: string;
    url: string;
    description: string;
    positioning: string;
    weakness: string;
    opportunity: string;
  }>;
  summary: string;
}

const SYSTEM_PROMPT = `You are a competitive intelligence analyst. Given search results about a business and its market, identify the top 5 real competitors and provide strategic intel on each.

## Rules
- Identify 5 REAL competitors — actual companies with real URLs. Never invent companies.
- Each competitor must be a direct or close alternative to the user's business, not a tangentially related company.
- Be honest and specific. Don't flatter the user or invent weaknesses.
- If search results are thin, work with what you have — fewer competitors with real intel beats 5 with made-up details.
- NEVER use emojis.
- URLs must be real domains you found in the search results. If you're unsure of the exact URL, use the company's main domain.

## For Each Competitor
- **name**: Company/product name
- **url**: Their website URL
- **description**: 1 sentence — what they do
- **positioning**: 1-2 sentences — how they position themselves, what they emphasize, who they target
- **weakness**: 1 sentence — a genuine gap, limitation, or complaint users have (from reviews, forums, or observable positioning gaps)
- **opportunity**: 1 sentence — how the user could exploit this weakness or differentiate against this competitor

## Summary
2-3 sentences: Where does the user's business stand relative to these competitors? What's the overall competitive landscape like? What's the single biggest opportunity across all competitors?

## Output Format
Return ONLY valid JSON:
{
  "competitors": [
    {
      "name": "Company Name",
      "url": "https://example.com",
      "description": "What they do in one sentence",
      "positioning": "How they position themselves and who they target",
      "weakness": "A real gap or limitation",
      "opportunity": "How the user can exploit this"
    }
  ],
  "summary": "2-3 sentence competitive landscape overview"
}`;

function validateOutput(data: unknown): data is CompetitorFinderOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== "string" || !obj.summary) return false;
  if (!Array.isArray(obj.competitors) || obj.competitors.length < 1) return false;

  for (const c of obj.competitors) {
    if (typeof c !== "object" || !c) return false;
    const comp = c as Record<string, unknown>;
    if (typeof comp.name !== "string" || !comp.name) return false;
    if (typeof comp.url !== "string" || !comp.url) return false;
    if (typeof comp.description !== "string" || !comp.description) return false;
    if (typeof comp.positioning !== "string" || !comp.positioning) return false;
    if (typeof comp.weakness !== "string" || !comp.weakness) return false;
    if (typeof comp.opportunity !== "string" || !comp.opportunity) return false;
  }

  return true;
}

/**
 * Run competitor finder inline. Tavily search + GPT synthesis (~15-30s).
 */
export async function runCompetitorFinderInline(input: {
  url: string;
  description: string;
}): Promise<CompetitorFinderOutput> {
  const apiKey = process.env.TAVILY_API;
  if (!apiKey) throw new Error("TAVILY_API not configured");

  const tvly = tavily({ apiKey });

  // Extract domain/brand from URL for search
  let domain = "";
  try {
    domain = new URL(input.url).hostname.replace(/^www\./, "");
  } catch {
    domain = input.url;
  }

  // Run 2 Tavily searches in parallel
  const [search1, search2] = await Promise.allSettled([
    tvly.search(`${domain} competitors alternatives`, {
      searchDepth: "advanced",
      maxResults: 8,
    }),
    tvly.search(`${input.description} software tools alternatives`, {
      searchDepth: "advanced",
      maxResults: 8,
    }),
  ]);

  // Combine search results
  let searchContext = "";

  if (search1.status === "fulfilled" && search1.value.results) {
    searchContext += "## Search: Direct Competitors\n";
    for (const r of search1.value.results) {
      searchContext += `- ${r.title}: ${r.content?.slice(0, 300) || ""} (${r.url})\n`;
    }
  }

  if (search2.status === "fulfilled" && search2.value.results) {
    searchContext += "\n## Search: Industry Alternatives\n";
    for (const r of search2.value.results) {
      searchContext += `- ${r.title}: ${r.content?.slice(0, 300) || ""} (${r.url})\n`;
    }
  }

  if (!searchContext) {
    throw new Error("No search results found. Please check the URL and try again.");
  }

  // GPT synthesis
  const userMessage = `Business URL: ${input.url}
Business description: ${input.description}

${searchContext}

Based on these search results, identify the top 5 competitors and analyze each one.`;

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

  return parsed;
}
