interface SectionCardProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  isFirst?: boolean;
}

export function SectionCard({
  id,
  title,
  children,
  className = "",
  isFirst = false,
}: SectionCardProps) {
  return (
    <section id={id} className={`scroll-mt-32 ${className}`}>
      <div
        className={`${isFirst ? "" : "border-t border-border/30 pt-12 mt-12"}`}
      >
        {/* Section title - sans for clear hierarchy */}
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-8">
          {title}
        </h2>

        {/* Content - serif for readability */}
        <div className="font-serif text-[18px] leading-[1.75] text-foreground/90">
          {children}
        </div>
      </div>
    </section>
  );
}
