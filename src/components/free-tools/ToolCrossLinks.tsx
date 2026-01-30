import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ToolLink {
  label: string;
  href: string;
  description: string;
}

interface ToolCrossLinksProps {
  tools: ToolLink[];
  headline?: string;
}

export function ToolCrossLinks({
  tools,
  headline = "More free tools",
}: ToolCrossLinksProps) {
  if (tools.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="border-t border-foreground/10 pt-10">
        <h2 className="text-lg font-bold text-foreground/70 mb-6">
          {headline}
        </h2>

        <div className="divide-y divide-foreground/10">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center justify-between py-4 gap-4"
            >
              <div>
                <span className="font-bold text-foreground group-hover:text-cta transition-colors">
                  {tool.label}
                </span>
                <p className="text-sm text-foreground/50 mt-0.5">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-cta group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
