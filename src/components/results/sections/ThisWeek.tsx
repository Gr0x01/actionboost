import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface ThisWeekProps {
  content: string;
}

interface DayTask {
  day: string;
  action: string;
  time: string;
  metric: string;
}

/**
 * Parse "This Week" markdown table into structured tasks
 */
function parseThisWeekTable(content: string): DayTask[] {
  const tasks: DayTask[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Skip header rows and dividers
    if (line.startsWith("|--") || line.includes("Day") && line.includes("Action")) {
      continue;
    }

    // Parse table row: | Day | Action | Time | Success Metric |
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (match) {
      tasks.push({
        day: match[1],
        action: match[2].trim(),
        time: match[3].trim(),
        metric: match[4].trim(),
      });
    }
  }

  return tasks;
}

export function ThisWeek({ content }: ThisWeekProps) {
  const tasks = parseThisWeekTable(content);

  // Fallback if parsing fails - render as regular markdown
  if (tasks.length === 0) {
    return (
      <SectionCard id="this-week" title="This Week" variant="boxed">
        <MarkdownContent content={content} extended />
      </SectionCard>
    );
  }

  return (
    <SectionCard id="this-week" title="This Week" variant="boxed">
      <p className="text-foreground/70 text-sm mb-6">
        Your action items for the next 7 days.
      </p>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="flex gap-3">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 h-fit font-bold shrink-0">
              D{task.day}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">
                {task.action}
              </p>
              <p className="text-foreground/60 text-sm">
                {task.time} · {task.metric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
