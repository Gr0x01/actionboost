import { Zap, Clock, ArrowRight } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { parseQuickWins, type QuickWin } from "@/lib/markdown/parser";

interface QuickWinsProps {
  content: string;
}

export function QuickWins({ content }: QuickWinsProps) {
  const wins = parseQuickWins(content);

  // Fallback if parsing fails
  if (wins.length === 0) {
    return (
      <SectionCard id="quick-wins" icon={Zap} title="Quick Wins" accentColor="amber">
        <div className="text-muted whitespace-pre-wrap">{content}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard id="quick-wins" icon={Zap} title="Quick Wins" accentColor="amber">
      {/* Urgency banner */}
      <div className="flex items-center gap-2 mb-6 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
        <Zap className="h-4 w-4" />
        <span className="font-medium">Do these in the next 7 days</span>
      </div>

      <div className="space-y-3">
        {wins.map((win: QuickWin, index: number) => (
          <div
            key={index}
            className="group flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-transparent hover:border-amber-500/20 transition-all duration-200"
          >
            {/* Checkbox-style indicator */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-md border-2 border-amber-500/50 flex items-center justify-center group-hover:border-amber-500 group-hover:bg-amber-500/10 transition-colors">
                <ArrowRight className="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium leading-relaxed">
                {win.action}
              </p>
            </div>

            {/* Time estimate badge */}
            {win.timeEstimate && (
              <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-muted">
                <Clock className="h-3 w-3" />
                <span>{win.timeEstimate}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom motivation */}
      <div className="mt-6 pt-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted">
          Small actions compound. Start with #1 today.
        </p>
      </div>
    </SectionCard>
  );
}
