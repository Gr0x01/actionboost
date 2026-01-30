import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { NICHES } from "@/data/target-audience-niches";
import examples from "@/data/target-audience-examples.json";
import type { TargetAudienceOutput } from "@/lib/ai/target-audience";
import { AudienceProfileDisplay } from "@/components/target-audience/AudienceProfileDisplay";

const exampleData = examples as Record<string, TargetAudienceOutput>;

type Props = { params: Promise<{ niche: string }> };

export function generateStaticParams() {
  return NICHES
    .filter((n) => n.slug in exampleData)
    .map((n) => ({ niche: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche: slug } = await params;
  const niche = NICHES.find((n) => n.slug === slug);
  if (!niche || !(slug in exampleData)) return { title: "Not Found" };

  const data = exampleData[slug];
  return {
    title: `Target Audience for ${niche.label} — Free Profile | Boost`,
    description: data?.primaryAudience?.headline || `Detailed target audience profile for a ${niche.label.toLowerCase()}. Demographics, pain points, buying triggers, and messaging guide.`,
    openGraph: {
      title: `Target Audience for ${niche.label} | Boost`,
      description: data?.primaryAudience?.headline || `Target audience profile for ${niche.label.toLowerCase()}`,
    },
  };
}

export default async function NicheExamplePage({ params }: Props) {
  const { niche: slug } = await params;
  const niche = NICHES.find((n) => n.slug === slug);

  if (!niche || !(slug in exampleData)) {
    notFound();
  }

  const output = exampleData[slug];
  const related = niche.relatedSlugs
    .filter((s) => s in exampleData)
    .map((s) => NICHES.find((n) => n.slug === s)!)
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 pb-24">
          {/* Breadcrumb */}
          <nav className="pt-8 pb-4 text-xs text-foreground/40">
            <Link href="/tools/target-audience-generator" className="hover:text-foreground transition-colors">
              Target Audience Generator
            </Link>
            {" / "}
            <Link href="/tools/target-audience-generator/examples" className="hover:text-foreground transition-colors">
              Examples
            </Link>
            {" / "}
            <span className="text-foreground/60">{niche.label}</span>
          </nav>

          {/* Header */}
          <section className="pt-4 pb-12">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              Example target audience profile
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-6">
              Target Audience for a {niche.label}
            </h1>

            {/* Headline card */}
            <div
              className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 mb-10"
              style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
            >
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta block mb-3">
                Ideal customer
              </span>
              <p className="text-xl lg:text-2xl font-serif text-foreground leading-relaxed">
                {output.primaryAudience.headline}
              </p>
            </div>
          </section>

          <AudienceProfileDisplay output={output} />

          {/* CTA */}
          <section className="pb-12">
            <div className="border-t-[3px] border-foreground mb-10" />
            <div
              className="bg-foreground text-white rounded-md p-6 md:p-8 text-center"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.2)" }}
            >
              <h2 className="text-xl font-bold mb-2">
                This is a generic {niche.label.toLowerCase()} profile. Yours will be specific to YOUR business.
              </h2>
              <p className="text-white/60 text-sm mb-6 max-w-lg mx-auto">
                Tell us what you sell and who you think your customer is. We&apos;ll generate a profile tailored to your exact market — free in 60 seconds.
              </p>
              <Link
                href="/tools/target-audience-generator"
                className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
              >
                Generate my custom profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Related niches */}
          {related.length > 0 && (
            <section className="pb-12">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
                Related profiles
              </span>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/tools/target-audience-generator/examples/${r.slug}`}
                    className="bg-white border-2 border-foreground/15 rounded-md p-4 hover:border-foreground/30 hover:-translate-y-0.5 transition-all group"
                    style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.06)" }}
                  >
                    <p className="font-bold text-foreground text-sm group-hover:text-cta transition-colors">
                      {r.label}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-cta font-semibold mt-2">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
