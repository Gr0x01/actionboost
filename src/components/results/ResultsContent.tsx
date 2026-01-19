import type { ParsedStrategy } from "@/lib/markdown/parser";
import { ExecutiveSummary } from "./sections/ExecutiveSummary";
import { CurrentSituation } from "./sections/CurrentSituation";
import { CompetitiveLandscape } from "./sections/CompetitiveLandscape";
import { StopDoing } from "./sections/StopDoing";
import { StartDoing } from "./sections/StartDoing";
import { QuickWins } from "./sections/QuickWins";
import { Roadmap } from "./sections/Roadmap";
import { MetricsToTrack } from "./sections/MetricsToTrack";

interface ResultsContentProps {
  strategy: ParsedStrategy;
}

export function ResultsContent({ strategy }: ResultsContentProps) {
  return (
    <div className="space-y-0">
      {/* Executive Summary - most important, always first */}
      {strategy.executiveSummary && (
        <ExecutiveSummary content={strategy.executiveSummary.content} />
      )}

      {/* Current Situation */}
      {strategy.currentSituation && (
        <CurrentSituation content={strategy.currentSituation.content} />
      )}

      {/* Competitive Landscape */}
      {strategy.competitiveLandscape && (
        <CompetitiveLandscape content={strategy.competitiveLandscape.content} />
      )}

      {/* Stop Doing - before Start Doing for contrast */}
      {strategy.stopDoing && (
        <StopDoing content={strategy.stopDoing.content} />
      )}

      {/* Start Doing - the meat of the strategy */}
      {strategy.startDoing && (
        <StartDoing content={strategy.startDoing.content} />
      )}

      {/* Quick Wins - actionable this week */}
      {strategy.quickWins && (
        <QuickWins content={strategy.quickWins.content} />
      )}

      {/* 30-Day Roadmap */}
      {strategy.roadmap && (
        <Roadmap content={strategy.roadmap.content} />
      )}

      {/* Metrics to Track */}
      {strategy.metricsToTrack && (
        <MetricsToTrack content={strategy.metricsToTrack.content} />
      )}
    </div>
  );
}
