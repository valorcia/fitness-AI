import type { ExerciseCategory } from "@prisma/client";

export const CATEGORY_META: Record<
  ExerciseCategory,
  { label: string; emoji: string; colorFrom: string; colorTo: string }
> = {
  LOWER: { label: "Bas du corps", emoji: "🦵", colorFrom: "#3b82f6", colorTo: "#06b6d4" },
  UPPER_PUSH: { label: "Push haut", emoji: "💪", colorFrom: "#ef4444", colorTo: "#f97316" },
  UPPER_PULL: { label: "Pull haut", emoji: "🏋️", colorFrom: "#8b5cf6", colorTo: "#ec4899" },
  FULL_BODY: { label: "Full body", emoji: "⚡", colorFrom: "#f59e0b", colorTo: "#ef4444" },
  CORE: { label: "Core", emoji: "🔥", colorFrom: "#f43f5e", colorTo: "#f59e0b" },
  CARDIO: { label: "Cardio", emoji: "🏃", colorFrom: "#10b981", colorTo: "#22d3ee" },
  MOBILITY: { label: "Mobilité", emoji: "🧘", colorFrom: "#6366f1", colorTo: "#a855f7" },
};

export function categoryColorFrom(c: ExerciseCategory) {
  return CATEGORY_META[c]?.colorFrom ?? "#3b82f6";
}
export function categoryColorTo(c: ExerciseCategory) {
  return CATEGORY_META[c]?.colorTo ?? "#22d3ee";
}
export function categoryEmoji(c: ExerciseCategory) {
  return CATEGORY_META[c]?.emoji ?? "🏋️";
}
