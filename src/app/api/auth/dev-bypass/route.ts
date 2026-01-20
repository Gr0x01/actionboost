import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// DEV ONLY - Direct login bypass for localhost testing
export async function POST(request: NextRequest) {
  // Only allow in development and on localhost
  const isDev = process.env.NODE_ENV === "development"
  const host = request.headers.get("host") || ""
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1")

  if (!isDev || !isLocalhost) {
    return NextResponse.json(
      { error: "Not available" },
      { status: 404 }
    )
  }

  try {
    const { email } = (await request.json()) as { email?: string }

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Generate a magic link directly - this will create user if needed
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (linkError) {
      return NextResponse.json(
        { error: linkError.message || "Failed to generate session" },
        { status: 500 }
      )
    }

    if (!linkData?.properties?.hashed_token) {
      return NextResponse.json(
        { error: "No token in response" },
        { status: 500 }
      )
    }

    // Return the token hash which can be used to verify
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink&next=/dashboard`

    return NextResponse.json({
      success: true,
      redirectUrl: verifyUrl,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to bypass auth" },
      { status: 500 }
    )
  }
}
