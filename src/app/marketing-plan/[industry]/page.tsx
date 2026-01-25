import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { INDUSTRY_PAGES, INDUSTRY_SLUGS } from "@/lib/constants/industry-pages";
import { config } from "@/lib/config";

interface Props {
  params: Promise<{ industry: string }>;
}

export async function generateStaticParams() {
  return INDUSTRY_SLUGS.map((industry) => ({ industry }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params;
  const page = INDUSTRY_PAGES[industry];

  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `https://aboo.st/marketing-plan/${industry}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
      url: `https://aboo.st/marketing-plan/${industry}`,
    },
  };
}

export default async function IndustryMarketingPlanPage({ params }: Props) {
  const { industry } = await params;
  const page = INDUSTRY_PAGES[industry];

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-12 md:py-20">
          {/* Hero */}
          <header className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-wide text-cta uppercase mb-4">
              {page.title} Marketing
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              {page.heroHeadline}
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto font-serif">
              {page.heroSubhead}
            </p>
          </header>

          {/* Pain Points */}
          {page.painPoints.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Sound familiar?
              </h2>
              <ul className="space-y-4">
                {page.painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-cta font-bold text-lg">•</span>
                    <span className="text-foreground/80 font-serif text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* What to Include */}
          {page.whatToInclude.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                What a {page.title.toLowerCase()} marketing plan should include
              </h2>
              <div className="space-y-6">
                {page.whatToInclude.map((item, i) => (
                  <div key={i} className="border-l-4 border-cta/30 pl-4">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-foreground/70 font-serif">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Example Link */}
          {page.exampleSlug && (
            <section className="mb-12">
              <Link
                href={`/in-action/${page.exampleSlug}`}
                className="block rounded-lg border-2 border-foreground/15 bg-white p-6 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-cta mb-2">
                  Real Example
                </p>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  See a {page.title} marketing plan in action
                </h3>
                <p className="text-foreground/70 font-serif mb-3">
                  {page.exampleTeaser}
                </p>
                <span className="text-sm font-semibold text-cta">
                  View the full plan →
                </span>
              </Link>
            </section>
          )}

          {/* CTA Section */}
          <div className="rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Get your {page.title.toLowerCase()} marketing plan
            </h2>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto font-serif">
              Answer a few questions about your business. Get a complete marketing
              plan with competitor research, channel strategy, and a 30-day roadmap.
            </p>
            <p className="text-foreground font-semibold mb-6">
              {config.singlePrice} · One-time · No subscription
            </p>
            <Link href="/start">
              <Button size="xl">
                Get my marketing plan
              </Button>
            </Link>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-foreground/50 mb-4">More resources:</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketing-plan-guide"
                className="text-sm text-cta hover:text-cta-hover font-medium"
              >
                How to Create a Marketing Plan →
              </Link>
              <Link
                href="/in-action"
                className="text-sm text-cta hover:text-cta-hover font-medium"
              >
                See All Examples →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
