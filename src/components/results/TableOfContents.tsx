"use client";

import { useEffect, useState, useRef } from "react";
import type { ParsedStrategy } from "@/lib/markdown/parser";
import { STRATEGY_SECTIONS, type TOCSection } from "@/lib/constants/toc-sections";

/**
 * Maps section IDs to their corresponding ParsedStrategy field keys.
 * Used to check if a section has content in strategy mode.
 */
const SECTION_ID_TO_STRATEGY_KEY: Record<string, keyof ParsedStrategy> = {
  "executive-summary": "executiveSummary",
  "current-situation": "currentSituation",
  "competitive-landscape": "competitiveLandscape",
  "channel-strategy": "channelStrategy",
  "stop-doing": "stopDoing",
  "start-doing": "startDoing",
  "this-week": "thisWeek",
  "roadmap": "roadmap",
  "metrics-dashboard": "metricsDashboard",
  "content-templates": "contentTemplates",
};

/** Common props shared between both modes */
interface BaseTableOfContentsProps {
  /** Which variant to render */
  variant?: "mobile" | "desktop";
  /** Section IDs to show as locked (grayed out, not clickable) */
  lockedSectionIds?: string[];
  /** Scroll threshold before mobile nav can hide (default: 150) */
  hideThreshold?: number;
}

/** Props for strategy mode - sections filtered by strategy fields */
interface StrategyModeProps extends BaseTableOfContentsProps {
  /** Strategy object - sections are filtered based on which fields exist */
  strategy: ParsedStrategy;
  sections?: never;
}

/** Props for static mode - sections filtered by DOM presence */
interface StaticModeProps extends BaseTableOfContentsProps {
  strategy?: never;
  /** Static sections array - sections are filtered based on DOM presence */
  sections: TOCSection[];
}

/** Type-safe props requiring either strategy OR sections (not both, not neither) */
type TableOfContentsProps = StrategyModeProps | StaticModeProps;

/**
 * Unified Table of Contents component.
 *
 * Two modes:
 * 1. Strategy mode: Pass `strategy` prop, sections filtered by strategy fields
 * 2. Static mode: Pass `sections` prop, sections filtered by DOM presence
 */
export function TableOfContents({
  strategy,
  sections,
  variant,
  lockedSectionIds = [],
  hideThreshold = 150,
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [availableSections, setAvailableSections] = useState<TOCSection[]>([]);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const keepVisibleUntilScroll = useRef(false);
  const initialActiveSectionSet = useRef(false);

  // Determine which sections to use based on mode
  const baseSections = sections || STRATEGY_SECTIONS;

  // Filter sections based on mode
  useEffect(() => {
    let filtered: TOCSection[] = [];

    if (strategy) {
      // Strategy mode: filter based on strategy fields using the mapping
      filtered = baseSections.filter((section) => {
        const strategyKey = SECTION_ID_TO_STRATEGY_KEY[section.id];
        return strategyKey ? !!strategy[strategyKey] : false;
      });
    } else if (sections) {
      // Static mode: filter based on DOM presence
      filtered = sections.filter((section) => document.getElementById(section.id));
    }

    setAvailableSections(filtered);

    // Set initial active section only once
    if (filtered.length > 0 && !initialActiveSectionSet.current) {
      initialActiveSectionSet.current = true;
      setActiveSection(filtered[0].id);
    }
  }, [strategy, sections, baseSections]);

  // Scroll spy - watch which section is in view
  useEffect(() => {
    if (availableSections.length === 0) return;

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

      // Only hide after scrolling past the threshold
      if (currentScrollY > hideThreshold) {
        setMobileNavVisible(scrollingUp);
      } else {
        setMobileNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideThreshold]);

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

  if (availableSections.length === 0) return null;

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
  const lockedSections = baseSections.filter((s) => lockedSectionIds.includes(s.id));

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
