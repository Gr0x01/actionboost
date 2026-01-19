import { PlayCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { parseStartDoing, type ICEItem } from "@/lib/markdown/parser";

interface StartDoingProps {
  content: string;
}

function ICEScoreRing({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  const circumference = 2 * Math.PI * 18;
  const progress = (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          {/* Background ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-border"
          />
          {/* Progress ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className={color}
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
          {score}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
        {label}
      </span>
    </div>
  );
}

export function StartDoing({ content }: StartDoingProps) {
  const items = parseStartDoing(content);

  // Fallback if parsing fails
  if (items.length === 0) {
    return (
      <SectionCard id="start-doing" icon={PlayCircle} title="Start Doing" accentColor="green">
        <div className="text-muted whitespace-pre-wrap">{content}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard id="start-doing" icon={PlayCircle} title="Start Doing" accentColor="green">
      <p className="text-muted mb-8 text-sm">
        Ranked by ICE score — Impact, Confidence, and Ease combined.
      </p>

      <div className="space-y-4">
        {items.map((item: ICEItem, index: number) => (
          <div
            key={item.title}
            className="group relative"
          >
            {/* Rank badge - positioned outside */}
            <div className="absolute -left-3 top-6 z-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/30">
                {index + 1}
              </div>
            </div>

            {/* Main card */}
            <div className="ml-4 rounded-xl border border-border/50 bg-background/50 p-6 transition-all duration-300 hover:border-green-500/30 hover:bg-background/80">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <h3 className="text-lg font-medium text-foreground leading-tight pt-1">
                  {item.title}
                </h3>

                {/* Total ICE Score - prominent */}
                {item.iceScore > 0 && (
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="text-3xl font-light text-green-400">
                      {item.iceScore}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted">
                      ICE
                    </div>
                  </div>
                )}
              </div>

              {/* ICE Score rings */}
              {item.impact.score > 0 && (
                <div className="flex items-center justify-start gap-6 mb-5 py-4 px-4 -mx-4 bg-surface/50 rounded-lg">
                  <ICEScoreRing
                    score={item.impact.score}
                    label="Impact"
                    color="text-blue-500"
                  />
                  <ICEScoreRing
                    score={item.confidence.score}
                    label="Confidence"
                    color="text-purple-500"
                  />
                  <ICEScoreRing
                    score={item.ease.score}
                    label="Ease"
                    color="text-amber-500"
                  />

                  {/* Score breakdown on hover */}
                  <div className="hidden lg:flex flex-col gap-1 ml-auto text-xs text-muted">
                    <span>{item.impact.reason}</span>
                    <span>{item.confidence.reason}</span>
                    <span>{item.ease.reason}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div className="text-muted text-sm leading-relaxed">
                  {item.description.split("\n\n").map((p, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
