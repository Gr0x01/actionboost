import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_API_VERSION = "v21.0";

interface ConversionRequest {
  eventName: string;
  eventId: string;
  value?: number;
  currency?: string;
  email?: string;
}

/**
 * Facebook Conversion API endpoint
 * Sends server-side events to Facebook for better attribution
 * Uses same eventId as client-side pixel for deduplication
 */
export async function POST(request: NextRequest) {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    // Silently succeed if not configured - client pixel is fallback
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body: ConversionRequest = await request.json();
    const { eventName, eventId, value, currency = "USD", email } = body;

    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: "eventName and eventId required" },
        { status: 400 }
      );
    }

    // Get client info for better matching
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "";
    const userAgent = request.headers.get("user-agent") || "";

    // Build event data
    const eventData: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId, // Same as client-side for deduplication
      event_source_url: request.headers.get("referer") || "",
      action_source: "website",
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        // Hash email if provided (FB requires SHA256)
        ...(email && { em: hashForFB(email.toLowerCase().trim()) }),
      },
    };

    // Add custom data for Purchase events
    if (eventName === "Purchase" && value !== undefined) {
      eventData.custom_data = {
        value,
        currency,
        content_type: "product",
        content_ids: ["boost-marketing-plan"],
        content_name: "Boost 30-Day Marketing Plan",
      };
    }

    // Send to Facebook Conversion API
    const response = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[FB Conversion API] Error:", error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[FB Conversion API] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * Hash data for Facebook (SHA256, lowercase hex)
 */
function hashForFB(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
