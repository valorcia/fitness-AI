import { prisma } from "@/lib/prisma";

export type CoachLevel = 1 | 2 | 3 | 4 | 5;

export const COACH_LEVELS: Record<
  CoachLevel,
  { label: string; description: string; emoji: string; nextHint: string | null }
> = {
  1: {
    label: "Guide",
    description: "Vous faites connaissance. Le coach pose des questions, observe, apprend tes habitudes.",
    emoji: "🌱",
    nextHint: "Atteins 10 séances terminées ou 14 jours d'usage pour passer Mentor.",
  },
  2: {
    label: "Mentor",
    description: "Le coach connaît tes préférences. Il adapte les séances et te tutoie.",
    emoji: "🧭",
    nextHint: "Atteins 30 séances terminées pour passer Expert personnel.",
  },
  3: {
    label: "Expert personnel",
    description: "Le coach anticipe tes besoins, se réfère à ce que tu lui as déjà dit, débloque une 2e tenue.",
    emoji: "🎯",
    nextHint: "Atteins 90 jours + 50 séances pour passer Partenaire.",
  },
  4: {
    label: "Partenaire",
    description: "Relation établie. Le coach initie des conversations, célèbre les paliers, suit tes objectifs long terme.",
    emoji: "🤝",
    nextHint: "1 an d'usage pour atteindre Légende.",
  },
  5: {
    label: "Légende",
    description: "Un an ensemble. Ton complice, références partagées, carnet de bord annuel.",
    emoji: "👑",
    nextHint: null,
  },
};

export type CoachLevelInfo = {
  level: CoachLevel;
  completedWorkouts: number;
  daysSinceCreation: number;
  /** 0-100 — progress toward the next level. 100 when at level 5. */
  progressPercent: number;
};

/**
 * Compute the coach relationship level + progress toward the next milestone.
 * Heuristic: workouts completed + tenure. Both indexed queries.
 */
export async function computeCoachLevelInfo(userId: string): Promise<CoachLevelInfo> {
  const [workouts, daysSinceCreation] = await Promise.all([
    prisma.workout.count({ where: { userId, status: "COMPLETED" } }),
    prisma.user
      .findUnique({ where: { id: userId }, select: { createdAt: true } })
      .then((u) =>
        u?.createdAt
          ? Math.floor((Date.now() - u.createdAt.getTime()) / (24 * 3600 * 1000))
          : 0,
      ),
  ]);

  let level: CoachLevel;
  let progressPercent: number;

  if (daysSinceCreation >= 365) {
    level = 5;
    progressPercent = 100;
  } else if (daysSinceCreation >= 90 && workouts >= 50) {
    level = 4;
    // progress toward 365-day Legend
    progressPercent = Math.min(100, Math.floor((daysSinceCreation / 365) * 100));
  } else if (workouts >= 30) {
    level = 3;
    // progress toward 50 workouts + 90 days
    const wp = Math.min(1, workouts / 50);
    const dp = Math.min(1, daysSinceCreation / 90);
    progressPercent = Math.floor(((wp + dp) / 2) * 100);
  } else if (workouts >= 10 || daysSinceCreation >= 14) {
    level = 2;
    progressPercent = Math.floor((workouts / 30) * 100);
  } else {
    level = 1;
    // progress toward either 10 workouts OR 14 days, whichever is closer
    const wp = workouts / 10;
    const dp = daysSinceCreation / 14;
    progressPercent = Math.floor(Math.max(wp, dp) * 100);
  }

  return { level, completedWorkouts: workouts, daysSinceCreation, progressPercent };
}
