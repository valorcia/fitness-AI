"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CoachPortrait } from "./coach-portrait";
import { Button } from "@/components/ui/button";

export type CelebrationKind = "streak" | "level" | "badge" | "goal" | "session";

type Props = {
  open: boolean;
  onClose: () => void;
  kind: CelebrationKind;
  /** Big number / value to celebrate. */
  title: string;
  /** Description line below the title. */
  subtitle?: string;
  /** Coach line shown in a speech-style block. */
  coachLine: string;
  coachName: string;
  portraitUrl: string | null;
  fallbackKey?: string;
};

const EMOJI: Record<CelebrationKind, string> = {
  streak: "🔥",
  level: "⭐",
  badge: "🏅",
  goal: "🎯",
  session: "💪",
};

const ACCENT: Record<CelebrationKind, string> = {
  streak: "from-amber-400/30 via-orange-400/20 to-rose-400/20",
  level: "from-amber-400/30 via-yellow-400/20 to-amber-500/20",
  badge: "from-emerald-400/30 via-teal-400/20 to-cyan-400/20",
  goal: "from-violet-400/30 via-fuchsia-400/20 to-pink-400/20",
  session: "from-sky-400/30 via-blue-400/20 to-indigo-400/20",
};

/** Confetti as 20 random colored dots that drift down. Pure CSS, no deps. */
function ConfettiBurst() {
  const dots = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        hue: Math.floor(Math.random() * 360),
        size: 6 + Math.floor(Math.random() * 6),
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 320, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: d.duration, delay: d.delay, ease: "linear" }}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            background: `hsl(${d.hue} 80% 60%)`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen celebration overlay. Use after a workout, on a new streak day,
 * a level-up, a badge unlock, etc. The coach delivers the celebration line.
 */
export function CoachCelebration({
  open,
  onClose,
  kind,
  title,
  subtitle,
  coachLine,
  coachName,
  portraitUrl,
  fallbackKey,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${ACCENT[kind]} p-6 text-center shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <ConfettiBurst />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-background/50 hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10">
              <div className="mb-2 text-5xl" aria-hidden>
                {EMOJI[kind]}
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-3 text-left">
                <CoachPortrait
                  portraitUrl={portraitUrl}
                  name={coachName}
                  size="sm"
                  fallbackKey={fallbackKey}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {coachName}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug">{coachLine}</p>
                </div>
              </div>

              <Button className="mt-5 w-full" onClick={onClose}>
                Continuer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
