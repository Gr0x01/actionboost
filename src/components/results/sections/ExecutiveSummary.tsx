import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface ExecutiveSummaryProps {
  content: string;
}

export function ExecutiveSummary({ content }: ExecutiveSummaryProps) {
  // Split into first paragraph and rest for different styling
  const paragraphs = content.split("\n\n").filter(Boolean);
  const firstParagraph = paragraphs[0] || "";
  const remainingContent = paragraphs.slice(1).join("\n\n");

  return (
    <SectionCard id="executive-summary" title="Executive Summary" isFirst>
      {/* First paragraph - larger, with left border accent (brutalist) */}
      {firstParagraph && (
        <div className="pl-6 border-l-4 border-cta mb-6">
          <MarkdownContent
            content={firstParagraph}
            className="text-lg text-foreground leading-relaxed [&>p]:mb-0"
            extended
          />
        </div>
      )}

      {/* Remaining paragraphs */}
      {remainingContent && (
        <MarkdownContent
          content={remainingContent}
          className="text-foreground/80"
          extended
        />
      )}
    </SectionCard>
  );
}
