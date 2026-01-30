interface ToolHeroSectionProps {
  headline: React.ReactNode;
  subheadline: string;
  children: React.ReactNode;
}

export function ToolHeroSection({ headline, subheadline, children }: ToolHeroSectionProps) {
  return (
    <section className="pt-20 lg:pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
          {headline}
        </h1>
        <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-foreground/70 max-w-2xl mx-auto font-medium">
          {subheadline}
        </p>
      </div>
      {children}
    </section>
  );
}
