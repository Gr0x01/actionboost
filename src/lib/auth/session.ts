import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import type { User as AuthUser } from "@supabase/supabase-js"

export type SessionUser = {
  authId: string
  email: string
  publicUserId: string | null // public.users.id (may be null if user hasn't purchased yet)
}

/**
 * Get the current authenticated user from Supabase Auth.
 * Returns null if not logged in.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Require authentication. Redirects to /login if not logged in.
 * Use this at the top of protected Server Components.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * Get full session user with linked public.users data.
 * Returns null if not logged in.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const authUser = await getAuthUser()
  if (!authUser || !authUser.email) return null

  const supabase = createServiceClient()

  // Find linked public user
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  return {
    authId: authUser.id,
    email: authUser.email,
    publicUserId: publicUser?.id ?? null,
  }
}

/**
 * Link an auth.users record to a public.users record.
 * Called during auth callback to connect accounts.
 */
export async function linkAuthToPublicUser(
  authId: string,
  email: string
): Promise<string> {
  const supabase = createServiceClient()

  // Check if already linked
  const { data: existingByAuthId } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single()

  if (existingByAuthId) {
    return existingByAuthId.id
  }

  // Check if public user exists with this email (created via Stripe)
  const { data: existingByEmail } = await supabase
    .from("users")
    .select("id, auth_id")
    .eq("email", email)
    .single()

  if (existingByEmail) {
    // Link existing user if not already linked
    if (!existingByEmail.auth_id) {
      await supabase
        .from("users")
        .update({ auth_id: authId })
        .eq("id", existingByEmail.id)
    }
    return existingByEmail.id
  }

  // Create new public user linked to auth user
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      email,
      auth_id: authId,
    })
    .select("id")
    .single()

  if (error || !newUser) {
    throw new Error(`Failed to create user: ${error?.message}`)
  }

  return newUser.id
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Get authenticated user's public user ID for ownership checks.
 * Returns null if not authenticated or not linked.
 * Use in API routes for verifying resource ownership.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const authUser = await getAuthUser()
  if (!authUser) return null

  const supabase = createServiceClient()
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  return publicUser?.id ?? null
}
