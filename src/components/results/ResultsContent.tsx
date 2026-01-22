import type { ParsedStrategy } from "@/lib/markdown/parser";
import type { StructuredOutput } from "@/lib/ai/formatter-types";
import { ExecutiveSummary } from "./sections/ExecutiveSummary";
import { CurrentSituation } from "./sections/CurrentSituation";
import { CompetitiveLandscape } from "./sections/CompetitiveLandscape";
import { StopDoing } from "./sections/StopDoing";
import { StartDoing } from "./sections/StartDoing";
import { ThisWeek } from "./sections/ThisWeek";
import { Roadmap } from "./sections/Roadmap";
import { SectionCard } from "./SectionCard";
import { MarkdownContent } from "./MarkdownContent";
import {
  CommandCenter,
  PriorityCards,
  MetricsSnapshot,
  CompetitorSnapshot,
  DeepDivesAccordion,
} from "./dashboard";

interface ResultsContentProps {
  strategy: ParsedStrategy;
  structuredOutput?: StructuredOutput | null;
  runId?: string;
}

/**
 * Dashboard layout - Redesigned with visual hierarchy
 *
 * Key changes from "blob blob blob" version:
 * 1. Only CommandCenter gets full brutalist box treatment
 * 2. Priority #1 as hero moment with giant offset rank number
 * 3. Metrics/Competitors as compact, borderless sections
 * 4. Asymmetric grid layout creates visual tension
 * 5. Whisper-quiet section labels (mono, tiny, uppercase)
 * 6. Increased spacing between major sections (space-y-12)
 */
function DashboardLayout({
  strategy,
  structuredOutput,
  runId,
}: {
  strategy: ParsedStrategy;
  structuredOutput: StructuredOutput;
  runId: string;
}) {
  return (
    <div className="space-y-12">
      {/* Hero: Command Center - the ONLY full brutalist box */}
      {structuredOutput.thisWeek.days.length > 0 && (
        <CommandCenter
          runId={runId}
          days={structuredOutput.thisWeek.days}
          totalHours={structuredOutput.thisWeek.totalHours}
          currentWeek={structuredOutput.currentWeek}
          roadmapWeeks={structuredOutput.roadmapWeeks}
        />
      )}

      {/* Top Priorities - #1 as hero, #2-3 compact */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* Metrics + Competitors - asymmetric split, no outer boxes */}
      {(structuredOutput.metrics.length > 0 || structuredOutput.competitors.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {structuredOutput.metrics.length > 0 && (
            <div className="lg:col-span-3">
              <MetricsSnapshot metrics={structuredOutput.metrics} />
            </div>
          )}
          {structuredOutput.competitors.length > 0 && (
            <div className="lg:col-span-2">
              <CompetitorSnapshot competitors={structuredOutput.competitors} />
            </div>
          )}
        </div>
      )}

      {/* Deep Dives - minimal, constrained width */}
      <div className="max-w-3xl">
        <DeepDivesAccordion strategy={strategy} />
      </div>
    </div>
  );
}

/**
 * Traditional layout - fallback when no structured_output
 */
function TraditionalLayout({ strategy }: { strategy: ParsedStrategy }) {
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
        <ThisWeek content={strategy.thisWeek.content} />
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

export function ResultsContent({ strategy, structuredOutput, runId }: ResultsContentProps) {
  // Use dashboard layout if structured_output is available and has meaningful data
  const hasDashboardData = structuredOutput &&
    (structuredOutput.thisWeek.days.length > 0 ||
     structuredOutput.topPriorities.length > 0);

  if (hasDashboardData && runId) {
    return (
      <DashboardLayout
        strategy={strategy}
        structuredOutput={structuredOutput}
        runId={runId}
      />
    );
  }

  // Fallback to traditional layout
  return <TraditionalLayout strategy={strategy} />;
}
