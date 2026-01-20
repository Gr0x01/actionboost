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
  { id: "channel-strategy", label: "Channel Strategy", shortLabel: "Channels" },
  { id: "stop-doing", label: "Stop Doing", shortLabel: "Stop" },
  { id: "start-doing", label: "Start Doing", shortLabel: "Start" },
  { id: "this-week", label: "This Week", shortLabel: "This Week" },
  { id: "roadmap", label: "30-Day Roadmap", shortLabel: "Roadmap" },
  { id: "metrics-dashboard", label: "Metrics Dashboard", shortLabel: "Metrics" },
  { id: "content-templates", label: "Content Templates", shortLabel: "Templates" },
];

interface TableOfContentsProps {
  strategy: ParsedStrategy;
  variant?: "mobile" | "desktop";
  lockedSectionIds?: string[];
}

export function TableOfContents({ strategy, variant, lockedSectionIds = [] }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("executive-summary");
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const keepVisibleUntilScroll = useRef(false);

  // Filter sections based on what's actually in the strategy
  const availableSections = SECTIONS.filter((section) => {
    switch (section.id) {
      case "executive-summary": return !!strategy.executiveSummary;
      case "current-situation": return !!strategy.currentSituation;
      case "competitive-landscape": return !!strategy.competitiveLandscape;
      case "channel-strategy": return !!strategy.channelStrategy;
      case "stop-doing": return !!strategy.stopDoing;
      case "start-doing": return !!strategy.startDoing;
      case "this-week": return !!strategy.thisWeek;
      case "roadmap": return !!strategy.roadmap;
      case "metrics-dashboard": return !!strategy.metricsDashboard;
      case "content-templates": return !!strategy.contentTemplates;
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

  // Auto-scroll mobile nav to keep active button centered
  useEffect(() => {
    if (!mobileNavRef.current) return;

    const container = mobileNavRef.current;
    const activeButton = container.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
    if (activeButton) {
      const containerWidth = container.offsetWidth;
      const scrollLeft = activeButton.offsetLeft - (containerWidth / 2) + (activeButton.offsetWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeSection]);

  // Hide mobile nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      // Skip if we're in "keep visible" mode (after clicking a tab)
      if (keepVisibleUntilScroll.current) {
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;

      // Only hide after scrolling past the header area
      if (currentScrollY > 150) {
        setMobileNavVisible(scrollingUp);
      } else {
        setMobileNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Keep nav visible during programmatic scroll
      keepVisibleUntilScroll.current = true;
      setMobileNavVisible(true);

      const headerOffset = 140; // Account for sticky header + export bar + some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Re-enable hide behavior after scroll completes
      setTimeout(() => {
        keepVisibleUntilScroll.current = false;
      }, 800);
    }
  };

  // Mobile horizontal tabs - brutalist solid style
  const mobileNav = (
    <div
      className={`fixed top-14 left-0 right-0 z-40 bg-white border-b-[3px] border-foreground transition-opacity duration-200 ${
        mobileNavVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={mobileNavRef}
        className="relative flex overflow-x-auto scrollbar-hide"
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
                px-4 py-3 text-sm font-medium
                whitespace-nowrap transition-all duration-100 shrink-0
                border-b-4 -mb-[3px]
                ${isActive
                  ? "text-foreground border-cta bg-surface"
                  : "text-foreground/50 border-transparent hover:text-foreground hover:bg-surface/50"
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

  // Get locked sections from IDs
  const lockedSections = SECTIONS.filter((s) => lockedSectionIds.includes(s.id));

  // Desktop sidebar - brutalist left-border indicator
  const desktopNav = (
    <nav className="sticky top-36 h-fit">
      <div className="space-y-2">
        {availableSections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                w-full text-left pl-4 py-2 border-l-4 transition-all duration-150
                ${isActive
                  ? "border-cta opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80 hover:border-foreground/20"
                }
              `}
            >
              <span className="text-sm font-medium text-foreground">
                {section.label}
              </span>
            </button>
          );
        })}
        {lockedSections.length > 0 && (
          <>
            {lockedSections.map((section) => (
              <div
                key={section.id}
                className="w-full pl-4 py-2 border-l-4 border-transparent text-sm text-foreground/30 cursor-default"
              >
                {section.label}
              </div>
            ))}
          </>
        )}
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
