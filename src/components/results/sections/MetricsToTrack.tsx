import { LineChart, TrendingUp } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { parseMetrics, type Metric } from "@/lib/markdown/parser";

interface MetricsToTrackProps {
  content: string;
}

export function MetricsToTrack({ content }: MetricsToTrackProps) {
  const metrics = parseMetrics(content);

  // Fallback if parsing fails
  if (metrics.length === 0) {
    return (
      <SectionCard id="metrics" icon={LineChart} title="Metrics to Track" accentColor="blue">
        <div className="text-muted whitespace-pre-wrap">{content}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard id="metrics" icon={LineChart} title="Metrics to Track" accentColor="blue">
      <p className="text-muted text-sm mb-6">
        Measure what matters. These KPIs will show if your strategy is working.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric: Metric, index: number) => (
          <div
            key={index}
            className="group relative p-5 rounded-xl border border-border/50 bg-background/50 hover:border-blue-500/30 transition-all duration-200"
          >
            {/* Metric name */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <h4 className="font-medium text-foreground leading-tight pt-1.5">
                {metric.name}
              </h4>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {metric.target && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium w-14 flex-shrink-0">
                    Target
                  </span>
                  <span className="text-muted">{metric.target}</span>
                </div>
              )}
              {metric.howToMeasure && (
                <div className="flex items-start gap-2">
                  <span className="text-muted/70 w-14 flex-shrink-0">How</span>
                  <span className="text-muted">{metric.howToMeasure}</span>
                </div>
              )}
              {metric.whyItMatters && (
                <div className="flex items-start gap-2">
                  <span className="text-muted/70 w-14 flex-shrink-0">Why</span>
                  <span className="text-muted">{metric.whyItMatters}</span>
                </div>
              )}
            </div>

            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-xl">
              <div className="absolute top-0 right-0 w-16 h-16 -translate-y-8 translate-x-8 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
