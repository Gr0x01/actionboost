import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ToolLink {
  label: string;
  description: string;
  href: string;
}

interface ToolCrossLinksProps {
  heading?: string;
  tools: ToolLink[];
}

export function ToolCrossLinks({ heading = "More free tools", tools }: ToolCrossLinksProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase text-center mb-8">
        {heading}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group border-2 border-foreground/10 rounded-md p-5 hover:border-foreground/20 transition-colors"
            style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.06)" }}
          >
            <p className="font-bold text-foreground group-hover:text-cta transition-colors">
              {tool.label}
            </p>
            <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
              {tool.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-cta mt-3">
              Try it free <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
