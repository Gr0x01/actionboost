import type { ParsedStrategy } from "@/lib/markdown/parser";
import { ExecutiveSummary } from "./sections/ExecutiveSummary";
import { CurrentSituation } from "./sections/CurrentSituation";
import { CompetitiveLandscape } from "./sections/CompetitiveLandscape";
import { StopDoing } from "./sections/StopDoing";
import { StartDoing } from "./sections/StartDoing";
import { Roadmap } from "./sections/Roadmap";
import { SectionCard } from "./SectionCard";
import { MarkdownContent } from "./MarkdownContent";

interface ResultsContentProps {
  strategy: ParsedStrategy;
}

export function ResultsContent({ strategy }: ResultsContentProps) {
  return (
    <div className="space-y-8">
      {strategy.executiveSummary && (
        <ExecutiveSummary content={strategy.executiveSummary.content} />
      )}

      {strategy.currentSituation && (
        <CurrentSituation content={strategy.currentSituation.content} />
      )}

      {strategy.competitiveLandscape && (
        <CompetitiveLandscape content={strategy.competitiveLandscape.content} />
      )}

      {strategy.channelStrategy && (
        <SectionCard id="channel-strategy" title="Channel Strategy">
          <MarkdownContent content={strategy.channelStrategy.content} extended />
        </SectionCard>
      )}

      {strategy.stopDoing && (
        <StopDoing content={strategy.stopDoing.content} />
      )}

      {strategy.startDoing && (
        <StartDoing content={strategy.startDoing.content} />
      )}

      {strategy.thisWeek && (
        <SectionCard id="this-week" title="This Week" variant="boxed">
          <MarkdownContent content={strategy.thisWeek.content} extended />
        </SectionCard>
      )}

      {strategy.roadmap && (
        <Roadmap content={strategy.roadmap.content} />
      )}

      {strategy.metricsDashboard && (
        <SectionCard id="metrics-dashboard" title="Metrics Dashboard">
          <MarkdownContent content={strategy.metricsDashboard.content} extended />
        </SectionCard>
      )}

      {strategy.contentTemplates && (
        <SectionCard id="content-templates" title="Content Templates">
          <MarkdownContent content={strategy.contentTemplates.content} extended />
        </SectionCard>
      )}
    </div>
  );
}
