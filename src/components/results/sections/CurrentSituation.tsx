import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface CurrentSituationProps {
  content: string;
}

export function CurrentSituation({ content }: CurrentSituationProps) {
  return (
    <SectionCard id="current-situation" title="Your Current Situation">
      <MarkdownContent content={content} />
    </SectionCard>
  );
}
