/**
 * Subscription helpers for Boost Weekly
 *
 * Core functions for checking subscription status and creating subscription-linked runs.
 */

import { createServiceClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "paused" | "trialing"

export type Subscription = {
  id: string
  user_id: string
  business_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  current_week: number
  original_run_id: string | null
  cancel_at_period_end: boolean
  created_at: string
}

/**
 * Get the active subscription for a user (if any).
 * Returns the most recent active/trialing subscription.
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (data as Subscription) ?? null
}

/**
 * Check if a user has an active subscription.
 */
export async function isSubscriber(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId)
  return sub !== null && sub.status !== "past_due"
}

/**
 * Get subscription for the current authenticated user.
 * Returns null if not logged in or no active subscription.
 */
export async function getCurrentUserSubscription(): Promise<Subscription | null> {
  const session = await getSessionUser()
  if (!session?.publicUserId) return null
  return getActiveSubscription(session.publicUserId)
}

/**
 * Get subscription by Stripe subscription ID.
 * Used in webhook handlers.
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single()

  return (data as Subscription) ?? null
}

/**
 * Create a subscription record in the database.
 * Called from webhook when Stripe subscription is created.
 */
export async function createSubscriptionRecord(params: {
  userId: string
  businessId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
}): Promise<Subscription> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: params.userId,
      business_id: params.businessId,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_customer_id: params.stripeCustomerId,
      status: params.status,
      current_period_start: params.currentPeriodStart.toISOString(),
      current_period_end: params.currentPeriodEnd.toISOString(),
      current_week: 1,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`Failed to create subscription: ${error?.message}`)
  }

  return data as Subscription
}

/**
 * Update subscription status from Stripe webhook.
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  updates: {
    status?: SubscriptionStatus
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  }
): Promise<void> {
  const supabase = createServiceClient()

  const updateData: Record<string, unknown> = {}
  if (updates.status) updateData.status = updates.status
  if (updates.currentPeriodStart) updateData.current_period_start = updates.currentPeriodStart.toISOString()
  if (updates.currentPeriodEnd) updateData.current_period_end = updates.currentPeriodEnd.toISOString()
  if (updates.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = updates.cancelAtPeriodEnd

  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", stripeSubscriptionId)

  if (error) {
    console.error(`[Subscription] Failed to update ${stripeSubscriptionId}:`, error)
  }
}

/**
 * Increment the current week number on a subscription.
 * Called when a new weekly run is generated.
 */
export async function incrementSubscriptionWeek(subscriptionId: string): Promise<number> {
  const supabase = createServiceClient()

  // Fetch current week, increment, save
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("current_week")
    .eq("id", subscriptionId)
    .single()

  const newWeek = (sub?.current_week ?? 0) + 1

  await supabase
    .from("subscriptions")
    .update({ current_week: newWeek })
    .eq("id", subscriptionId)

  return newWeek
}

/**
 * Get all active subscriptions (for weekly cron job).
 */
export async function getAllActiveSubscriptions(): Promise<Subscription[]> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .in("status", ["active", "trialing"])
    .eq("cancel_at_period_end", false)

  return (data as Subscription[]) ?? []
}
