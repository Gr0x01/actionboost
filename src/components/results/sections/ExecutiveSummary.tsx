import { Sparkles } from "lucide-react";
import { SectionCard } from "../SectionCard";

interface ExecutiveSummaryProps {
  content: string;
}

export function ExecutiveSummary({ content }: ExecutiveSummaryProps) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <SectionCard id="executive-summary" icon={Sparkles} title="Executive Summary" accentColor="primary">
      {/* Large opening quote style */}
      <div className="relative">
        {/* Decorative quote mark */}
        <div className="absolute -left-2 -top-2 text-6xl text-primary/10 font-serif leading-none select-none">
          "
        </div>

        {/* First paragraph - larger, more prominent */}
        {paragraphs[0] && (
          <p className="text-lg text-foreground leading-relaxed mb-6 pl-6 border-l-2 border-primary/30">
            {paragraphs[0]}
          </p>
        )}

        {/* Remaining paragraphs */}
        <div className="space-y-4 text-muted leading-relaxed">
          {paragraphs.slice(1).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
