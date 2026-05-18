import type { PlanTier } from "@prisma/client";

export type Entitlements = {
  tier: PlanTier;
  weeklyWorkoutLimit: number | "unlimited";
  voiceCoach: boolean;
  outdoorAdvanced: boolean;
  nutritionAdvanced: boolean;
  analyticsAdvanced: boolean;
  elitePrograms: boolean;
  adsFree: boolean;
  prioritySupport: boolean;
  /** Allow uploading a custom photo + per-criteria avatar customization. FREE = 10 standard coaches only. */
  customAvatar: boolean;
};

/** Convenience: gate features by user's current tier. */
export function isPaid(tier: PlanTier): boolean {
  return tier !== "FREE";
}

export const ENTITLEMENTS: Record<PlanTier, Entitlements> = {
  FREE: {
    tier: "FREE",
    weeklyWorkoutLimit: 3,
    voiceCoach: false,
    outdoorAdvanced: false,
    nutritionAdvanced: false,
    analyticsAdvanced: false,
    elitePrograms: false,
    adsFree: false,
    prioritySupport: false,
    customAvatar: false,
  },
  PREMIUM: {
    tier: "PREMIUM",
    weeklyWorkoutLimit: "unlimited",
    voiceCoach: true,
    outdoorAdvanced: true,
    nutritionAdvanced: false,
    analyticsAdvanced: false,
    elitePrograms: false,
    adsFree: true,
    prioritySupport: false,
    customAvatar: true,
  },
  PRO: {
    tier: "PRO",
    weeklyWorkoutLimit: "unlimited",
    voiceCoach: true,
    outdoorAdvanced: true,
    nutritionAdvanced: true,
    analyticsAdvanced: true,
    elitePrograms: false,
    adsFree: true,
    prioritySupport: true,
    customAvatar: true,
  },
  ELITE: {
    tier: "ELITE",
    weeklyWorkoutLimit: "unlimited",
    voiceCoach: true,
    outdoorAdvanced: true,
    nutritionAdvanced: true,
    analyticsAdvanced: true,
    elitePrograms: true,
    adsFree: true,
    prioritySupport: true,
    customAvatar: true,
  },
};

export const PLANS = [
  {
    tier: "FREE" as const,
    name: "Free",
    priceEur: 0,
    tagline: "Commence sans friction.",
    features: [
      "3 séances / semaine",
      "Coach texte basique",
      "Stats essentielles",
      "Publicité légère",
    ],
  },
  {
    tier: "PREMIUM" as const,
    name: "Premium",
    priceEur: 9.9,
    tagline: "Le coach IA sans limite.",
    features: [
      "Séances illimitées",
      "Coach vocal + personnalités",
      "Plans IA adaptatifs",
      "Outdoor GPS complet",
      "Sans publicité",
    ],
    highlighted: true,
  },
  {
    tier: "PRO" as const,
    name: "Pro",
    priceEur: 19.9,
    tagline: "Nutrition + performance.",
    features: [
      "Nutrition avancée",
      "Récupération intelligente",
      "Analytics poussées",
      "Multi-objectifs",
      "Support prioritaire",
    ],
  },
  {
    tier: "ELITE" as const,
    name: "Elite",
    priceEur: 29.9,
    tagline: "Expérience de coach privé.",
    features: [
      "Avatar & voix ultra personnalisés",
      "Programmes experts signés",
      "Accès bêta features",
      "Tout Pro inclus",
    ],
  },
];
