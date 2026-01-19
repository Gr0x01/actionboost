import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { linkAuthToPublicUser } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Sanitize next param to prevent open redirect attacks
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/dashboard"

  if (!code) {
    // No code provided, redirect to login
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

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

  // Redirect to destination
  return NextResponse.redirect(`${origin}${next}`)
}
