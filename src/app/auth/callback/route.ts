import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { linkAuthToPublicUser } from "@/lib/auth/session"
import { trackServerEvent, identifyUser } from "@/lib/analytics"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  // Sanitize next param to prevent open redirect attacks
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/dashboard"

  const supabase = await createClient()

  let data: { user: { id: string; email?: string } | null } | null = null
  let error: Error | null = null

  // Handle token_hash (from dev bypass or email link)
  if (tokenHash && type === "magiclink") {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    })
    data = result.data
    error = result.error
  } else if (code) {
    // Exchange code for session
    const result = await supabase.auth.exchangeCodeForSession(code)
    data = result.data
    error = result.error
  } else {
    // No code or token provided, redirect to login
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  if (error || !data.user) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Link auth user to public.users
  try {
    if (data.user.email) {
      await linkAuthToPublicUser(data.user.id, data.user.email)
    }
  } catch (linkError) {
    console.error("Failed to link user:", linkError)
    // Continue anyway - user is authenticated
  }

  // Track magic link verification and identify user
  trackServerEvent(data.user.id, "magic_link_verified", {
    email: data.user.email,
  })
  if (data.user.email) {
    identifyUser(data.user.id, data.user.email)
  }

  // Redirect to destination
  return NextResponse.redirect(`${origin}${next}`)
}
