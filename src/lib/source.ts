/**
 * UTM/Referrer source tracking
 *
 * Captures source params from URL on first visit and stores in sessionStorage.
 * Used to attribute conversions to marketing channels (Indie Hackers, Twitter, etc.)
 */

const SOURCE_KEY = "actionboost-source";

export interface SourceParams {
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Capture source params from URL and store in sessionStorage.
 * Only captures on first visit (doesn't overwrite existing source).
 */
export function captureSource(): SourceParams | null {
  if (typeof window === "undefined") return null;

  // Don't overwrite existing source
  const existing = sessionStorage.getItem(SOURCE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      return null;
    }
  }

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const source: SourceParams = {};

  const ref = params.get("ref");
  const utm_source = params.get("utm_source");
  const utm_medium = params.get("utm_medium");
  const utm_campaign = params.get("utm_campaign");

  if (ref) source.ref = ref;
  if (utm_source) source.utm_source = utm_source;
  if (utm_medium) source.utm_medium = utm_medium;
  if (utm_campaign) source.utm_campaign = utm_campaign;

  // Only store if we captured something
  if (Object.keys(source).length > 0) {
    sessionStorage.setItem(SOURCE_KEY, JSON.stringify(source));
    return source;
  }

  return null;
}

/**
 * Get stored source params.
 */
export function getSource(): SourceParams | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(SOURCE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Get flat source properties for PostHog events.
 * Returns object with $source_* prefixed keys.
 */
export function getSourceProperties(): Record<string, string> {
  const source = getSource();
  if (!source) return {};

  const props: Record<string, string> = {};

  // Use $source_* prefix for clarity in analytics
  if (source.ref) props.$source_ref = source.ref;
  if (source.utm_source) props.$source_utm_source = source.utm_source;
  if (source.utm_medium) props.$source_utm_medium = source.utm_medium;
  if (source.utm_campaign) props.$source_utm_campaign = source.utm_campaign;

  return props;
}
