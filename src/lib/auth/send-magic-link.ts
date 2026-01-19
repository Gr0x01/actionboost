import { createClient } from "@/lib/supabase/server"

/**
 * Sends a magic login link to the specified email.
 * Fire-and-forget: errors are logged but don't throw.
 *
 * @param email - User's email address
 * @param next - Path to redirect after login (default: /dashboard)
 */
export async function sendMagicLink(
  email: string,
  next: string = "/dashboard"
): Promise<void> {
  try {
    const supabase = await createClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error("[sendMagicLink] NEXT_PUBLIC_APP_URL not configured")
      return
    }

    const redirectTo = new URL("/auth/callback", appUrl)
    redirectTo.searchParams.set("next", next)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo.toString(),
      },
    })

    if (error) {
      console.error("[sendMagicLink] Failed to send:", error.message)
    }
  } catch (err) {
    console.error("[sendMagicLink] Unexpected error:", err)
  }
}
