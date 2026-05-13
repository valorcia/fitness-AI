"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { CoachAppearance } from "@/lib/onboarding/coach-appearance";
import { pickBestPortrait } from "@/lib/onboarding/portrait-catalog";
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

const GESTURE: Record<
  Persona,
  { y?: (number | string)[]; rotate?: number[]; scale?: number[]; duration: number }
> = {
  FUN: { y: [0, -6, 0], rotate: [-1, 1, -1], duration: 1.8 },
  STRICT: { rotate: [0, 1.5, 0, -1.5, 0], duration: 4 },
  ZEN: { scale: [1, 1.02, 1], duration: 3.5 },
  MILITARY: { y: [0, -2, 0], rotate: [0, -2, 0, 2, 0], duration: 5 },
  ELITE: { y: [0, -3, 0], rotate: [-0.5, 0.5, -0.5], duration: 2.4 },
};

const OUTFIT_COLOR_HEX: Record<string, string> = {
  black: "#0F172A",
  white: "#F8FAFC",
  grey: "#9CA3AF",
  navy: "#1B3954",
  teal: "#14B8A6",
  green: "#16A34A",
  red: "#DC2626",
  orange: "#F97316",
  yellow: "#F59E0B",
  pink: "#EC4899",
  purple: "#8B5CF6",
};

export function CoachAvatarPreview({ appearance, persona, coachName, className }: Props) {
  const portrait = React.useMemo(() => pickBestPortrait(appearance), [appearance]);
  const motionProps = GESTURE[persona] ?? GESTURE.FUN;
  const accent =
    appearance.coachOutfitColor && appearance.coachOutfitColor !== "any"
      ? OUTFIT_COLOR_HEX[appearance.coachOutfitColor] ?? "#14B8A6"
      : "#14B8A6";

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-4 shadow-xl",
        className,
      )}
    >
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(180deg, ${accent}22 0%, ${accent}66 100%)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={portrait.id}
            src={portrait.imageUrl}
            alt={`Aperçu du coach ${coachName}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: motionProps.y,
              rotate: motionProps.rotate,
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              opacity: { duration: 0.35 },
              y: { duration: motionProps.duration, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: motionProps.duration, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.35 },
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-3 text-white">
          <div className="text-base font-semibold drop-shadow">{coachName || "Votre coach"}</div>
          <div className="text-xs opacity-80">{PERSONA_LABEL[persona]}</div>
        </div>
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
          <Sparkles className="h-3 w-3" /> Aperçu
        </span>
      </div>
      <p className="mt-3 px-1 text-center text-[11px] leading-snug text-muted-foreground">
        Aperçu non définitif. Le rendu final sera un portrait photoréaliste IA correspondant
        précisément à tes critères.
      </p>
    </div>
  );
}
