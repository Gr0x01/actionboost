"use client";

import { useEffect, useRef, useState } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
}

export function Marquee({ children, className = "" }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Start visible to avoid flash

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Use class-based pause so CSS hover rules can still override
  return (
    <div
      ref={ref}
      className={`${className} ${!isVisible ? "marquee-paused" : ""}`}
    >
      {children}
    </div>
  );
}
