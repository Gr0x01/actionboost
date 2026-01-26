"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

/**
 * Free Audit Loading State
 *
 * Uses the same terminal-style typewriter pattern as StatusMessage,
 * but with simulated stages (no backend data).
 *
 * Design: Soft Brutalist - matches paid processing page.
 */

// Simulated stages with timing (cumulative seconds)
const STAGES = [
  { text: "Reading your business context", delay: 0, duration: 8 },
  { text: "Identifying quick opportunities", delay: 8, duration: 10 },
  { text: "Spotting positioning gaps", delay: 18, duration: 8 },
  { text: "Drafting your preview", delay: 26, duration: 6 },
] as const;

interface CompletedStage {
  text: string;
  timestamp: number;
}

export function FreeAuditPending() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedStages, setCompletedStages] = useState<CompletedStage[]>([]);
  const [displayedText, setDisplayedText] = useState("");

  const currentStageRef = useRef<string>("");
  const typingIndexRef = useRef<number>(0);

  // Progress timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine current stage based on elapsed time
  const currentStage = STAGES.find(
    (s) => elapsedSeconds >= s.delay && elapsedSeconds < s.delay + s.duration
  );
  const currentStageText = currentStage?.text ||
    (elapsedSeconds < 45 ? "Finalizing..." : "Still working, almost there...");

  // Typewriter effect - matches StatusMessage pattern
  useEffect(() => {
    if (!currentStageText) return;

    // If this is a NEW stage, handle the transition
    if (currentStageText !== currentStageRef.current) {
      // Complete previous stage and add to history
      if (currentStageRef.current) {
        const completedText = currentStageRef.current;
        setCompletedStages((prev) => {
          const updated = [...prev, { text: completedText, timestamp: Date.now() }];
          return updated.slice(-3); // Keep last 3
        });
      }

      // Start fresh for new stage
      currentStageRef.current = currentStageText;
      typingIndexRef.current = 0;
      setDisplayedText("");
    }

    // Typing animation loop
    let animationId: number;
    let lastTime = 0;
    const charDelay = 25; // ms per character

    const animate = (time: number) => {
      if (currentStageRef.current !== currentStageText) return;

      if (time - lastTime >= charDelay) {
        lastTime = time;

        if (typingIndexRef.current < currentStageText.length) {
          typingIndexRef.current++;
          setDisplayedText(currentStageText.slice(0, typingIndexRef.current));
        }
      }

      if (typingIndexRef.current < currentStageText.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    if (typingIndexRef.current < currentStageText.length) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [currentStageText]);

  return (
    <div className="w-full max-w-lg mx-auto text-center py-16 px-6">
      {/* Header */}
      <p className="text-xs font-bold uppercase tracking-widest text-cta mb-3">
        Free Preview
      </p>
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-8">
        Taking a quick look...
      </h1>

      {/* Terminal-style activity display */}
      <div className="w-full rounded-none border-[3px] border-foreground bg-foreground/5 p-6 shadow-[4px_4px_0_0_rgba(44,62,80,1)] text-left mb-6">
        {/* Completed stages history */}
        {completedStages.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {completedStages.map((completed, idx) => (
              <div
                key={completed.timestamp}
                className="font-mono text-sm text-foreground/40 flex items-center gap-2 transition-opacity duration-500"
                style={{
                  opacity: 0.25 + idx * 0.15,
                }}
              >
                <Check className="w-3 h-3 text-green-500/60 flex-shrink-0" />
                <span className="truncate">{completed.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current action with typewriter effect */}
        <div className="font-mono text-sm sm:text-base text-foreground min-h-[1.5rem]">
          <span className="text-cta font-semibold">&gt;</span>{" "}
          <span>{displayedText || currentStageText}</span>
          <span className="inline-block w-2 h-4 bg-cta ml-1 animate-[cursor-blink_1s_step-end_infinite]" />
        </div>
      </div>

      {/* Time estimate */}
      <p className="text-sm text-foreground/50">
        About 30 seconds. We&apos;ll show your results automatically.
      </p>
    </div>
  );
}
