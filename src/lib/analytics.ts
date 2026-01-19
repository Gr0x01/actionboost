import { PostHog } from "posthog-node";

const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1, // Send immediately (important for serverless)
      flushInterval: 0, // Disable interval batching
    })
  : null;

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  try {
    posthog?.capture({ distinctId, event, properties });
    await posthog?.flush();
  } catch (err) {
    console.error("PostHog tracking failed:", err);
    // Don't throw - analytics should never break business logic
  }
}
