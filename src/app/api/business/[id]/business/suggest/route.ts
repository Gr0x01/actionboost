import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { verifyBusinessOwnership } from "@/lib/business"
import type { UserContext } from "@/lib/types/context"
import type { BusinessProfile } from "@/lib/types/business-profile"

const MODEL = "claude-sonnet-4-20250514"

/**
 * POST /api/business/[id]/business/suggest
 *
 * Uses Sonnet to suggest business basics (description, industry) and goals
 * from all available business context.
 *
 * Query params:
 *   ?save=true — auto-save suggestions to the business profile
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

  const s = (text: string, max = 500) => text.slice(0, max).replace(/[\n\r]+/g, " ").trim()
  const sArr = (arr: string[], max = 200) => arr.map(v => s(v, max)).join(", ")

  const fields: [string, string | undefined][] = [
    ["Business name", data.name],
    ["Website", profile.websiteUrl || runContext.product?.websiteUrl],
    ["Description", profile.description],
    ["Industry", profile.industry],
    ["Product description", runContext.product?.description],
    ["Current traction", runContext.traction?.latest],
    ["ICP - Who", profile.icp?.who],
    ["ICP - Problem", profile.icp?.problem],
    ["Primary goal", profile.goals?.primary],
    ["Budget", profile.goals?.budget],
    ["Competitors", [...(profile.competitors || []), ...(runContext.product?.competitors || [])].length
      ? sArr([...new Set([...(profile.competitors || []), ...(runContext.product?.competitors || [])])])
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
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are helping a small business owner fill out their business profile. Based on everything we know, suggest a description, industry, and goals.

Here's what we know:
${knowledgeParts.join("\n")}

Respond with ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "description": "1-3 sentence description of what the business does and who it serves",
  "industry": "The industry or category, e.g. 'SaaS', 'E-commerce', 'B2B Consulting', 'Health & Fitness'",
  "goals": {
    "primary": "Their most likely #1 marketing goal based on context",
    "budget": "Best guess at budget situation, e.g. 'Bootstrapped', '$500/month', 'Pre-revenue' — or null if no clues"
  }
}

Rules:
- Be specific and grounded in the context provided. Don't invent details.
- Description should be concrete — what they sell, to whom, what makes them different.
- Industry should be a short, recognizable label (not a sentence).
- For goals, infer from traction, constraints, and stage. Early-stage → "Get first customers". Has traction → "Scale acquisition".
- For budget, only guess if there are real signals. Set to null if unknown.
- Keep everything concise. No fluff.`,
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    let suggestion
    try {
      suggestion = JSON.parse(text)
    } catch {
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
      if (suggestion.description) updates.description = suggestion.description
      if (suggestion.industry) updates.industry = suggestion.industry
      if (suggestion.goals) {
        updates.goals = {
          ...(profile.goals || { primary: "" }),
          primary: suggestion.goals.primary || profile.goals?.primary || "",
          budget: suggestion.goals.budget || profile.goals?.budget,
        }
      }

      const mergedProfile = { ...profile, ...updates }
      if (updates.goals) {
        mergedProfile.goals = { ...(profile.goals || { primary: "" }), ...updates.goals }
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
    console.error("[Business Suggest] Failed:", err)
    return NextResponse.json(
      { error: "Failed to generate suggestions. Try again." },
      { status: 500 }
    )
  }
}
