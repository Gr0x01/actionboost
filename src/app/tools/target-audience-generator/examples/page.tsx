import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { NICHES } from "@/data/target-audience-niches";
import examples from "@/data/target-audience-examples.json";

export const metadata: Metadata = {
  title: "Target Audience Examples for 100+ Business Types | Boost",
  description:
    "Browse target audience profiles for yoga studios, SaaS startups, restaurants, real estate agents, and 100+ more business types. Free examples with demographics, pain points, and messaging guides.",
  openGraph: {
    title: "Target Audience Examples | Boost",
    description: "Browse detailed target audience profiles for 100+ business types.",
  },
};

const exampleData = examples as Record<string, { primaryAudience?: { headline?: string } }>;

export default function TargetAudienceExamplesIndex() {
  // Only show niches that have generated data
  const availableNiches = NICHES.filter((n) => n.slug in exampleData);

  // Group by category from niche data
  const categories: Record<string, typeof NICHES> = {};
  for (const niche of availableNiches) {
    const cat = niche.category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(niche);
  }

  const sortedCategories = Object.entries(categories).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <section className="pt-20 lg:pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.05]">
              Target audience profiles for{" "}
              <span className="font-black">{availableNiches.length}+ businesses</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
              Browse detailed audience profiles with demographics, pain points, and messaging guides.
              Want one for YOUR business?{" "}
              <Link href="/tools/target-audience-generator" className="text-cta font-semibold hover:underline">
                Generate it free
              </Link>.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          {sortedCategories.map(([category, niches]) => (
            <div key={category} className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4 border-b-2 border-foreground/10 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {niches.map((niche) => {
                  const data = exampleData[niche.slug];
                  return (
                    <Link
                      key={niche.slug}
                      href={`/tools/target-audience-generator/examples/${niche.slug}`}
                      className="bg-white border-2 border-foreground/15 rounded-md p-5 hover:border-foreground/30 hover:-translate-y-0.5 transition-all group"
                      style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.06)" }}
                    >
                      <p className="font-bold text-foreground mb-1.5 group-hover:text-cta transition-colors">
                        {niche.label}
                      </p>
                      {data?.primaryAudience?.headline && (
                        <p className="text-xs text-foreground/55 leading-relaxed line-clamp-2">
                          {data.primaryAudience.headline}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-cta font-semibold mt-3">
                        View profile <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {availableNiches.length === 0 && (
            <div className="text-center py-20">
              <p className="text-foreground/60 text-lg mb-4">
                Example profiles are being generated. Check back soon.
              </p>
              <Link
                href="/tools/target-audience-generator"
                className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
              >
                Generate yours now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
