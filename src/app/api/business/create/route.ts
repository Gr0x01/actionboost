import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createBusiness } from "@/lib/business"

/**
 * POST /api/business/create
 * Creates a new business for the authenticated user.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  try {
    const businessId = await createBusiness(userId, {
      productDescription: name || "My Business",
      currentTraction: "",
      tacticsAndResults: "",
      focusArea: "acquisition",
      competitorUrls: [],
      websiteUrl: "",
    })

    return NextResponse.json({ id: businessId })
  } catch (err) {
    console.error("[Business Create] Failed:", err)
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
  }
}
