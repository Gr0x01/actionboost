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
      <div className="space-y-4">
        {items.map((item: StopItem, index: number) => (
          <div
            key={index}
            className="bg-red-50 border-2 border-red-200 p-4"
          >
            <p className="font-bold text-red-800 mb-1">{item.action}</p>
            {item.reasoning && (
              <p className="text-red-700/80 text-sm">{item.reasoning}</p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
