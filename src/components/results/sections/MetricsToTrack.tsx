import { SectionCard } from "../SectionCard";
import { MarkdownContent } from "../MarkdownContent";

interface MetricsToTrackProps {
  content: string;
}

export function MetricsToTrack({ content }: MetricsToTrackProps) {
  return (
    <SectionCard id="metrics" title="Metrics to Track">
      <MarkdownContent content={content} extended />
    </SectionCard>
  );
}
