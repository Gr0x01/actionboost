import type { TargetAudienceOutput } from "@/lib/ai/target-audience";

interface Props {
  output: TargetAudienceOutput;
}

export function AudienceProfileDisplay({ output }: Props) {
  const pa = output.primaryAudience;
  const mg = output.messagingGuide;

  return (
    <>
      {/* Demographics + Psychographics — 2 col */}
      <div className="border-t-[3px] border-foreground mb-10" />

      <section className="pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Demographics */}
          <div
            className="bg-background border-2 border-foreground/20 rounded-md p-6"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              Demographics
            </span>
            <div className="space-y-3 text-sm">
              <div><span className="font-bold text-foreground">Age:</span> <span className="text-foreground/70">{pa.demographics.ageRange}</span></div>
              <div><span className="font-bold text-foreground">Gender:</span> <span className="text-foreground/70">{pa.demographics.gender}</span></div>
              <div><span className="font-bold text-foreground">Income:</span> <span className="text-foreground/70">{pa.demographics.income}</span></div>
              <div><span className="font-bold text-foreground">Education:</span> <span className="text-foreground/70">{pa.demographics.education}</span></div>
              <div><span className="font-bold text-foreground">Location:</span> <span className="text-foreground/70">{pa.demographics.location}</span></div>
            </div>
          </div>

          {/* Psychographics */}
          <div
            className="bg-background border-2 border-foreground/20 rounded-md p-6"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              Psychographics
            </span>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold text-foreground block mb-1">Values</span>
                <div className="flex flex-wrap gap-1.5">
                  {pa.psychographics.values.map((v, i) => (
                    <span key={i} className="text-xs bg-foreground/5 text-foreground/70 px-2 py-1 rounded">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-foreground block mb-1">Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {pa.psychographics.interests.map((v, i) => (
                    <span key={i} className="text-xs bg-foreground/5 text-foreground/70 px-2 py-1 rounded">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-foreground block mb-1">Lifestyle</span>
                <p className="text-foreground/70">{pa.psychographics.lifestyle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points, Buying Triggers, Objections — 3 column grid */}
      <section className="pb-12">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-background border border-foreground/15 rounded-md p-5" style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}>
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 block mb-3">Pain points</span>
            <ul className="space-y-2.5">
              {pa.painPoints.map((p, i) => (
                <li key={i} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background border border-foreground/15 rounded-md p-5" style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}>
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 block mb-3">Buying triggers</span>
            <ul className="space-y-2.5">
              {pa.buyingTriggers.map((t, i) => (
                <li key={i} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />{t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background border border-foreground/15 rounded-md p-5" style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}>
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 block mb-3">Objections</span>
            <ul className="space-y-2.5">
              {pa.objections.map((o, i) => (
                <li key={i} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Where to Find Them */}
      <section className="pb-12">
        <div className="border-t-[3px] border-foreground mb-10" />
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">Where to find them</span>
        <div className="grid md:grid-cols-2 gap-4">
          {pa.whereToFind.map((w, i) => (
            <div key={i} className="bg-background border border-foreground/15 rounded-md p-4" style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.06)" }}>
              <p className="text-sm font-bold text-foreground mb-1">{w.platform}</p>
              <p className="text-sm text-foreground/65 leading-relaxed">{w.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Day in the Life */}
      <section className="pb-12">
        <div className="bg-foreground/[0.03] border-2 border-foreground/10 rounded-md p-6 md:p-8" style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">A day in their life</span>
          <p className="font-serif text-[17px] lg:text-[18px] leading-[1.75] text-foreground/85">{pa.dayInTheLife}</p>
        </div>
      </section>

      {/* Messaging Guide */}
      <section className="pb-12">
        <div className="border-t-[3px] border-foreground mb-10" />
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-8">Messaging guide</span>

        <div className="mb-8">
          <p className="text-base font-bold text-foreground mb-3">Hook examples</p>
          <div className="space-y-3">
            {mg.hookExamples.map((h, i) => (
              <div key={i} className="border-l-[3px] border-cta/40 bg-cta/[0.04] pl-4 py-3 pr-4 rounded-r-md">
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">&ldquo;{h}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-base font-bold text-foreground mb-2">Tone advice</p>
          <p className="text-sm text-foreground/70 leading-relaxed">{mg.toneAdvice}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Words to use</p>
            <div className="flex flex-wrap gap-2">
              {mg.wordsToUse.map((w, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded font-medium">{w}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Words to avoid</p>
            <div className="flex flex-wrap gap-2">
              {mg.wordsToAvoid.map((w, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded font-medium line-through decoration-red-300">{w}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Insight */}
      <section className="pb-12">
        <div className="bg-foreground/[0.03] border-2 border-foreground/10 rounded-md p-6" style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">Competitor insight</span>
          <p className="font-serif text-[17px] leading-[1.75] text-foreground/85">{output.competitorInsight}</p>
        </div>
      </section>
    </>
  );
}
