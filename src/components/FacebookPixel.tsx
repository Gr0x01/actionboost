"use client";

import Script from "next/script";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * Facebook Pixel initialization component
 * Add to layout.tsx to load on all pages
 * Note: Only render for non-GDPR countries (handled in layout.tsx)
 */
export function FacebookPixel() {
  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track a Facebook Pixel event with optional event ID for deduplication
 */
export function trackFBEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== "undefined" && window.fbq) {
    if (eventId) {
      // Use eventID for deduplication with Conversion API
      window.fbq("track", eventName, params, { eventID: eventId });
    } else {
      window.fbq("track", eventName, params);
    }
  }
}

interface PurchaseParams {
  value: number;
  currency?: string;
  eventId: string; // Required for deduplication
  contentName?: string;
}

/**
 * Track a purchase event (client-side pixel)
 * Also calls server-side Conversion API for better attribution
 */
export async function trackFBPurchase({
  value,
  currency = "USD",
  eventId,
  contentName = "Boost 30-Day Marketing Plan",
}: PurchaseParams): Promise<void> {
  // Client-side pixel tracking
  trackFBEvent(
    "Purchase",
    {
      value,
      currency,
      content_type: "product",
      content_ids: ["boost-marketing-plan"],
      content_name: contentName,
    },
    eventId
  );

  // Server-side Conversion API tracking for better attribution
  try {
    await fetch("/api/fb/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "Purchase",
        eventId,
        value,
        currency,
      }),
    });
  } catch {
    // Silently fail - client-side pixel is the fallback
  }
}

// TypeScript declaration for fbq with eventID option
declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
  }
}
