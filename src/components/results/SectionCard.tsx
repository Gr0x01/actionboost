interface SectionCardProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** "boxed" = brutalist frame for actionable sections, "clean" = simple divider */
  variant?: "boxed" | "clean";
  /** If true, removes top border (for first section) */
  isFirst?: boolean;
}

export function SectionCard({
  id,
  title,
  children,
  className = "",
  variant = "clean",
  isFirst = false,
}: SectionCardProps) {
  // Boxed variant - brutalist frame for key actionable sections
  if (variant === "boxed") {
    return (
      <section id={id} className={`scroll-mt-32 ${className}`}>
        <div className="border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
          {/* Section title - bold sans */}
          <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight mb-6">
            {title}
          </h2>

          {/* Content - serif for readability */}
          <div className="font-serif text-[17px] lg:text-[18px] leading-[1.75] text-foreground/90">
            {children}
          </div>
        </div>
      </section>
    );
  }

  // Clean variant - simple top border divider (or no border if first)
  return (
    <section id={id} className={`scroll-mt-32 ${className}`}>
      <div className={isFirst ? "" : "border-t-[3px] border-foreground pt-8"}>
        {/* Section title - bold sans */}
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight mb-6">
          {title}
        </h2>

        {/* Content - serif for readability */}
        <div className="font-serif text-[17px] lg:text-[18px] leading-[1.75] text-foreground/90">
          {children}
        </div>
      </div>
    </section>
  );
}
