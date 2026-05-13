"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { buildAvatarUrl } from "@/lib/onboarding/avatar-mapper";
import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";
import { cn } from "@/lib/utils";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

type Props = {
  appearance: CoachAppearance;
  persona: Persona;
  coachName: string;
  className?: string;
};

const PERSONA_LABEL: Record<Persona, string> = {
  FUN: "Bienveillant",
  STRICT: "Exigeant",
  ZEN: "Apaisant",
  MILITARY: "Coach militaire",
  ELITE: "Mentor expert",
};

/**
 * Persona-driven gesture loop. Each persona has a distinct micro-motion
 * (translation + rotation) repeated indefinitely with a different rhythm.
 */
const GESTURE: Record<
  Persona,
  { y?: (number | string)[]; x?: number[]; rotate?: number[]; scale?: number[]; duration: number }
> = {
  FUN: {
    y: [0, -6, 0],
    rotate: [-1, 1, -1],
    duration: 1.6,
  },
  STRICT: {
    rotate: [0, 1.5, 0, -1.5, 0],
    duration: 4,
  },
  ZEN: {
    scale: [1, 1.025, 1],
    duration: 3.5,
  },
  MILITARY: {
    y: [0, -2, 0],
    rotate: [0, -2, 0, 2, 0],
    duration: 5,
  },
  ELITE: {
    y: [0, -3, 0],
    rotate: [-0.5, 0.5, -0.5],
    duration: 2.4,
  },
};

export function CoachAvatarPreview({ appearance, persona, coachName, className }: Props) {
  const url = React.useMemo(() => buildAvatarUrl(appearance, coachName || "coach"), [
    appearance,
    coachName,
  ]);
  const motionProps = GESTURE[persona] ?? GESTURE.FUN;

  return (
    <div
      className={cn(
        "sticky top-4 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
        <motion.img
          key={url}
          src={url}
          alt={`Aperçu du coach ${coachName}`}
          className="h-full w-full object-cover"
          loading="lazy"
          animate={{
            y: motionProps.y,
            x: motionProps.x,
            rotate: motionProps.rotate,
            scale: motionProps.scale,
          }}
          transition={{
            duration: motionProps.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
          <Sparkles className="h-3 w-3" /> Aperçu
        </span>
      </div>
      <div className="text-center">
        <div className="text-base font-semibold">{coachName || "Votre coach"}</div>
        <div className="text-xs text-muted-foreground">{PERSONA_LABEL[persona]}</div>
      </div>
      <p className="px-2 text-center text-[11px] leading-snug text-muted-foreground">
        L'aperçu se met à jour à chaque modification. Le rendu final sera un visage
        photoréaliste IA basé sur ces critères.
      </p>
    </div>
  );
}
