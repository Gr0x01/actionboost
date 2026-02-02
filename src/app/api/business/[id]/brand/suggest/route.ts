import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { verifyBusinessOwnership } from "@/lib/business"
import type { UserContext } from "@/lib/types/context"
import type { BusinessProfile } from "@/lib/types/business-profile"

const MODEL = "claude-sonnet-4-20250514"

/**
 * POST /api/business/[id]/brand/suggest
 *
 * Uses Sonnet to generate brand suggestions (ICP, voice, competitors)
 * from all available business context: onboarding profile + accumulated run data.
 *
 * Query params:
 *   ?save=true — auto-save suggestions to the business profile (used post-onboarding)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id: businessId } = await params

  const isOwner = await verifyBusinessOwnership(businessId, userId)
  if (!isOwner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("businesses")
    .select("name, context, context_updated_at")
    .eq("id", businessId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Rate limit: max 1 suggest per business per 5 minutes
  if (data.context_updated_at) {
    const minsSince = (Date.now() - new Date(data.context_updated_at).getTime()) / (1000 * 60)
    if (minsSince < 5) {
      return NextResponse.json(
        { error: "Please wait a few minutes before generating new suggestions." },
        { status: 429 }
      )
    }
  }

  const context = (data.context as Record<string, unknown>) || {}
  const profile = (context.profile as BusinessProfile) || {}
  const runContext = context as UserContext

  // Sanitize user input before building prompt
  const s = (text: string, max = 500) => text.slice(0, max).replace(/[\n\r]+/g, " ").trim()
  const sArr = (arr: string[], max = 200) => arr.map(v => s(v, max)).join(", ")

  // Build a summary of everything we know
  const fields: [string, string | undefined][] = [
    ["Business name", data.name],
    ["Website", profile.websiteUrl || runContext.product?.websiteUrl],
    ["Description", profile.description],
    ["Industry", profile.industry],
    ["Product description", runContext.product?.description],
    ["Current traction", runContext.traction?.latest],
    ["Constraints", runContext.constraints],
    ["ICP - Who", profile.icp?.who],
    ["ICP - Problem", profile.icp?.problem],
    ["ICP - Alternatives", profile.icp?.alternatives],
    ["Voice tone", profile.voice?.tone],
    ["Voice examples", profile.voice?.examples],
    ["Voice do's", profile.voice?.dos?.length ? sArr(profile.voice.dos, 100) : undefined],
    ["Voice don'ts", profile.voice?.donts?.length ? sArr(profile.voice.donts, 100) : undefined],
    ["Competitors", [...(profile.competitors || []), ...(runContext.product?.competitors || [])].length
      ? sArr([...new Set([...(profile.competitors || []), ...(runContext.product?.competitors || [])])])
      : undefined],
    ["Primary goal", profile.goals?.primary],
    ["Marketing tried", profile.triedBefore],
    ["Tactics history", runContext.tactics?.history?.length
      ? sArr(runContext.tactics.history.slice(-5), 200)
      : undefined],
  ]

  const knowledgeParts = fields
    .filter((f): f is [string, string] => !!f[1])
    .map(([label, value]) => `${label}: ${s(value)}`)

  if (knowledgeParts.length < 2) {
    return NextResponse.json(
      { error: "Not enough information to generate suggestions. Fill in some basics first." },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are helping a small business owner fill out their brand profile. Based on everything we know about their business, suggest their ICP, brand voice, and competitors.

Here's what we know:
${knowledgeParts.join("\n")}

Respond with ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "icp": {
    "who": "1-2 sentences describing their ideal customer",
    "problem": "1-2 sentences about the core problem solved",
    "alternatives": "1-2 sentences about what customers do instead"
  },
  "voice": {
    "tone": "2-4 words describing tone, e.g. 'direct and confident'",
    "dos": ["specific thing to always do", "another thing"],
    "donts": ["specific thing to never do", "another thing"]
  },
  "competitors": ["https://competitor1.com", "https://competitor2.com"]
}

Rules:
- Be specific and opinionated, not generic. Use details from the business context.
- For ICP, be concrete about WHO (job title, company size, situation), not vague demographics.
- For voice dos/donts, make them actionable and specific to THIS business. 2-3 each.
- For competitors, only include real URLs you're confident about based on the context. If unsure, return fewer or empty array.
- Keep everything concise. No fluff.`,
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    let suggestion
    try {
      suggestion = JSON.parse(text)
    } catch {
      // Try extracting JSON from response if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid JSON response from model")
      }
    }

    // Auto-save if ?save=true
    const shouldSave = _request.nextUrl.searchParams.get("save") === "true"
    if (shouldSave) {
      const updates: Partial<BusinessProfile> = {}
      if (suggestion.icp) updates.icp = suggestion.icp
      if (suggestion.voice) updates.voice = {
        ...(profile.voice || {}),
        tone: suggestion.voice.tone || profile.voice?.tone || "",
        dos: suggestion.voice.dos || profile.voice?.dos || [],
        donts: suggestion.voice.donts || profile.voice?.donts || [],
      }
      if (suggestion.competitors?.length) updates.competitors = suggestion.competitors

      const existingProfile = profile
      const mergedProfile = { ...existingProfile, ...updates }
      if (updates.voice) {
        mergedProfile.voice = { ...(existingProfile.voice || { tone: "" }), ...updates.voice }
      }
      if (updates.icp) {
        mergedProfile.icp = { ...(existingProfile.icp || { who: "", problem: "", alternatives: "" }), ...updates.icp }
      }

      const updatedContext = { ...context, profile: mergedProfile }
      await supabase
        .from("businesses")
        .update({
          context: updatedContext as unknown as import("@/lib/types/database").Json,
          context_updated_at: new Date().toISOString(),
        })
        .eq("id", businessId)
    }

    return NextResponse.json({ suggestion })
  } catch (err) {
    console.error("[Brand Suggest] Failed:", err)
    return NextResponse.json(
      { error: "Failed to generate suggestions. Try again." },
      { status: 500 }
    )
  }
}
