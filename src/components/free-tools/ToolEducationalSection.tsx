import { ArrowRight } from "lucide-react";
import { config } from "@/lib/config";

interface EducationalBlock {
  title: string;
  content: React.ReactNode;
}

interface ToolEducationalSectionProps {
  blocks: EducationalBlock[];
  boostPitch: {
    headline: string;
    description: string;
  };
  /** Insert the Boost pitch card after this block index (0-based) */
  boostAfterIndex: number;
}

/**
 * Typography-first educational content with numbered headings and orange
 * left-border accent. ONE consistent treatment for all blocks.
 */
export function ToolEducationalSection({
  blocks,
  boostPitch,
  boostAfterIndex,
}: ToolEducationalSectionProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 space-y-20 md:space-y-28">
      {blocks.map((block, i) => (
        <div key={block.title}>
          {/* Numbered heading with left accent */}
          <div className="border-l-4 border-cta pl-6 md:pl-8 mb-6">
            <span className="block text-6xl md:text-7xl font-black text-cta/15 leading-none select-none mb-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {block.title}
            </h2>
          </div>

          {/* Body prose — single column, readable width */}
          <div className="space-y-4 text-foreground/70 text-base md:text-lg leading-relaxed pl-6 md:pl-8">
            {block.content}
          </div>

          {/* Boost pitch after designated block */}
          {i === boostAfterIndex && (
            <div className="mt-16 md:mt-20 max-w-xl mx-auto">
              <div
                className="bg-foreground text-white rounded-md p-6 md:p-8"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.2)" }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-balance">
                  {boostPitch.headline}
                </h2>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  {boostPitch.description}
                </p>
                <a
                  href="/start"
                  className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-sm"
                >
                  Get my full Boost — {config.singlePrice}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="mt-3 text-white/40 text-xs">
                  One-time payment. No subscription.
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
