"use client";

import { useEffect, useState, useCallback } from "react";

interface Framework {
  id: string;
  label: string;
  title: string;
  subtitle: string;
}

interface FrameworksNavProps {
  frameworks: Framework[];
}

export function FrameworksNav({ frameworks }: FrameworksNavProps) {
  const [activeFramework, setActiveFramework] = useState<string>(frameworks[0]?.id || "");

  // Throttled scroll-spy: track which card is closest to viewport center
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let closestId = frameworks[0]?.id || "";
        let closestDistance = Infinity;

        frameworks.forEach((framework) => {
          const element = document.querySelector(`[data-framework="${framework.id}"]`);
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestId = framework.id;
          }
        });

        setActiveFramework(closestId);
        ticking = false;
      });
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [frameworks]);

  const scrollToFramework = useCallback((id: string) => {
    const element = document.querySelector(`[data-framework="${id}"]`);
    if (element) {
      const headerOffset = 160;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <nav className="sticky top-36 space-y-4">
      {frameworks.map((framework) => {
        const isActive = activeFramework === framework.id;

        return (
          <button
            key={framework.id}
            onClick={() => scrollToFramework(framework.id)}
            className={`
              w-full text-left pl-5 border-l-4 transition-all duration-150
              ${isActive
                ? "border-cta opacity-100"
                : "border-transparent opacity-40 hover:opacity-70 hover:border-foreground/20"}
            `}
          >
            <span
              className={`
                font-mono text-[10px] uppercase tracking-[0.15em]
                ${isActive ? "text-cta font-semibold" : "text-foreground"}
              `}
            >
              {framework.label}
            </span>
            <h3 className="text-2xl font-black text-foreground mt-1">
              {framework.title}
            </h3>
            <p className="text-sm text-foreground/70 mt-1">
              {framework.subtitle}
            </p>
          </button>
        );
      })}
    </nav>
  );
}
