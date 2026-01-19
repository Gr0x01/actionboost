"use client";

import { useState } from "react";
import { Calendar, Check, Circle, ChevronRight } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { parseRoadmap, type RoadmapWeek } from "@/lib/markdown/parser";

interface RoadmapProps {
  content: string;
}

export function Roadmap({ content }: RoadmapProps) {
  const weeks = parseRoadmap(content);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  // Fallback if parsing fails
  if (weeks.length === 0) {
    return (
      <SectionCard icon={Calendar} title="30-Day Roadmap" accentColor="primary">
        <div className="text-muted whitespace-pre-wrap">{content}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={Calendar} title="30-Day Roadmap" accentColor="primary">
      <p className="text-muted text-sm mb-8">
        Your week-by-week execution plan. Focus on one week at a time.
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

        <div className="space-y-2">
          {weeks.map((week: RoadmapWeek) => {
            const isExpanded = expandedWeek === week.week;
            const isFirst = week.week === 1;

            return (
              <div key={week.week} className="relative">
                {/* Week header - clickable */}
                <button
                  onClick={() => setExpandedWeek(isExpanded ? 0 : week.week)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200
                    ${isExpanded ? "bg-primary/5 border border-primary/20" : "hover:bg-surface/50"}
                  `}
                >
                  {/* Week number circle */}
                  <div
                    className={`
                      relative z-10 flex h-10 w-10 items-center justify-center rounded-full
                      text-sm font-bold transition-all duration-200
                      ${isExpanded
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : isFirst
                          ? "bg-primary/20 text-primary"
                          : "bg-surface border border-border text-muted"
                      }
                    `}
                  >
                    {week.week}
                  </div>

                  {/* Week info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isExpanded ? "text-primary" : "text-foreground"}`}>
                        Week {week.week}
                      </span>
                      <span className="text-muted">—</span>
                      <span className="text-muted truncate">{week.theme}</span>
                    </div>
                    {!isExpanded && (
                      <div className="text-xs text-muted mt-0.5">
                        {week.tasks.length} tasks
                      </div>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <ChevronRight
                    className={`h-5 w-5 text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Tasks - expandable */}
                {isExpanded && (
                  <div className="ml-14 mt-2 mb-4 space-y-2 animate-fade-in">
                    {week.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 py-2 px-3 rounded-lg bg-background/50"
                      >
                        {task.checked ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border flex-shrink-0 mt-0.5">
                            <Circle className="h-2 w-2 text-muted" />
                          </div>
                        )}
                        <span
                          className={
                            task.checked
                              ? "text-muted line-through"
                              : "text-foreground"
                          }
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
