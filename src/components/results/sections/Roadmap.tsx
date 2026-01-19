"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";
import { parseRoadmap, type RoadmapWeek } from "@/lib/markdown/parser";

interface RoadmapProps {
  content: string;
}

export function Roadmap({ content }: RoadmapProps) {
  const weeks = parseRoadmap(content);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  // Fallback if parsing fails - use MarkdownContent for consistent rendering
  if (weeks.length === 0) {
    return (
      <SectionCard id="roadmap" title="30-Day Roadmap">
        <MarkdownContent content={content} />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="roadmap" title="30-Day Roadmap">
      <p className="text-muted text-sm mb-6">
        Your week-by-week execution plan. Focus on one week at a time.
      </p>

      <div className="space-y-1">
        {weeks.map((week: RoadmapWeek) => {
          const isExpanded = expandedWeek === week.week;

          return (
            <div key={week.week}>
              {/* Week header - clickable */}
              <button
                onClick={() => setExpandedWeek(isExpanded ? 0 : week.week)}
                className="w-full flex items-center gap-3 py-2 text-left group"
              >
                {/* Expand indicator */}
                <ChevronRight
                  className={`h-4 w-4 text-muted flex-shrink-0 transition-transform duration-150 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />

                {/* Week info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-foreground">
                    Week {week.week}
                  </span>
                  <span className="text-muted">—</span>
                  <span className="text-muted truncate">{week.theme}</span>
                </div>

                {/* Task count when collapsed */}
                {!isExpanded && (
                  <span className="text-xs text-muted">
                    {week.tasks.length} tasks
                  </span>
                )}
              </button>

              {/* Tasks - expandable */}
              {isExpanded && (
                <div className="ml-7 mt-1 mb-3 space-y-1">
                  {week.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 py-1"
                    >
                      {/* Simple checkbox character */}
                      <span className="text-muted flex-shrink-0 w-4 text-center">
                        {task.checked ? "☑" : "☐"}
                      </span>
                      <span
                        className={
                          task.checked
                            ? "text-muted line-through"
                            : "text-foreground/80"
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
    </SectionCard>
  );
}
