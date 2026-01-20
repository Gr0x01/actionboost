import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { parseStartDoing, type ICEItem } from "@/lib/markdown/parser";

interface StartDoingProps {
  content: string;
}

/**
 * Get border color intensity based on ICE score rank
 */
function getBorderClass(index: number): string {
  if (index === 0) return "border-cta";
  if (index === 1) return "border-cta/70";
  return "border-foreground/30";
}

/**
 * Get badge style based on ICE score rank
 */
function getBadgeClass(index: number): string {
  if (index === 0) return "bg-cta text-white";
  return "bg-foreground/10 text-foreground";
}

export function StartDoing({ content }: StartDoingProps) {
  const items = parseStartDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard id="start-doing" title="Start Doing" variant="clean">
        <MarkdownContent content={content} extended />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="start-doing" title="Start Doing" variant="clean">
      <p className="text-foreground/70 text-sm mb-6">
        Ranked by ICE score — Impact, Confidence, and Ease combined.
      </p>

      <div className="space-y-6">
        {items.map((item: ICEItem, index: number) => (
          <div
            key={item.title}
            className={`border-l-4 ${getBorderClass(index)} pl-4`}
          >
            {/* ICE badge above title */}
            <span className={`font-mono text-xs px-2 py-0.5 font-bold inline-block mb-1 ${getBadgeClass(index)}`}>
              ICE: {item.iceScore}
            </span>
            <h4 className="font-bold text-foreground mb-1">{item.title}</h4>

            {/* Description */}
            {item.description && (
              <div className="text-foreground/70 text-sm leading-relaxed">
                <MarkdownContent
                  content={cleanDescription(item.description)}
                  extended
                  className="[&>p]:mb-2 [&>p:last-child]:mb-0"
                />
              </div>
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
