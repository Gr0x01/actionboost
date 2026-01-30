interface FeatureItem {
  title: string;
  description: string;
}

interface ToolWhatsYouGetProps {
  label?: string;
  headline: React.ReactNode;
  intro: React.ReactNode;
  features: FeatureItem[];
}

/**
 * Single-column typographic feature list. No preview card, no two-column grid.
 * Just a readable list separated by thin rules.
 */
export function ToolWhatsYouGet({
  label = "What you get",
  headline,
  intro,
  features,
}: ToolWhatsYouGetProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-8">
      <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
        {label}
      </p>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-6">
        {headline}
      </h2>

      <div className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10">
        {intro}
      </div>

      <div className="divide-y divide-foreground/10">
        {features.map((f) => (
          <div key={f.title} className="py-4 first:pt-0">
            <p className="text-base font-bold text-foreground">{f.title}</p>
            <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
