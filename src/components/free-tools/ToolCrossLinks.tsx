import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ToolLink {
  label: string;
  href: string;
}

interface ToolCrossLinksProps {
  tools: ToolLink[];
}

export function ToolCrossLinks({ tools }: ToolCrossLinksProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground/50">
      <span>Also free:</span>
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="inline-flex items-center gap-1 font-semibold text-foreground/70 hover:text-cta transition-colors"
        >
          {tool.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ))}
    </div>
  );
}
