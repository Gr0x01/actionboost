import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface CompetitiveLandscapeProps {
  content: string;
}

export function CompetitiveLandscape({ content }: CompetitiveLandscapeProps) {
  return (
    <SectionCard id="competitive-landscape" title="Competitive Landscape">
      <MarkdownContent content={content} extended />
    </SectionCard>
  );
}
