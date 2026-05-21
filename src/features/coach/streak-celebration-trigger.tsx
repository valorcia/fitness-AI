"use client";

import * as React from "react";
import { CoachCelebration } from "./coach-celebration";

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

type Props = {
  currentStreak: number;
  coachName: string;
  persona: Persona;
  portraitUrl: string | null;
  fallbackKey: string;
};

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

const COACH_LINE: Record<Persona, (n: number) => string> = {
  FUN: (n) => `${n} jours d'affilée, c'est génial ! Continue exactement comme ça 🎉`,
  STRICT: (n) => `${n} jours sans faillir. Maintenant, on ne s'arrête plus.`,
  ZEN: (n) => `${n} jours dans une belle régularité. Ressens cette constance.`,
  MILITARY: (n) => `${n} jours sans rupture. Discipline exemplaire, soldat.`,
  ELITE: (n) => `${n} jours de constance — c'est ainsi que se forgent les vrais athlètes.`,
};

function reachedMilestone(streak: number): number | null {
  // Return the highest milestone the user has just hit (exactly equals).
  return MILESTONES.find((m) => streak === m) ?? null;
}

const STORAGE_KEY = "coach.streak.celebrated";

function loadSeen(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveSeen(set: Set<number>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* localStorage may be disabled — non-fatal */
  }
}

/**
 * Renders a celebration overlay once per streak milestone reached. Uses
 * localStorage to avoid replaying the celebration on every dashboard view.
 *
 * Mounted on the dashboard so the user sees the celebration the next time
 * they open the app after hitting a milestone.
 */
export function StreakCelebrationTrigger({
  currentStreak,
  coachName,
  persona,
  portraitUrl,
  fallbackKey,
}: Props) {
  const milestone = reachedMilestone(currentStreak);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!milestone) return;
    const seen = loadSeen();
    if (seen.has(milestone)) return;
    setOpen(true);
  }, [milestone]);

  const handleClose = React.useCallback(() => {
    if (milestone) {
      const seen = loadSeen();
      seen.add(milestone);
      saveSeen(seen);
    }
    setOpen(false);
  }, [milestone]);

  if (!milestone) return null;

  return (
    <CoachCelebration
      open={open}
      onClose={handleClose}
      kind="streak"
      title={`${milestone} jours d'affilée !`}
      subtitle="Ta régularité fait toute la différence."
      coachLine={COACH_LINE[persona](milestone)}
      coachName={coachName}
      portraitUrl={portraitUrl}
      fallbackKey={fallbackKey}
    />
  );
}
