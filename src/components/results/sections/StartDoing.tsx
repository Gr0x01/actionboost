import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { parseStartDoing, type ICEItem } from "@/lib/markdown/parser";

interface StartDoingProps {
  content: string;
}

export function StartDoing({ content }: StartDoingProps) {
  const items = parseStartDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard id="start-doing" title="Start Doing">
        <MarkdownContent content={content} />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="start-doing" title="Start Doing">
      <p className="text-muted mb-8 text-sm">
        Ranked by ICE score — Impact, Confidence, and Ease combined.
      </p>

      <div className="space-y-8">
        {items.map((item: ICEItem, index: number) => (
          <div key={item.title}>
            {/* ICE Callout - floats right, content wraps around */}
            {item.impact.score > 0 && (
              <div className="float-right ml-6 mb-4 px-3 py-2 rounded-lg border border-border/40">
                <div className="flex gap-4">
                  <div className="text-center cursor-help" title="Impact: How much will this move the needle?">
                    <div className="text-xl font-semibold text-foreground">{item.impact.score}</div>
                    <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Impact</div>
                  </div>
                  <div className="text-center cursor-help" title="Confidence: How sure are we this will work?">
                    <div className="text-xl font-semibold text-foreground">{item.confidence.score}</div>
                    <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Confidence</div>
                  </div>
                  <div className="text-center cursor-help" title="Ease: How easy is this to implement?">
                    <div className="text-xl font-semibold text-foreground">{item.ease.score}</div>
                    <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Ease</div>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-medium text-foreground leading-tight mb-3">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <div>
                <MarkdownContent
                  content={cleanDescription(item.description)}
                  className="text-sm [&>p]:text-muted [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:text-muted [&>ol]:text-muted [&_strong]:text-foreground"
                />
              </div>
            )}

            {/* Divider between items (except last) */}
            {index < items.length - 1 && (
              <div className="mt-8 border-b border-border/20" />
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/**
 * Clean up description text before markdown rendering:
 * - Remove trailing horizontal rules (---)
 * - Trim excess whitespace
 */
function cleanDescription(description: string): string {
  return description
    .replace(/\n---\s*$/g, "") // Remove trailing ---
    .replace(/^---\s*\n/g, "") // Remove leading ---
    .trim();
}
