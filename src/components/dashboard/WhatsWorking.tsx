"use client"

interface WhatsWorkingProps {
  output: string | null
}

/**
 * "What's working" panel — extracts key insights from the strategy output.
 * Shows a summarized view of what the strategy found is working/not working.
 */
export function WhatsWorking({ output }: WhatsWorkingProps) {
  // Extract relevant sections from markdown output
  const insights = extractInsights(output)

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6 h-full"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <h2 className="text-lg font-bold text-foreground mb-4">What&apos;s working</h2>

      {insights.length === 0 ? (
        <p className="text-sm text-foreground/50">
          Insights will appear here once your strategy is ready.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                insight.type === "working" ? "bg-green-500" : insight.type === "stop" ? "bg-red-400" : "bg-cta"
              }`} />
              <p className="text-sm text-foreground/70 leading-relaxed">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type InsightType = "working" | "stop" | "start"

function extractInsights(output: string | null): Array<{ type: InsightType; text: string }> {
  if (!output) return []

  const insights: Array<{ type: InsightType; text: string }> = []

  // Look for "Stop Doing" section
  const stopMatch = output.match(/##\s*(?:Stop Doing|What to Stop)[^\n]*\n([\s\S]*?)(?=\n##|\n---|$)/i)
  if (stopMatch) {
    const items = stopMatch[1].match(/[-*]\s+\*?\*?([^*\n]+)\*?\*?/g)
    items?.slice(0, 2).forEach((item) => {
      const text = item.replace(/^[-*]\s+\*?\*?/, "").replace(/\*?\*?\s*$/, "").trim()
      if (text) insights.push({ type: "stop", text })
    })
  }

  // Look for "Start Doing" section
  const startMatch = output.match(/##\s*(?:Start Doing|What to Start)[^\n]*\n([\s\S]*?)(?=\n##|\n---|$)/i)
  if (startMatch) {
    const items = startMatch[1].match(/[-*]\s+\*?\*?([^*\n]+)\*?\*?/g)
    items?.slice(0, 3).forEach((item) => {
      const text = item.replace(/^[-*]\s+\*?\*?/, "").replace(/\*?\*?\s*$/, "").trim()
      if (text) insights.push({ type: "start", text })
    })
  }

  // Look for "working" mentions
  const workingMatch = output.match(/(?:what'?s working|working well|going well)[^\n]*\n([\s\S]*?)(?=\n##|\n---|$)/i)
  if (workingMatch) {
    const items = workingMatch[1].match(/[-*]\s+\*?\*?([^*\n]+)\*?\*?/g)
    items?.slice(0, 2).forEach((item) => {
      const text = item.replace(/^[-*]\s+\*?\*?/, "").replace(/\*?\*?\s*$/, "").trim()
      if (text) insights.push({ type: "working", text })
    })
  }

  return insights.slice(0, 6)
}
