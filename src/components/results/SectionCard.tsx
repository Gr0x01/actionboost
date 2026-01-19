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
        {/* Section title */}
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-6">
          {title}
        </h2>

        {/* Content */}
        <div className="font-serif text-[18px] leading-[1.7] text-foreground/90">
          {children}
        </div>
      </div>
    </section>
  );
}
