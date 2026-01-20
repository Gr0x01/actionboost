"use client";

import { ReactNode } from "react";
import { TableOfContents } from "@/components/results/TableOfContents";
import type { ParsedStrategy } from "@/lib/markdown/parser";
import type { TOCSection } from "@/lib/constants/toc-sections";

/** TOC config for strategy mode */
interface StrategyTocConfig {
  /** Strategy object - sections filtered based on which fields exist */
  strategy: ParsedStrategy;
  sections?: never;
  /** Section IDs to show as locked (grayed out, not clickable) */
  lockedSectionIds?: string[];
  /** Scroll threshold before mobile nav can hide (default: 150) */
  hideThreshold?: number;
}

/** TOC config for static sections mode */
interface StaticTocConfig {
  strategy?: never;
  /** Static sections array - sections filtered based on DOM presence */
  sections: TOCSection[];
  /** Section IDs to show as locked (grayed out, not clickable) */
  lockedSectionIds?: string[];
  /** Scroll threshold before mobile nav can hide (default: 150) */
  hideThreshold?: number;
}

interface ResultsLayoutProps {
  /** Table of contents configuration - requires either strategy OR sections */
  toc: StrategyTocConfig | StaticTocConfig;
  /**
   * Optional slots for additional content injection.
   *
   * Slot positioning:
   * - Mobile: topBanner → beforeToc → TOC (fixed) → hero → afterToc → content → bottomCta
   * - Desktop: topBanner → hero → afterToc → [sidebar: beforeToc + TOC] + [content + bottomCta]
   */
  slots?: {
    /**
     * Content shown before TOC navigation.
     * - Desktop: Appears above sticky TOC in the sidebar column
     * - Mobile: Appears above horizontal tab navigation
     * @example MagicLinkBanner for new checkouts
     */
    beforeToc?: ReactNode;
    /**
     * Content shown after TOC setup, before main content.
     * - Desktop: Full width, appears below hero and above the sidebar/content flex
     * - Mobile: Appears below the fixed TOC tabs
     * @example ExportBar, UpsellBanner
     */
    afterToc?: ReactNode;
    /**
     * Hero section for page introductions.
     * - Desktop: Full width within max-w-5xl container, above afterToc
     * - Mobile: Same positioning, after TOC
     * @example Blog hero with title, description, share buttons
     */
    hero?: ReactNode;
    /**
     * Full-width banner at the very top of the page.
     * - Both: Renders outside the main container, spans full width
     * @example Demo preview banner, maintenance notices
     */
    topBanner?: ReactNode;
    /**
     * Call-to-action section at the bottom of content.
     * - Both: Appears after children within the content column
     * @example "Get your own plan" CTA, upgrade prompts
     */
    bottomCta?: ReactNode;
  };
  /** Main content rendered in the primary content area */
  children: ReactNode;
}

/**
 * Unified layout component for results-style pages.
 *
 * Used by:
 * - /results/[runId] - paid results
 * - /free-results/[id] - free mini-audit
 * - /results/demo - demo page
 * - /share/[slug] - shared results
 * - /blog/our-growth-plan - blog post
 *
 * Features:
 * - Mobile: horizontal tab TOC below header
 * - Desktop: sidebar TOC with sticky positioning
 * - Slot-based API for flexible content injection
 */
export function ResultsLayout({
  toc,
  slots = {},
  children,
}: ResultsLayoutProps) {
  const { beforeToc, afterToc, hero, topBanner, bottomCta } = slots;

  return (
    <main className="flex-1">
      {/* Top banner slot (demo banner, upsell, etc.) */}
      {topBanner}

      <div className="mx-auto px-6">
        {/* Mobile TOC - full width horizontal tabs */}
        <div className="lg:hidden">
          {beforeToc}
          <TableOfContents
            {...toc}
            variant="mobile"
          />
        </div>

        {/* Desktop layout wrapper */}
        <div className="max-w-5xl mx-auto">
          {/* Hero slot (blog hero, etc.) */}
          {hero}

          {/* After TOC slot (ExportBar, etc.) - shown below hero on desktop */}
          {afterToc}

          {/* Sidebar + content flex */}
          <div className="lg:flex lg:gap-12 py-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:w-[180px] lg:flex-shrink-0">
              {beforeToc}
              <TableOfContents
                {...toc}
                variant="desktop"
              />
            </div>

            {/* Main content - extra padding for shadows on desktop */}
            <div className="flex-1 min-w-0 lg:pr-2 overflow-x-hidden">
              {children}

              {/* Bottom CTA slot (blog CTA, etc.) */}
              {bottomCta}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
