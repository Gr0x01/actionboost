import OpenAI from "openai";

export interface EmailSubjectAnalysisOutput {
  overall: number;
  scores: {
    clarity: number;
    urgency: number;
    curiosity: number;
    relevance: number;
  };
  verdict: string;
  analysis: {
    clarity: string;
    urgency: string;
    curiosity: string;
    relevance: string;
  };
  rewrites: Array<{
    subject: string;
    why: string;
  }>;
}

const SYSTEM_PROMPT = `You are an email subject line analyst. Given a subject line and optional context about the email and audience, you evaluate how effective it is at getting opens.

## Scoring Categories (0-100 each)

**Clarity** — Is it immediately clear what the email is about?
- 90-100: Reader knows exactly what's inside before opening
- 70-89: Clear with minor ambiguity
- 50-69: Vague — could be about several things
- 0-49: No idea what this email contains

**Urgency** — Does it create a reason to open now?
- 90-100: Strong, specific reason to open immediately (deadline, scarcity, timeliness)
- 70-89: Implies time-sensitivity without being pushy
- 50-69: No urgency but not off-putting
- 0-49: Easy to ignore or save for "later" (which means never)

**Curiosity** — Does it create an information gap?
- 90-100: Impossible not to click — specific, intriguing, unexpected
- 70-89: Creates genuine interest in what's inside
- 50-69: Mildly interesting but skippable
- 0-49: Boring or gives everything away in the subject

**Relevance** — Does it speak to the recipient's interests/needs?
- 90-100: Feels written specifically for the reader's situation
- 70-89: Clearly relevant to a specific audience
- 50-69: Generic — could be sent to anyone
- 0-49: No clear audience or benefit

## Rules
- Be honest. Most subject lines score 30-55.
- Every score needs specific evidence from the subject line itself.
- NEVER use emojis.
- Rewrites must use information from the context to be specific.
- If no context is provided, rewrites should demonstrate the STRUCTURE of a good subject line while noting what specifics are missing.
- Subject line rewrites should be under 60 characters when possible (mobile preview cutoff).

## Output Format

Return ONLY valid JSON:
{
  "overall": <weighted average: clarity 25%, urgency 25%, curiosity 30%, relevance 20%>,
  "scores": {
    "clarity": <0-100>,
    "urgency": <0-100>,
    "curiosity": <0-100>,
    "relevance": <0-100>
  },
  "verdict": "<1 sentence: the single biggest problem with this subject line>",
  "analysis": {
    "clarity": "<1-2 sentences with specific evidence>",
    "urgency": "<1-2 sentences with specific evidence>",
    "curiosity": "<1-2 sentences with specific evidence>",
    "relevance": "<1-2 sentences with specific evidence>"
  },
  "rewrites": [
    {"subject": "<rewritten subject line>", "why": "<1 sentence explaining what this fixes>"},
    {"subject": "<rewritten subject line>", "why": "<1 sentence explaining what this fixes>"},
    {"subject": "<rewritten subject line>", "why": "<1 sentence explaining what this fixes>"}
  ]
}`;

function validateOutput(data: unknown): data is EmailSubjectAnalysisOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.overall !== "number") return false;
  if (typeof obj.verdict !== "string" || !obj.verdict) return false;

  const scores = obj.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores !== "object") return false;
  if (typeof scores.clarity !== "number") return false;
  if (typeof scores.urgency !== "number") return false;
  if (typeof scores.curiosity !== "number") return false;
  if (typeof scores.relevance !== "number") return false;

  const analysis = obj.analysis as Record<string, unknown> | undefined;
  if (!analysis || typeof analysis !== "object") return false;
  if (typeof analysis.clarity !== "string") return false;
  if (typeof analysis.urgency !== "string") return false;
  if (typeof analysis.curiosity !== "string") return false;
  if (typeof analysis.relevance !== "string") return false;

  if (!Array.isArray(obj.rewrites) || obj.rewrites.length < 1) return false;
  for (const r of obj.rewrites) {
    if (typeof r !== "object" || !r) return false;
    if (typeof (r as Record<string, unknown>).subject !== "string") return false;
    if (typeof (r as Record<string, unknown>).why !== "string") return false;
  }

  return true;
}

/**
 * Run email subject line analysis inline (no Inngest). Fast enough for a single GPT call (~5-15s).
 */
export async function runEmailSubjectAnalysisInline(input: {
  subjectLine: string;
  emailAbout?: string;
  audience?: string;
}): Promise<EmailSubjectAnalysisOutput> {
  let userMessage = `Email subject line to analyze: "${input.subjectLine}"`;
  if (input.emailAbout) {
    userMessage += `\nWhat the email is about: ${input.emailAbout}`;
  }
  if (input.audience) {
    userMessage += `\nWho's receiving it: ${input.audience}`;
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

  return parsed;
}
