import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { parseQuickWins, type QuickWin } from "@/lib/markdown/parser";

interface QuickWinsProps {
  content: string;
}

export function QuickWins({ content }: QuickWinsProps) {
  const wins = parseQuickWins(content);

  // Fallback if parsing fails
  if (wins.length === 0) {
    return (
      <SectionCard id="quick-wins" title="Quick Wins">
        <MarkdownContent content={content} extended />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="quick-wins" title="Quick Wins">
      <p className="mb-6 text-foreground/80">
        Do these in the next 7 days:
      </p>

      <ol className="list-decimal list-outside ml-5 space-y-2">
        {wins.map((win: QuickWin, index: number) => (
          <li key={index} className="text-foreground/80 pl-1">
            <MarkdownContent
              content={win.action}
              className="inline"
            />
            {win.timeEstimate && (
              <span className="text-muted"> — {win.timeEstimate}</span>
            )}
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
