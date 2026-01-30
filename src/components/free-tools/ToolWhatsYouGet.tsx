interface FeatureItem {
  title: string;
  description: string;
}

interface ToolWhatsYouGetProps {
  label?: string;
  headline: React.ReactNode;
  intro: React.ReactNode;
  features: FeatureItem[];
  preview: React.ReactNode;
}

export function ToolWhatsYouGet({
  label = "What you get",
  headline,
  intro,
  features,
  preview,
}: ToolWhatsYouGetProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-8">
      <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase text-center mb-4">
        {label}
      </p>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight text-center mb-12">
        {headline}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-start">
        <div className="space-y-6">
          <div className="text-base sm:text-lg text-foreground/70 leading-relaxed">
            {intro}
          </div>

          <div className="space-y-5 pt-4 border-t border-foreground/10">
            {features.map((f) => (
              <div key={f.title}>
                <p className="text-base font-bold text-foreground">{f.title}</p>
                <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {preview}
      </div>
    </section>
  );
}
