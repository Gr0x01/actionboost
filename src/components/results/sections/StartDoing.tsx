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
          <div key={item.title} className="relative">
            {/* Header row with rank badge and title */}
            <div className="flex items-start gap-4 mb-3">
              {/* Rank badge */}
              <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/90 text-white text-sm font-semibold">
                {index + 1}
              </div>

              {/* Title and ICE total */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium text-foreground leading-tight">
                    {item.title}
                  </h3>
                  {item.iceScore > 0 && (
                    <span className="flex-shrink-0 text-sm text-muted">
                      ICE: <span className="font-semibold text-green-400">{item.iceScore}</span>
                    </span>
                  )}
                </div>

                {/* ICE breakdown - compact inline display */}
                {item.impact.score > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <span>
                        Impact: <span className="font-medium text-blue-400">{item.impact.score}</span>
                      </span>
                      <span className="text-border/60 mx-2">|</span>
                      <span>
                        Confidence: <span className="font-medium text-purple-400">{item.confidence.score}</span>
                      </span>
                      <span className="text-border/60 mx-2">|</span>
                      <span>
                        Ease: <span className="font-medium text-amber-400">{item.ease.score}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description with markdown rendering */}
            {item.description && (
              <div className="ml-11 mt-4">
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
