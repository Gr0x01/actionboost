// Main components
export { ResultsContent } from "./ResultsContent";
export { StatusMessage } from "./StatusMessage";
export { ExportBar } from "./ExportBar";
export { ShareModal } from "./ShareModal";
export { SectionCard } from "./SectionCard";
export { TableOfContents } from "./TableOfContents";
export { MagicLinkBanner } from "./MagicLinkBanner";
export { AddContextSection } from "./AddContextSection";

// New plan-centric components
export { ResultsHeader } from "./ResultsHeader";
export { ResultsTabNavigation } from "./ResultsTabNavigation";
export { PlanSwitcher } from "./PlanSwitcher";
export { ExportActions } from "./ExportActions";
export { InsightsView } from "./InsightsView";
export { DashboardView } from "./DashboardView";

// Section components
export { ExecutiveSummary } from "./sections/ExecutiveSummary";
export { CurrentSituation } from "./sections/CurrentSituation";
export { CompetitiveLandscape } from "./sections/CompetitiveLandscape";
export { StopDoing } from "./sections/StopDoing";
export { StartDoing } from "./sections/StartDoing";
export { Roadmap } from "./sections/Roadmap";

// Re-export TOC types and constants for cleaner imports
export type { TOCSection } from "@/lib/constants/toc-sections";
export {
  STRATEGY_SECTIONS,
  BLOG_SECTIONS,
  FREE_TIER_LOCKED_SECTIONS,
} from "@/lib/constants/toc-sections";
