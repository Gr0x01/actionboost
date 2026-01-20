import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { parseStopDoing, type StopItem } from "@/lib/markdown/parser";

interface StopDoingProps {
  content: string;
}

export function StopDoing({ content }: StopDoingProps) {
  const items = parseStopDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard id="stop-doing" title="Stop Doing" variant="clean">
        <MarkdownContent content={content} extended />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="stop-doing" title="Stop Doing" variant="clean">
      <p className="text-foreground/70 text-sm mb-6">
        Activities draining resources without return. Cut these immediately.
      </p>

      <div className="space-y-5">
        {items.map((item: StopItem, index: number) => (
          <div
            key={index}
            className="border-l-4 border-foreground pl-4 relative"
          >
            {/* STOP badge above title */}
            <span className="font-mono text-xs px-2 py-0.5 font-bold bg-red-600 text-white inline-block mb-1">
              STOP
            </span>
            <h4 className="font-bold text-foreground mb-1">{item.action}</h4>

            {/* Reasoning */}
            {item.reasoning && (
              <p className="text-foreground/70 text-sm leading-relaxed">
                {item.reasoning}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
