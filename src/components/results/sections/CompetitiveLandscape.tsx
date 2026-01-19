import { Users } from "lucide-react";
import { SectionCard } from "../SectionCard";

interface CompetitiveLandscapeProps {
  content: string;
}

export function CompetitiveLandscape({ content }: CompetitiveLandscapeProps) {
  // Parse content similar to CurrentSituation
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 mb-4">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-muted">
              <span className="text-blue-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[-*]\s*/, ""));
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 text-muted">
          {trimmed}
        </p>
      );
    }
  }
  flushList();

  return (
    <SectionCard id="competitive-landscape" icon={Users} title="Competitive Landscape" accentColor="blue">
      <div className="leading-relaxed">{elements}</div>
    </SectionCard>
  );
}
