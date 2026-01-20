// =============================================================================
// STRATEGY MARKDOWN PARSER
// Parses AI-generated strategy output into structured sections
// =============================================================================

export type StrategySection = {
  id: string;
  title: string;
  content: string;
  rawMarkdown: string;
};

export type ParsedStrategy = {
  executiveSummary: StrategySection | null;
  currentSituation: StrategySection | null;
  competitiveLandscape: StrategySection | null;
  channelStrategy: StrategySection | null;
  stopDoing: StrategySection | null;
  startDoing: StrategySection | null;
  thisWeek: StrategySection | null;
  roadmap: StrategySection | null;
  metricsDashboard: StrategySection | null;
  contentTemplates: StrategySection | null;
  raw: string;
};

const SECTION_PATTERNS: Array<{ id: keyof Omit<ParsedStrategy, "raw">; pattern: RegExp }> = [
  { id: "executiveSummary", pattern: /^## Executive Summary/im },
  { id: "currentSituation", pattern: /^## Your Situation/im },
  { id: "competitiveLandscape", pattern: /^## Competitive Landscape/im },
  { id: "channelStrategy", pattern: /^## Channel Strategy/im },
  { id: "stopDoing", pattern: /^## Stop Doing/im },
  { id: "startDoing", pattern: /^## Start Doing/im },
  { id: "thisWeek", pattern: /^## This Week/im },
  { id: "roadmap", pattern: /^## 30-Day Roadmap/im },
  { id: "metricsDashboard", pattern: /^## Metrics Dashboard/im },
  { id: "contentTemplates", pattern: /^## Content Templates/im },
];

export function parseStrategy(markdown: string): ParsedStrategy {
  const result: ParsedStrategy = {
    executiveSummary: null,
    currentSituation: null,
    competitiveLandscape: null,
    channelStrategy: null,
    stopDoing: null,
    startDoing: null,
    thisWeek: null,
    roadmap: null,
    metricsDashboard: null,
    contentTemplates: null,
    raw: markdown,
  };

  // Split by ## headers while preserving header text
  const sections = markdown.split(/(?=^## )/gm);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    for (const { id, pattern } of SECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        const lines = trimmed.split("\n");
        const title = lines[0].replace(/^##\s*/, "").trim();
        const content = lines.slice(1).join("\n").trim();

        result[id] = {
          id,
          title,
          content,
          rawMarkdown: trimmed,
        };
        break;
      }
    }
  }

  return result;
}

// =============================================================================
// ICE SCORE PARSER - For "Start Doing" section
// =============================================================================

export type ICEItem = {
  title: string;
  impact: { score: number; reason: string };
  confidence: { score: number; reason: string };
  ease: { score: number; reason: string };
  iceScore: number;
  description: string;
};

export function parseStartDoing(content: string): ICEItem[] {
  // Split by ### headers (each recommendation)
  const items = content.split(/(?=^### )/gm).filter((s) => s.startsWith("###"));

  return items.map((item) => {
    const lines = item.split("\n");
    const title = lines[0].replace(/^###\s*/, "").trim();

    // Extract ICE scores using regex - support both formats:
    // Format 1: **Impact**: 9/10 - reason
    // Format 2: - **Impact**: 9/10 - reason (with bullet)
    const impactMatch = item.match(/\*\*Impact\*\*:\s*(\d+)\/10\s*[-–]\s*(.+)/i);
    const confidenceMatch = item.match(/\*\*Confidence\*\*:\s*(\d+)\/10\s*[-–]\s*(.+)/i);
    const easeMatch = item.match(/\*\*Ease\*\*:\s*(\d+)\/10\s*[-–]\s*(.+)/i);
    // ICE Score can be: **ICE Score**: 26 OR **ICE Score: 26** OR ICE Score: 26
    const iceMatch = item.match(/\*\*ICE Score[:\s]*(\d+)\*\*/i) ||
                     item.match(/\*\*ICE Score\*\*[:\s]*(\d+)/i) ||
                     item.match(/ICE Score[:\s]*(\d+)/i);

    // Get description (everything after the ICE scores section)
    const iceScoreIndex = item.toLowerCase().indexOf("ice score");
    const descStart = iceScoreIndex > 0 ? item.indexOf("\n\n", iceScoreIndex) : -1;
    const description = descStart > 0 ? item.slice(descStart).trim() : "";

    return {
      title,
      impact: {
        score: parseInt(impactMatch?.[1] || "0"),
        reason: impactMatch?.[2]?.trim() || "",
      },
      confidence: {
        score: parseInt(confidenceMatch?.[1] || "0"),
        reason: confidenceMatch?.[2]?.trim() || "",
      },
      ease: {
        score: parseInt(easeMatch?.[1] || "0"),
        reason: easeMatch?.[2]?.trim() || "",
      },
      iceScore: parseInt(iceMatch?.[1] || "0"),
      description,
    };
  });
}

// =============================================================================
// QUICK WINS PARSER
// =============================================================================

export type QuickWin = {
  action: string;
  timeEstimate: string | null;
};

export function parseQuickWins(content: string): QuickWin[] {
  // Quick wins are bullet points, possibly with time estimates
  const bullets = content.split("\n").filter((line) => /^[-*]\s/.test(line.trim()));

  return bullets.map((bullet) => {
    const text = bullet.replace(/^[-*]\s*/, "").trim();
    // Try to extract time estimate (e.g., "(30 min)", "(2 hours)", "(~1 hour)")
    const timeMatch = text.match(/\(([^)]*(?:min|hour|hr|day|week)[^)]*)\)/i);

    return {
      action: timeMatch ? text.replace(timeMatch[0], "").trim() : text,
      timeEstimate: timeMatch?.[1] || null,
    };
  });
}

// =============================================================================
// ROADMAP PARSER - Week by week
// =============================================================================

export type RoadmapWeek = {
  week: number;
  theme: string;
  tasks: Array<{ text: string; checked: boolean }>;
};

export function parseRoadmap(content: string): RoadmapWeek[] {
  const weeks = content.split(/(?=^### Week \d)/gim).filter((s) => /^### Week/i.test(s));

  return weeks.map((weekContent, index) => {
    const themeMatch = weekContent.match(/^### Week \d+:\s*(.+)/i);
    const taskMatches = [...weekContent.matchAll(/- \[([ x])\]\s*(.+)/g)];

    return {
      week: index + 1,
      theme: themeMatch?.[1]?.trim() || `Week ${index + 1}`,
      tasks: taskMatches.map((m) => ({
        text: m[2].trim(),
        checked: m[1].toLowerCase() === "x",
      })),
    };
  });
}

// =============================================================================
// STOP DOING PARSER
// =============================================================================

export type StopItem = {
  action: string;
  reasoning: string;
};

export function parseStopDoing(content: string): StopItem[] {
  // Stop doing items can be bullet points or numbered
  const items: StopItem[] = [];
  const lines = content.split("\n");

  let currentAction = "";
  let currentReasoning = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for bullet or numbered item
    if (/^[-*\d.]\s/.test(trimmed)) {
      // Save previous item if exists
      if (currentAction) {
        items.push({ action: currentAction, reasoning: currentReasoning.trim() });
      }

      const bulletContent = trimmed.replace(/^[-*\d.]\s*/, "").trim();

      // Check for format: **Action**: Reasoning (all on one line)
      const inlineMatch = bulletContent.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
      if (inlineMatch) {
        currentAction = inlineMatch[1].trim();
        currentReasoning = inlineMatch[2].trim();
      } else {
        currentAction = bulletContent;
        currentReasoning = "";
      }
    } else if (currentAction && trimmed) {
      // Continuation of reasoning
      currentReasoning += " " + trimmed;
    }
  }

  // Don't forget the last item
  if (currentAction) {
    items.push({ action: currentAction, reasoning: currentReasoning.trim() });
  }

  return items;
}

// =============================================================================
// METRICS PARSER
// =============================================================================

export type Metric = {
  name: string;
  target: string | null;
  howToMeasure: string | null;
  whyItMatters: string | null;
};

export function parseMetrics(content: string): Metric[] {
  // Metrics can be bullet points with sub-bullets
  const metrics: Metric[] = [];
  const lines = content.split("\n");

  let currentMetric: Partial<Metric> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Main metric bullet
    if (/^[-*]\s/.test(trimmed) && !trimmed.startsWith("  ")) {
      if (currentMetric?.name) {
        metrics.push(currentMetric as Metric);
      }
      currentMetric = {
        name: trimmed.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim(),
        target: null,
        howToMeasure: null,
        whyItMatters: null,
      };
    }
    // Sub-bullet for details
    else if (currentMetric && /^\s+[-*]\s/.test(line)) {
      const detail = trimmed.replace(/^[-*]\s*/, "").trim();
      if (/target|benchmark|goal/i.test(detail)) {
        currentMetric.target = detail.replace(/^(target|benchmark|goal)[:\s]*/i, "").trim();
      } else if (/measure|track|how/i.test(detail)) {
        currentMetric.howToMeasure = detail.replace(/^(how to measure|track|how)[:\s]*/i, "").trim();
      } else if (/why|matter|important/i.test(detail)) {
        currentMetric.whyItMatters = detail.replace(/^(why|matter|important)[:\s]*/i, "").trim();
      }
    }
  }

  // Don't forget the last metric
  if (currentMetric?.name) {
    metrics.push(currentMetric as Metric);
  }

  return metrics;
}

// =============================================================================
// MARKDOWN TO HTML (simple, for PDF export)
// =============================================================================

// Escape HTML special characters to prevent XSS
function escapeHTML(str: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

export function markdownToHTML(md: string): string {
  // First escape all HTML to prevent XSS, then apply markdown transformations
  return escapeHTML(md)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- \[x\] (.+)$/gm, '<li class="checked">$1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="unchecked">$1</li>')
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^(?!<[h|u|l|p])/gm, "<p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>(<[hul])/g, "$1")
    .replace(/(<\/[hul][^>]*>)<\/p>/g, "$1");
}
