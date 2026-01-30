import { NextRequest, NextResponse } from "next/server";

interface MetadataResponse {
  success: boolean;
  metadata: {
    title: string | null;
    description: string | null;
    favicon: string | null;
    siteName: string | null;
    url: string;
  } | null;
  error?: string;
}

// Extract meta content by property or name
function getMetaContent(html: string, attr: string): string | null {
  // Try property first (og: tags), then name (standard meta)
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${attr}["'][^>]*content=["']([^"']+)["']`, "i")
  );
  if (propertyMatch) return propertyMatch[1];

  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${attr}["'][^>]*content=["']([^"']+)["']`, "i")
  );
  if (nameMatch) return nameMatch[1];

  // Also try reversed order (content before property/name)
  const reversedProperty = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${attr}["']`, "i")
  );
  if (reversedProperty) return reversedProperty[1];

  const reversedName = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${attr}["']`, "i")
  );
  return reversedName ? reversedName[1] : null;
}

function getTitle(html: string): string | null {
  // Prefer og:title
  const ogTitle = getMetaContent(html, "og:title");
  if (ogTitle) return ogTitle;

  // Fall back to <title> tag
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function getDescription(html: string): string | null {
  // Prefer og:description
  const ogDesc = getMetaContent(html, "og:description");
  if (ogDesc) return ogDesc;

  // Fall back to meta description
  return getMetaContent(html, "description");
}

function getFavicon(html: string, origin: string): string | null {
  // Look for various favicon link tags
  const patterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const href = match[1];
      // Handle relative URLs
      if (href.startsWith("//")) return `https:${href}`;
      if (href.startsWith("/")) return `${origin}${href}`;
      if (href.startsWith("http")) return href;
      return `${origin}/${href}`;
    }
  }

  return null;
}

function getSiteName(html: string): string | null {
  return getMetaContent(html, "og:site_name");
}

export async function POST(request: NextRequest): Promise<NextResponse<MetadataResponse>> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({
        success: false,
        metadata: null,
        error: "URL is required",
      }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({
        success: false,
        metadata: null,
        error: "Invalid URL format",
      }, { status: 400 });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({
        success: false,
        metadata: null,
        error: "Only HTTP/HTTPS URLs are supported",
      }, { status: 400 });
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let html: string;
    try {
      const response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ActionboostBot/1.0)",
          "Accept": "text/html",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read only first 100KB to get <head> content
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const chunks: Uint8Array[] = [];
      let totalSize = 0;
      const maxSize = 100 * 1024; // 100KB

      while (totalSize < maxSize) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalSize += value.length;
      }
      reader.cancel();

      const decoder = new TextDecoder();
      html = chunks.map((chunk) => decoder.decode(chunk, { stream: true })).join("");
    } catch {
      clearTimeout(timeoutId);
      // Return partial success with just favicon from Google
      const domain = parsedUrl.hostname;
      return NextResponse.json({
        success: true,
        metadata: {
          title: null,
          description: null,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          siteName: null,
          url: normalizedUrl,
        },
      });
    }

    // Extract metadata
    const origin = parsedUrl.origin;
    const title = getTitle(html);
    const description = getDescription(html);
    const favicon = getFavicon(html, origin) ||
      `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;
    const siteName = getSiteName(html);

    return NextResponse.json({
      success: true,
      metadata: {
        title,
        description,
        favicon,
        siteName,
        url: normalizedUrl,
      },
    });
  } catch (error) {
    console.error("Metadata extraction error:", error);
    return NextResponse.json({
      success: false,
      metadata: null,
      error: "Failed to extract metadata",
    }, { status: 500 });
  }
}
