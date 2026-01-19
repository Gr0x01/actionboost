"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  MapPin,
  Users,
  XCircle,
  Rocket,
  Zap,
  Calendar,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ParsedStrategy } from "@/lib/markdown/parser";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const SECTIONS: Section[] = [
  { id: "executive-summary", label: "Executive Summary", shortLabel: "Summary", icon: Sparkles },
  { id: "current-situation", label: "Your Situation", shortLabel: "Situation", icon: MapPin },
  { id: "competitive-landscape", label: "Competition", shortLabel: "Competition", icon: Users },
  { id: "stop-doing", label: "Stop Doing", shortLabel: "Stop", icon: XCircle },
  { id: "start-doing", label: "Start Doing", shortLabel: "Start", icon: Rocket },
  { id: "quick-wins", label: "Quick Wins", shortLabel: "Quick Wins", icon: Zap },
  { id: "roadmap", label: "30-Day Roadmap", shortLabel: "Roadmap", icon: Calendar },
  { id: "metrics", label: "Metrics", shortLabel: "Metrics", icon: BarChart3 },
];

interface TableOfContentsProps {
  strategy: ParsedStrategy;
}

export function TableOfContents({ strategy }: TableOfContentsProps) {
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

  return (
    <>
      {/* Mobile: Horizontal scrolling tabs */}
      <div className="lg:hidden sticky top-[104px] z-30 -mx-6 px-2 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
        <div
          ref={mobileNavRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {availableSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                data-section={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all shrink-0
                  ${isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-muted hover:text-foreground hover:bg-surface/80"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {section.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Sticky left sidebar */}
      <nav className="hidden lg:block sticky top-32 h-fit">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-3">
            Contents
          </p>
          {availableSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-all text-left
                  ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
