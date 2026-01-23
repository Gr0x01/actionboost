import type { ParsedStrategy } from "@/lib/markdown/parser";
import type { StructuredOutput } from "@/lib/ai/formatter-types";
import type { TabType } from "@/lib/storage/visitTracking";
import { ExecutiveSummary } from "./sections/ExecutiveSummary";
import { CurrentSituation } from "./sections/CurrentSituation";
import { CompetitiveLandscape } from "./sections/CompetitiveLandscape";
import { StopDoing } from "./sections/StopDoing";
import { StartDoing } from "./sections/StartDoing";
import { ThisWeek } from "./sections/ThisWeek";
import { Roadmap } from "./sections/Roadmap";
import { SectionCard } from "./SectionCard";
import { MarkdownContent } from "./MarkdownContent";
import { InsightsView } from "./InsightsView";
import { TasksView } from "./TasksView";

interface ResultsContentProps {
  strategy: ParsedStrategy;
  structuredOutput?: StructuredOutput | null;
  runId?: string;
  /** Active tab - controlled by parent (via useResultsTab hook) */
  activeTab?: TabType;
}

/**
 * Dashboard layout - Renders tab content based on activeTab
 * Tab state is managed by parent via useResultsTab hook
 */
function DashboardLayout({
  strategy,
  structuredOutput,
  runId,
  activeTab = 'insights',
}: {
  strategy: ParsedStrategy;
  structuredOutput: StructuredOutput;
  runId: string;
  activeTab?: TabType;
}) {
  return (
    <div role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={activeTab}>
      {activeTab === 'insights' ? (
        <InsightsView strategy={strategy} structuredOutput={structuredOutput} />
      ) : (
        <TasksView runId={runId} structuredOutput={structuredOutput} />
      )}
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

export function ResultsContent({ strategy, structuredOutput, runId, activeTab }: ResultsContentProps) {
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
        activeTab={activeTab}
      />
    );
  }

  // Fallback to traditional layout
  return <TraditionalLayout strategy={strategy} />;
}
