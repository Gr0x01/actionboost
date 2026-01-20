import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface CurrentSituationProps {
  content: string;
}

export function CurrentSituation({ content }: CurrentSituationProps) {
  return (
    <SectionCard id="current-situation" title="Your Situation">
      <MarkdownContent content={content} extended />
    </SectionCard>
  );
}
