"use client";

import { motion } from "framer-motion";
import { HeroSummaryCard } from "./HeroSummaryCard";

export function ExplainerSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-background to-surface">
      {/* Section header */}
      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
          How it works
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
          We turn{" "}
          <span className="font-black">all that noise</span>
          <br />
          into{" "}
          <span className="font-black text-cta">one clear plan.</span>
        </h2>
      </motion.div>

      {/* The result - summary card */}
      <motion.div
        className="relative z-10 mx-auto max-w-xl px-6"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <HeroSummaryCard visible={true} />
      </motion.div>

      {/* Bottom text */}
      <motion.div
        className="relative z-10 mx-auto max-w-2xl px-6 text-center mt-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-lg text-foreground/70">
          Data from <span className="font-semibold text-foreground">12+ platforms</span>,
          distilled into <span className="font-semibold text-foreground">24 specific actions</span>.
        </p>
      </motion.div>
    </section>
  );
}
