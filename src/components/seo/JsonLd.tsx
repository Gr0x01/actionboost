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
  description = "AI-powered marketing Boosts for small businesses. Real competitor research, actionable tactics, 30-day roadmap.",
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

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  faqs: FAQItem[];
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
}

export function SoftwareApplicationSchema({
  name = "Boost",
  description = "AI-powered marketing plan generator that creates custom 30-day plans for small businesses using live competitor research.",
  price = "29",
  currency = "USD",
}: SoftwareApplicationSchemaProps = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
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
