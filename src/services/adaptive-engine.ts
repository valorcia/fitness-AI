import type { WorkoutFeedback, Workout } from "@prisma/client";

export type AdaptiveAdjustment = {
  loadMultiplier: number; // 1.0 = same, >1 = heavier
  volumeMultiplier: number;
  restMultiplier: number;
  recommendation: string;
  deload: boolean;
};

/**
 * Simple heuristic: adjust next session based on last feedback.
 * Extend with RL / personalised model in a later sprint.
 */
export function computeAdjustment(
  feedback: WorkoutFeedback,
  lastWorkout: Workout,
): AdaptiveAdjustment {
  let load = 1;
  let volume = 1;
  let rest = 1;
  let deload = false;
  const notes: string[] = [];

  if (feedback.pain) {
    load = 0.8;
    volume = 0.8;
    rest = 1.2;
    deload = true;
    notes.push("Douleur signalée : deload + mobilité conseillée.");
  } else if (feedback.difficulty >= 9 || feedback.energy <= 3) {
    load = 0.95;
    volume = 0.9;
    rest = 1.15;
    notes.push("Fatigue élevée : réduction légère de la charge.");
  } else if (feedback.difficulty <= 4 && feedback.energy >= 7 && feedback.soreness <= 3) {
    load = 1.05;
    volume = 1.05;
    notes.push("Bonne forme : progression +5%.");
  } else {
    notes.push("Maintien de la charge : stabilisation.");
  }

  if (feedback.soreness >= 8) {
    volume *= 0.9;
    rest *= 1.1;
    notes.push("Courbatures fortes : plus de récupération.");
  }

  if (feedback.motivation <= 3) {
    notes.push("Motivation basse : séance plus courte et variée proposée.");
    volume *= 0.9;
  }

  if (lastWorkout.perceivedLoad && lastWorkout.perceivedLoad >= 9) {
    notes.push("RPE élevée précédente : sécurisation du volume.");
    volume = Math.min(volume, 0.95);
  }

  return {
    loadMultiplier: round(load),
    volumeMultiplier: round(volume),
    restMultiplier: round(rest),
    recommendation: notes.join(" "),
    deload,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
