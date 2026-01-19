import { XCircle, AlertTriangle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { parseStopDoing, type StopItem } from "@/lib/markdown/parser";

interface StopDoingProps {
  content: string;
}

export function StopDoing({ content }: StopDoingProps) {
  const items = parseStopDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard icon={XCircle} title="Stop Doing" accentColor="red">
        <div className="text-muted whitespace-pre-wrap">{content}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={XCircle} title="Stop Doing" accentColor="red">
      {/* Warning banner */}
      <div className="flex items-center gap-2 mb-6 py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">These are draining your resources</span>
      </div>

      <div className="space-y-3">
        {items.map((item: StopItem, index: number) => (
          <div
            key={index}
            className="relative pl-8 py-3 border-l-2 border-red-500/30 hover:border-red-500/60 transition-colors"
          >
            {/* X indicator */}
            <div className="absolute left-0 top-3 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-3 w-3 text-red-500" />
            </div>

            {/* Content */}
            <div>
              <p className="font-medium text-foreground mb-1">{item.action}</p>
              {item.reasoning && (
                <p className="text-sm text-muted">{item.reasoning}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
