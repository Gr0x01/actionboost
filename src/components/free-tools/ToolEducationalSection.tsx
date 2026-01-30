interface EducationalBlock {
  title: string;
  content: React.ReactNode;
  accent?: "cta" | "muted";
}

interface ToolEducationalSectionProps {
  blocks: EducationalBlock[];
  boostPitch: React.ReactNode;
  boostAfterIndex: number;
}

/** Cycles through 4 spatial treatments for visual variety and width usage */
const treatments = ["split-card", "big-quote", "side-border", "tinted-wide"] as const;

export function ToolEducationalSection({ blocks, boostPitch, boostAfterIndex }: ToolEducationalSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-20 space-y-20">
      {blocks.map((block, i) => {
        const treatment = treatments[i % treatments.length];

        return (
          <div key={block.title}>
            {/* Treatment 1: Two-column card — big title left, content right */}
            {treatment === "split-card" && (
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-8 md:p-10 lg:p-12"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
                  <div className="md:col-span-2">
                    <div className="text-cta/20 text-7xl font-black leading-none mb-4 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {block.title}
                    </h2>
                  </div>
                  <div className="md:col-span-3 space-y-4 text-foreground/70 text-base md:text-lg leading-relaxed">
                    {block.content}
                  </div>
                </div>
              </div>
            )}

            {/* Treatment 2: Oversized title full-width, content pushed right */}
            {treatment === "big-quote" && (
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] max-w-4xl">
                  {block.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="hidden md:block md:col-span-1">
                    <div className="w-full h-1 bg-cta/30 mt-3 rounded-full" />
                  </div>
                  <div className="md:col-span-7 md:col-start-5 space-y-4 text-foreground/70 text-base md:text-lg leading-relaxed">
                    <div className="border-l-2 border-foreground/10 pl-6 md:border-l-0 md:pl-0">
                      {block.content}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Treatment 3: Bold left accent strip with two-column layout */}
            {treatment === "side-border" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0">
                <div
                  className={`md:col-span-4 md:border-l-4 md:pl-8 py-2 ${
                    block.accent === "cta"
                      ? "border-cta"
                      : block.accent === "muted"
                        ? "border-foreground/15"
                        : "border-cta/50"
                  }`}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {block.title}
                  </h2>
                </div>
                <div className="md:col-span-7 md:col-start-6 space-y-4 text-foreground/70 text-base md:text-lg leading-relaxed">
                  {block.content}
                </div>
              </div>
            )}

            {/* Treatment 4: Full-width tinted card with generous padding */}
            {treatment === "tinted-wide" && (
              <div
                className="bg-cta/5 border-2 border-cta/20 rounded-md p-8 md:p-10 lg:p-14"
                style={{ boxShadow: "3px 3px 0 rgba(232, 121, 43, 0.15)" }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 leading-tight max-w-2xl">
                  {block.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-foreground/70 text-base md:text-lg leading-relaxed">
                  {block.content}
                </div>
              </div>
            )}

            {i === boostAfterIndex && (
              <div className="mt-14">
                {boostPitch}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
