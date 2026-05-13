"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
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

function appearanceSignature(a: CoachAppearance, persona: Persona) {
  return [
    persona,
    a.coachPreferredGender,
    a.coachPreferredEthnicity,
    a.coachPreferredHairColor,
    a.coachPreferredHairStyle,
    a.coachPreferredFaceShape,
    a.coachPreferredEyeColor,
    a.coachPreferredEyeShape,
    a.coachPreferredSkinTone,
    a.coachPreferredMouth,
    a.coachPreferredNose,
    a.coachPreferredBodyHeight,
    a.coachPreferredBodyShape,
    a.coachOutfitTop,
    a.coachOutfitBottom,
    a.coachOutfitColor,
    a.coachOutfitStyle,
  ]
    .map((v) => v ?? "any")
    .join("|");
}

export function CoachAvatarPreview({ appearance, persona, coachName, className }: Props) {
  const fallback = React.useMemo(() => pickBestPortrait(appearance), [appearance]);
  const [generated, setGenerated] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const sig = appearanceSignature(appearance, persona);
  const lastFetchedSig = React.useRef<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (sig === lastFetchedSig.current) return;

    const handle = window.setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setFailed(false);

      fetch("/api/coach-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearance, persona }),
        signal: ac.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<{ url: string }>;
        })
        .then(({ url }) => {
          lastFetchedSig.current = sig;
          setGenerated(url);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setFailed(true);
        })
        .finally(() => setLoading(false));
    }, 1500);

    return () => window.clearTimeout(handle);
  }, [sig, appearance, persona]);

  const motionProps = GESTURE[persona] ?? GESTURE.FUN;
  const accent =
    appearance.coachOutfitColor && appearance.coachOutfitColor !== "any"
      ? OUTFIT_COLOR_HEX[appearance.coachOutfitColor] ?? "#14B8A6"
      : "#14B8A6";

  const imageUrl = generated ?? fallback.imageUrl;
  const imageKey = generated ?? fallback.id;

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-4 shadow-xl", className)}>
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl"
        style={{ background: `linear-gradient(180deg, ${accent}22 0%, ${accent}66 100%)` }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={imageKey}
            src={imageUrl}
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

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Génération du coach…</span>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-3 text-white">
          <div className="text-base font-semibold drop-shadow">{coachName || "Votre coach"}</div>
          <div className="text-xs opacity-80">{PERSONA_LABEL[persona]}</div>
        </div>

        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
          <Sparkles className="h-3 w-3" />
          {generated ? "IA" : "Aperçu"}
        </span>
      </div>

      <p className="mt-3 px-1 text-center text-[11px] leading-snug text-muted-foreground">
        {failed
          ? "Génération IA indisponible — un visuel approchant est affiché en attendant."
          : generated
            ? "Portrait généré par IA d'après tes critères. Modifie un attribut pour relancer."
            : "Aperçu provisoire. Le portrait IA se génère dès que tu ajustes un critère."}
      </p>
    </div>
  );
}
