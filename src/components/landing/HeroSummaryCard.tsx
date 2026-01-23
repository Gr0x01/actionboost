"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface HeroSummaryCardProps {
  visible: boolean;
}

export function HeroSummaryCard({ visible }: HeroSummaryCardProps) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Fix Google Business listing", checked: true, week: 1 },
    { id: 2, text: "Set up review request flow", checked: true, week: 1 },
    { id: 3, text: "Optimize Instagram bio", checked: false, week: 1 },
    { id: 4, text: "Launch referral program", checked: false, week: 2 },
    { id: 5, text: "First Instagram Reel", checked: false, week: 2 },
  ]);

  const [showConfetti, setShowConfetti] = useState(false);
  const prevWeekCompletions = useRef({ week1: false, week2: false });

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  // Check for week completions
  const week1Tasks = tasks.filter(t => t.week === 1);
  const week2Tasks = tasks.filter(t => t.week === 2);
  const week1Complete = week1Tasks.every(t => t.checked);
  const week2Complete = week2Tasks.every(t => t.checked);

  // Trigger confetti when a week becomes complete
  useEffect(() => {
    const wasWeek1Complete = prevWeekCompletions.current.week1;
    const wasWeek2Complete = prevWeekCompletions.current.week2;

    if ((week1Complete && !wasWeek1Complete) || (week2Complete && !wasWeek2Complete)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }

    prevWeekCompletions.current = { week1: week1Complete, week2: week2Complete };
  }, [week1Complete, week2Complete]);

  const checkedCount = tasks.filter(t => t.checked).length;

  if (!visible) return null;

  return (
    <motion.div
      className="relative max-w-md mx-auto overflow-visible"
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Soft glow - the "clarity" moment */}
      <motion.div
        className="absolute -inset-6 -z-10 rounded-3xl blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          background:
            "radial-gradient(circle, rgba(230, 126, 34, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Big confetti burst behind card */}
      <AnimatePresence>
        {showConfetti && <BigConfettiBurst />}
      </AnimatePresence>

      {/* The card - Light Skeuomorphism */}
      <div
        className="relative z-10 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(165deg, #ffffff 0%, #FDFBF9 50%, #FAF7F4 100%)",
          boxShadow: `
            0 1px 2px rgba(0,0,0,0.04),
            0 4px 8px rgba(0,0,0,0.04),
            0 12px 24px rgba(0,0,0,0.06),
            0 -1px 0 rgba(255,255,255,0.8) inset
          `,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Header - clean typography */}
        <div className="px-6 pt-6 pb-4 border-b border-border/30">
          <p className="text-xs font-mono text-foreground/40 uppercase tracking-widest mb-1">
            Your result
          </p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            30-Day Growth Plan
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Week 1 */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs font-mono text-foreground/40 uppercase tracking-wide">
                Week 1
              </span>
              <span className="text-sm font-semibold text-foreground">
                Foundation
              </span>
            </div>
            <div className="space-y-2">
              {week1Tasks.map(task => (
                <TaskItem
                  key={task.id}
                  checked={task.checked}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.text}
                </TaskItem>
              ))}
            </div>
          </div>

          {/* Week 2 */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs font-mono text-foreground/40 uppercase tracking-wide">
                Week 2
              </span>
              <span className="text-sm font-semibold text-foreground">
                Quick Wins
              </span>
            </div>
            <div className="space-y-2">
              {week2Tasks.map(task => (
                <TaskItem
                  key={task.id}
                  checked={task.checked}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.text}
                </TaskItem>
              ))}
            </div>
          </div>

          {/* Fade hint */}
          <div className="relative">
            <div className="space-y-2 opacity-30">
              <TaskItem disabled>Week 3 actions...</TaskItem>
              <TaskItem disabled>Week 4 actions...</TaskItem>
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, #FAF7F4 100%)",
              }}
            />
          </div>

          {/* Bottom stats */}
          <div className="pt-4 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-bold text-foreground">{checkedCount}/24</span>
                <span className="text-foreground/50 ml-1">done</span>
              </div>
              <div>
                <span className="font-bold text-foreground">4</span>
                <span className="text-foreground/50 ml-1">weeks</span>
              </div>
              <div>
                <span className="font-bold text-cta">3</span>
                <span className="text-foreground/50 ml-1">priorities</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-cta font-medium text-sm">
              <span>Tailored to you</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskItem({
  children,
  checked,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2.5 text-sm w-full text-left
        ${disabled ? "cursor-default" : "cursor-pointer group"}
      `}
    >
      <div
        className={`
          w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
          transition-all duration-150
          ${checked
            ? "bg-cta"
            : disabled
              ? "border border-border/40 bg-transparent rounded-md"
              : "border-2 border-border/50 bg-white rounded-md group-hover:border-foreground/30"
          }
        `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
      </div>
      <span
        className={`
          transition-colors duration-150
          ${checked ? "text-foreground/40 line-through" : "text-foreground"}
          ${!disabled && !checked ? "group-hover:text-foreground/80" : ""}
        `}
      >
        {children}
      </span>
    </button>
  );
}

// Big confetti burst from behind the card
const CONFETTI_COLORS = ["#E67E22", "#F39C12", "#3498DB", "#9B59B6", "#1ABC9C", "#E74C3C", "#2ECC71"];

function BigConfettiBurst() {
  const particles = Array.from({ length: 70 }, (_, i) => {
    // Burst angle - full 360
    const angle = Math.random() * 360;
    const distance = 350 + Math.random() * 250; // 3-4x bigger

    // Horizontal movement - outward based on angle
    const midX = Math.cos((angle * Math.PI) / 180) * distance * 0.6;
    const finalX = Math.cos((angle * Math.PI) / 180) * distance;

    // Vertical arc: rise to peak, then fall
    // Peak height (negative = up) - scaled up
    const peakY = -180 - Math.random() * 200;
    // Final position - fall below start point
    const finalY = 280 + Math.random() * 150;

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    // Confetti paper dimensions - slightly larger
    const width = 10 + Math.random() * 12;
    const height = width * (0.4 + Math.random() * 0.4);

    // Tumbling rotation
    const rotateEnd = (Math.random() - 0.5) * 1080;

    const delay = Math.random() * 0.12;

    return { midX, finalX, peakY, finalY, color, width, height, rotateEnd, delay };
  });

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ overflow: "visible" }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-[1px]"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            marginLeft: -p.width / 2,
            marginTop: -p.height / 2,
            transformOrigin: "center",
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0, rotateX: 0 }}
          animate={{
            x: [0, p.finalX],
            y: [0, p.peakY, p.finalY],
            scale: [0, 1, 1],
            opacity: [1, 1, 0],
            rotate: p.rotateEnd,
            rotateX: 360,
          }}
          exit={{ opacity: 0 }}
          transition={{
            delay: p.delay,
            x: { duration: 3, ease: "easeOut" },
            y: { duration: 3, times: [0, 0.35, 1], ease: "easeInOut" },
            scale: { duration: 3, times: [0, 0.15, 1] },
            opacity: { duration: 3, times: [0, 0.7, 1] },
            rotate: { duration: 3, ease: "linear" },
            rotateX: { duration: 3, ease: "linear" },
          }}
        />
      ))}
    </div>
  );
}
