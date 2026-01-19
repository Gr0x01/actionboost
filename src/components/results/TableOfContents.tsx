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
  lockedSectionIds?: string[];
}

export function TableOfContents({ strategy, variant, lockedSectionIds = [] }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("executive-summary");
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const keepVisibleUntilScroll = useRef(false);

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

  // Update underline position when active section changes
  useEffect(() => {
    if (!mobileNavRef.current) return;

    const container = mobileNavRef.current;
    const activeButton = container.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
    if (activeButton) {
      // Update underline position
      setUnderlineStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });

      // Auto-scroll to keep active button centered
      const containerWidth = container.offsetWidth;
      const scrollLeft = activeButton.offsetLeft - (containerWidth / 2) + (activeButton.offsetWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeSection]);

  // Initialize underline position on mount
  useEffect(() => {
    if (!mobileNavRef.current) return;

    // Small delay to ensure buttons are rendered
    const timer = setTimeout(() => {
      const container = mobileNavRef.current;
      if (!container) return;

      const activeButton = container.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
      if (activeButton) {
        setUnderlineStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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

  // Mobile horizontal tabs
  const mobileNav = (
    <div
      className={`fixed top-16 left-0 right-0 z-40 px-4 bg-background/95 backdrop-blur-sm border-b border-border transition-opacity duration-200 ${
        mobileNavVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={mobileNavRef}
        className="relative flex gap-1 overflow-x-auto scrollbar-hide"
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
                px-3 py-3 text-sm font-medium
                whitespace-nowrap transition-colors shrink-0
                ${isActive ? "text-primary" : "text-muted hover:text-foreground"}
              `}
            >
              {section.shortLabel}
            </button>
          );
        })}
        {/* Sliding underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
        />
      </div>
    </div>
  );

  // Get locked sections from IDs
  const lockedSections = SECTIONS.filter((s) => lockedSectionIds.includes(s.id));

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
        {lockedSections.length > 0 && (
          <>
            {lockedSections.map((section) => (
              <div
                key={section.id}
                className="w-full px-3 py-2 text-sm text-muted/50 cursor-default"
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
