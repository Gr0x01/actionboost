import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface StopDoingProps {
  content: string;
}

export function StopDoing({ content }: StopDoingProps) {
  return (
    <SectionCard id="stop-doing" title="Stop Doing" variant="boxed">
      <MarkdownContent content={content} extended />
    </SectionCard>
  );
}
