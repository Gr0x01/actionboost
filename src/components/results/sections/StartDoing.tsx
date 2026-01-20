import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { IceScoreBadge } from "@/components/ui/IceScoreBadge";
import { parseStartDoing, type ICEItem } from "@/lib/markdown/parser";

interface StartDoingProps {
  content: string;
}

export function StartDoing({ content }: StartDoingProps) {
  const items = parseStartDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard id="start-doing" title="Start Doing" variant="boxed">
        <MarkdownContent content={content} extended />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="start-doing" title="Start Doing" variant="boxed">
      <p className="text-foreground/80 mb-6">
        Ranked by ICE score — Impact, Confidence, and Ease combined.
      </p>

      <div className="space-y-8">
        {items.map((item: ICEItem, index: number) => (
          <div key={item.title}>
            {/* ICE Callout - floats right, content wraps around */}
            <IceScoreBadge
              impact={item.impact.score}
              confidence={item.confidence.score}
              ease={item.ease.score}
            />

            {/* Title */}
            <h3 className="text-lg font-medium text-foreground leading-tight mb-3">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <div>
                <MarkdownContent
                  content={cleanDescription(item.description)}
                  extended
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
