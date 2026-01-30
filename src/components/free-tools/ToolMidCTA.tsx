import { ArrowRight } from "lucide-react";

interface ToolMidCTAProps {
  text: string;
  buttonLabel: string;
  href: string;
}

export function ToolMidCTA({ text, buttonLabel, href }: ToolMidCTAProps) {
  return (
    <section className="text-center py-12 md:py-16 bg-cta/[0.04] border-y border-foreground/5">
      <p className="text-base font-semibold text-foreground/70 mb-4 tracking-wide uppercase">{text}</p>
      <a
        href={href}
        className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-5 py-2.5 text-sm rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
      >
        {buttonLabel}
        <ArrowRight className="w-4 h-4" />
      </a>
    </section>
  );
}
