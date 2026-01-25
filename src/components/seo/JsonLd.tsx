/**
 * JSON-LD structured data for SEO
 * https://developers.google.com/search/docs/appearance/structured-data
 */

const BASE_URL = "https://aboo.st";

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
}

export function OrganizationSchema({
  name = "Boost",
  description = "AI-powered marketing plans for small businesses. Real competitor research, actionable tactics, 30-day roadmap.",
  url = BASE_URL,
}: OrganizationSchemaProps = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
    logo: `${BASE_URL}/og-image.png`,
    sameAs: [
      "https://twitter.com/rbaten",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
}

export function ProductSchema({
  name = "Boost Marketing Plan",
  description = "Get a custom 30-day marketing plan built with live competitive research. Includes competitor analysis, channel strategy, and actionable weekly roadmap.",
  price = "29",
  currency = "USD",
}: ProductSchemaProps = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Organization",
      name: "Boost",
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/start`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  industry?: string;
}

export function ArticleSchema({
  title,
  description,
  url,
  publishedAt,
  industry,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    ...(publishedAt && { datePublished: publishedAt }),
    author: {
      "@type": "Organization",
      name: "Boost",
    },
    publisher: {
      "@type": "Organization",
      name: "Boost",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og-image.png`,
      },
    },
    ...(industry && {
      about: {
        "@type": "Thing",
        name: industry,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
