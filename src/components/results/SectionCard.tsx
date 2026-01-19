import type { LucideIcon } from "lucide-react";

type AccentColor = "primary" | "green" | "red" | "amber" | "blue";

interface SectionCardProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  accentColor?: AccentColor;
  children: React.ReactNode;
  className?: string;
}

const accentStyles: Record<
  AccentColor,
  {
    glow: string;
    icon: string;
    iconBg: string;
    border: string;
    titleAccent: string;
    decorLine: string;
  }
> = {
  primary: {
    glow: "shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)]",
    icon: "text-primary",
    iconBg: "bg-primary/10",
    border: "border-l-primary",
    titleAccent: "from-primary to-blue-400",
    decorLine: "bg-gradient-to-r from-primary/50 to-transparent",
  },
  green: {
    glow: "shadow-[0_0_60px_-15px_rgba(34,197,94,0.3)]",
    icon: "text-green-400",
    iconBg: "bg-green-500/10",
    border: "border-l-green-500",
    titleAccent: "from-green-400 to-emerald-300",
    decorLine: "bg-gradient-to-r from-green-500/50 to-transparent",
  },
  red: {
    glow: "shadow-[0_0_60px_-15px_rgba(239,68,68,0.25)]",
    icon: "text-red-400",
    iconBg: "bg-red-500/10",
    border: "border-l-red-500",
    titleAccent: "from-red-400 to-orange-400",
    decorLine: "bg-gradient-to-r from-red-500/50 to-transparent",
  },
  amber: {
    glow: "shadow-[0_0_60px_-15px_rgba(251,191,36,0.3)]",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
    border: "border-l-amber-500",
    titleAccent: "from-amber-400 to-yellow-300",
    decorLine: "bg-gradient-to-r from-amber-500/50 to-transparent",
  },
  blue: {
    glow: "shadow-[0_0_60px_-15px_rgba(59,130,246,0.25)]",
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10",
    border: "border-l-blue-500",
    titleAccent: "from-blue-400 to-cyan-300",
    decorLine: "bg-gradient-to-r from-blue-500/50 to-transparent",
  },
};

export function SectionCard({
  id,
  icon: Icon,
  title,
  accentColor = "primary",
  children,
  className = "",
}: SectionCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <section
      id={id}
      className={`
        relative overflow-hidden
        rounded-2xl border border-border/50 border-l-4 ${styles.border}
        bg-surface/80 backdrop-blur-sm
        ${styles.glow}
        transition-all duration-300 hover:border-border
        ${className}
      `}
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-4">
        {/* Decorative line */}
        <div className={`absolute top-0 left-0 right-0 h-px ${styles.decorLine}`} />

        <div className="flex items-center gap-4">
          {/* Icon - larger, more prominent */}
          <div
            className={`
              flex h-14 w-14 items-center justify-center rounded-xl
              ${styles.iconBg} border border-white/5
            `}
          >
            <Icon className={`h-7 w-7 ${styles.icon}`} strokeWidth={1.5} />
          </div>

          {/* Title - dramatic sizing */}
          <h2 className="text-2xl font-light tracking-tight text-foreground">
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        {children}
      </div>
    </section>
  );
}
