"use client";

import { useEffect, useState, useRef } from "react";
import type { ParsedStrategy } from "@/lib/markdown/parser";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
}

const SECTIONS: Section[] = [
  { id: "executive-summary", label: "Executive Summary", shortLabel: "Summary" },
  { id: "current-situation", label: "Your Situation", shortLabel: "Situation" },
  { id: "competitive-landscape", label: "Competition", shortLabel: "Competition" },
  { id: "stop-doing", label: "Stop Doing", shortLabel: "Stop" },
  { id: "start-doing", label: "Start Doing", shortLabel: "Start" },
  { id: "quick-wins", label: "Quick Wins", shortLabel: "Quick Wins" },
  { id: "roadmap", label: "30-Day Roadmap", shortLabel: "Roadmap" },
  { id: "metrics", label: "Metrics", shortLabel: "Metrics" },
];

interface TableOfContentsProps {
  strategy: ParsedStrategy;
  variant?: "mobile" | "desktop";
}

export function TableOfContents({ strategy, variant }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("executive-summary");
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Filter sections based on what's actually in the strategy
  const availableSections = SECTIONS.filter((section) => {
    switch (section.id) {
      case "executive-summary": return !!strategy.executiveSummary;
      case "current-situation": return !!strategy.currentSituation;
      case "competitive-landscape": return !!strategy.competitiveLandscape;
      case "stop-doing": return !!strategy.stopDoing;
      case "start-doing": return !!strategy.startDoing;
      case "quick-wins": return !!strategy.quickWins;
      case "roadmap": return !!strategy.roadmap;
      case "metrics": return !!strategy.metricsToTrack;
      default: return false;
    }
  });

  // Scroll spy - watch which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    availableSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -70% 0px", // Trigger when section is in top 30% of viewport
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [availableSections]);

  // Auto-scroll mobile nav to keep active item visible
  useEffect(() => {
    if (!mobileNavRef.current) return;

    const activeButton = mobileNavRef.current.querySelector(`[data-section="${activeSection}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 140; // Account for sticky header + export bar + some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Mobile horizontal tabs
  const mobileNav = (
    <div className="sticky top-[104px] z-30 -mx-6 px-2 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
      <div
        ref={mobileNavRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {availableSections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              data-section={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                whitespace-nowrap transition-all shrink-0
                ${isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-muted hover:text-foreground hover:bg-surface/80"
                }
              `}
            >
              {section.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Desktop sidebar
  const desktopNav = (
    <nav className="sticky top-32 h-fit">
      <div className="space-y-1">
        {availableSections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                w-full px-3 py-2 rounded-lg text-sm
                transition-all text-left
                ${isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface"
                }
              `}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );

  // Render based on variant
  if (variant === "mobile") return mobileNav;
  if (variant === "desktop") return desktopNav;

  // Default: render both with responsive visibility
  return (
    <>
      <div className="lg:hidden">{mobileNav}</div>
      <div className="hidden lg:block">{desktopNav}</div>
    </>
  );
}
