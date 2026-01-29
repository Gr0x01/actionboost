"use client"

import { useEffect, useRef } from "react"
import { usePostHog } from "posthog-js/react"
import { Header, Footer } from "@/components/layout"
import { ResearchProof, Objections, FooterCTA } from "@/components/landing"

export default function AdminHoneypot() {
  const posthog = usePostHog()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      posthog?.capture("honeypot_visited")
      hasTracked.current = true
    }
  }, [posthog])

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1">
        {/* Hero card */}
        <section className="py-10 sm:py-14 flex items-center justify-center">
          <div className="mx-auto max-w-lg w-full px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-foreground/20 bg-background shadow-[4px_4px_0_0_rgba(44,62,80,0.1)] overflow-hidden">
              {/* Terminal bar */}
              <div className="bg-surface border-b-2 border-foreground/10 px-4 py-2.5 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-foreground/20" />
                <span className="w-3 h-3 rounded-full bg-foreground/20" />
                <span className="w-3 h-3 rounded-full bg-foreground/20" />
                <span className="ml-3 font-mono text-xs text-foreground/40">
                  ~/.env.local
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <p className="font-mono text-xs text-foreground/40 mb-4 tracking-wide">
                  $ cat secrets.txt — no secrets found. just marketing.
                </p>

                <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3 leading-tight">
                  This is one of our marketing ideas.
                </h1>
                <p className="text-foreground/60 text-base leading-relaxed mb-6 max-w-lg">
                  Boost builds 30-day marketing plans with ideas like this
                  one — competitor research, channel gaps, and specific tactics
                  for your business. Not generic advice. $29, once.
                </p>

                {/* Discount code */}
                <div className="rounded-xl border-[3px] border-green-600 bg-green-50 p-4 shadow-[4px_4px_0_0_rgba(22,101,52,1)] relative">
                  <div className="absolute -top-3 left-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Credentials accepted
                  </div>
                  <p className="text-sm text-foreground mt-1">
                    Use code{" "}
                    <code className="font-mono font-bold bg-green-100 px-1.5 py-0.5 rounded text-green-800">
                      LEAKED
                    </code>{" "}
                    at checkout — <strong>$20 instead of $29</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResearchProof />
        <Objections />
        <FooterCTA />
      </main>

      <Footer />
    </div>
  )
}
