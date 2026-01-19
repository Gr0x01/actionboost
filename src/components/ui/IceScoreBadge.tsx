interface IceScoreBadgeProps {
  impact: number;
  confidence: number;
  ease: number;
}

/**
 * ICE Score Badge - displays Impact, Confidence, Ease scores
 * Floats right so content wraps around it
 */
export function IceScoreBadge({ impact, confidence, ease }: IceScoreBadgeProps) {
  // Don't render if all scores are 0 (parsing failed)
  if (impact === 0 && confidence === 0 && ease === 0) {
    return null;
  }

  return (
    <div className="float-right ml-6 mb-4 px-3 py-2 rounded-lg border border-border/40">
      <div className="flex gap-4">
        <div className="text-center cursor-help" title="Impact: How much will this move the needle?">
          <div className="text-xl font-semibold text-foreground">{impact}</div>
          <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Impact</div>
        </div>
        <div className="text-center cursor-help" title="Confidence: How sure are we this will work?">
          <div className="text-xl font-semibold text-foreground">{confidence}</div>
          <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Confidence</div>
        </div>
        <div className="text-center cursor-help" title="Ease: How easy is this to implement?">
          <div className="text-xl font-semibold text-foreground">{ease}</div>
          <div className="text-[10px] font-sans uppercase tracking-wider text-muted">Ease</div>
        </div>
      </div>
    </div>
  );
}
