interface ToolMidCTAProps {
  text: string;
  buttonLabel: string;
  href: string;
}

/**
 * Inline mid-page CTA — just a centered sentence with a text link.
 * No background band, no uppercase, no visual weight.
 */
export function ToolMidCTA({ text, buttonLabel, href }: ToolMidCTAProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 md:py-16 text-center">
      <p className="text-lg md:text-xl text-foreground/70">
        {text}{" "}
        <a
          href={href}
          className="font-bold text-cta hover:underline underline-offset-4"
        >
          {buttonLabel} &rarr;
        </a>
      </p>
    </section>
  );
}
