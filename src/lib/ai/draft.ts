/**
 * Draft generation for "Draft This" feature.
 *
 * Uses Claude Sonnet for fast, cheap content drafts (~5-10s, ~$0.02-0.05).
 * Context: business profile (ICP, voice), current strategy, specific task.
 */

import Anthropic from "@anthropic-ai/sdk"
import type { BusinessProfile } from "@/lib/types/business-profile"

const anthropic = new Anthropic()

const SONNET_MODEL = "claude-sonnet-4-20250514"

interface DraftInput {
  profile: BusinessProfile
  task: { title: string; description: string }
  contentType: string
  strategyContext: string
}

const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  reddit_post: `Write a Reddit post/comment. Natural, helpful tone. No obvious self-promotion.
Include: a hook, genuine insight/value, subtle mention of the solution (if relevant).
Format: Short paragraphs, conversational. 100-200 words.`,

  email: `Write a cold/warm outreach email. Direct, personalized, specific.
Include: subject line, body, clear CTA.
Format: Short paragraphs, under 150 words body. No fluff.`,

  dm: `Write a direct message (Twitter/LinkedIn DM). Short, personal, not salesy.
Include: personal opener, value proposition, soft CTA.
Format: 2-4 short sentences. Conversational.`,

  tweet: `Write a tweet or Twitter thread (up to 3 tweets).
Include: hook, insight, optional CTA.
Format: Each tweet under 280 chars. Punchy, no hashtags unless strategic.`,

  linkedin_post: `Write a LinkedIn post. Professional but not boring.
Include: hook (first line matters), story or insight, takeaway, optional CTA.
Format: Short paragraphs with line breaks. 100-200 words.`,

  blog_outline: `Write a blog post outline with key points.
Include: headline, subheadings (H2s), 2-3 bullet points per section, suggested CTA.
Format: Structured outline, not full prose.`,
}

export async function generateDraft(input: DraftInput): Promise<string> {
  const { profile, task, contentType, strategyContext } = input

  const typePrompt = CONTENT_TYPE_PROMPTS[contentType] || CONTENT_TYPE_PROMPTS.tweet

  // Build context from profile
  const profileContext = [
    profile.description ? `Business: ${profile.description}` : "",
    profile.icp?.who ? `Target customer: ${profile.icp.who}` : "",
    profile.icp?.problem ? `Problem solved: ${profile.icp.problem}` : "",
    profile.voice?.tone ? `Brand voice: ${profile.voice.tone}` : "",
    profile.voice?.examples ? `Voice example: "${profile.voice.examples.slice(0, 200)}"` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const systemPrompt = `You are a marketing copywriter drafting content for a specific business.
Your job: write ready-to-use content that the user can post/send with minimal editing.

${typePrompt}

Business context:
${profileContext || "No detailed profile available."}

Write in the brand's voice. Be specific to their business, not generic.
Output ONLY the draft content — no explanations, no "here's a draft", no meta-commentary.`

  const userMessage = `Task: ${task.title}
${task.description ? `Details: ${task.description}` : ""}

${strategyContext ? `Current strategy context:\n${strategyContext.slice(0, 1500)}` : ""}

Write the ${contentType.replace("_", " ")} now.`

  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  return textBlock?.text || "Failed to generate draft."
}
